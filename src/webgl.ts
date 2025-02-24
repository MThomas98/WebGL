const WIDTH: number = 640;
const HEIGHT: number = 480;

import { vec2, mat4, vec3 } from "gl-matrix";
import { ajax } from "jquery";

interface IProgramInfomation
{
    program: WebGLProgram,
    attributeLocation:
    {
        vertex: GLint
    },
    uniformLocation:
    {
        model: WebGLUniformLocation,
        color: WebGLUniformLocation,
        scale: WebGLUniformLocation
    },
}

async function readFile(path : string) : Promise<string | null>
{
    var result = "";
    await ajax({
        url: location.origin + "/" + path,
        async: true,
        success: function (message)
        {
            result = message;
        },
    });

    if (result.length == 0)
    {
        alert(`Failed to read ${path}`);
        return null;
    }

    console.log(`readFile(${path}): \n${result}`);
    return result;
}

function randomFloat(min: number, max: number) : number
{
    return Math.random() * (max - min) + min;
}


function createShader(gl: WebGLRenderingContext, type: GLint, src: string) : WebGLShader | null
{
    var shader = gl.createShader(type);
    if (shader === null)
    {
        alert(`Failed to create shader (type = ${type})`);
        return null;
    }

    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert(`Failed to compile shader:\n${gl.getShaderInfoLog(shader)}`);
        return null;
    }

    return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string) : IProgramInfomation | null
{
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    if (vertexShader === null)
    {
        return null;
    }

    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    if (fragmentShader === null)
    {
        return null;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        alert(`Failed to link shader program:\n${gl.getProgramInfoLog(program)}`);
        return null;
    }

    return {
        program: program,
        attributeLocation:
        {
            vertex: gl.getAttribLocation(program, "aVertexPosition")
        },
        uniformLocation:
        {
            // TODO: null check, I got lazy
            model: <WebGLUniformLocation> gl.getUniformLocation(program, "uModel"),
            color: <WebGLUniformLocation> gl.getUniformLocation(program, "uColor"),
            scale: <WebGLUniformLocation> gl.getUniformLocation(program, "uScale"),
        }
    };
}

function setupGLDrawing(gl: WebGLRenderingContext)
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
}

function setupVertexBuffer(gl: WebGLRenderingContext, programInfo: IProgramInfomation)
{
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.enableVertexAttribArray(programInfo.attributeLocation.vertex);
    const size = 2;
    const type = gl.FLOAT;
    const normalise = false;
    const stride = 0; // 0 implies: move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;
    gl.vertexAttribPointer(programInfo.attributeLocation.vertex, size, type, normalise, stride, offset);
}

function drawRectangle(gl: WebGLRenderingContext, programInfo: IProgramInfomation, position: vec2, scale: vec2, color: vec3)
{
    const VERTICIES = 
    [
         0.5,  0.5,
        -0.5,  0.5,
        -0.5, -0.5,
    
        -0.5, -0.5,
         0.5, -0.5,
         0.5,  0.5
    ];

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [position[0], position[1], 0.0]);
    mat4.scale(modelMatrix, modelMatrix, [scale[0], scale[1], 1.0]);
    gl.uniformMatrix4fv(programInfo.uniformLocation.model, false, modelMatrix);

    gl.uniform3fv(programInfo.uniformLocation.color, color);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICIES), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, VERTICIES.length / 2);
}

async function main()
{
    const vertexShaderSrc = await readFile("shaders/vertex.vs");
    if (vertexShaderSrc === null)
    {
        return;
    }
    
    const fragmentShaderSrc = await readFile("shaders/fragment.fs");
    if (fragmentShaderSrc === null)
    {
        return;
    }

    const canvas = <HTMLCanvasElement | null> document.querySelector("#webgl-canvas");
    if (canvas === null)
    {
        alert("Failed to find WebGL canvas (#webgl-canvas)");
        return;
    }
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const gl = canvas.getContext("webgl");
    if (gl === null)
    {
        alert("Failed to obtain WebGL Context");
        return;
    }
    setupGLDrawing(gl);

    var programInfo = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    if (programInfo === null)
    {
        return;
    }
    gl.useProgram(programInfo.program);

    setupVertexBuffer(gl, programInfo);

    const WAIT_TIME_MS = 500;
    function timeout(gl: WebGLRenderingContext, programInfo: IProgramInfomation)
    {
        drawRectangle(gl, programInfo, 
            [randomFloat(-0.5, 0.5), randomFloat(-0.5, 0.5)], 
            [randomFloat(0, 1), randomFloat(0, 1)], 
            [randomFloat(0, 1), randomFloat(0, 1), randomFloat(0, 1)]);
        setTimeout(timeout, WAIT_TIME_MS, gl, programInfo);
    }
    timeout(gl, programInfo);
}

main();