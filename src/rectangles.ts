const WIDTH: number = 640;
const HEIGHT: number = 480;

import { vec2, mat4, vec3 } from "gl-matrix";

import { readFile, randomFloat } from "./utils";
import { createProgram, createContext } from "./webgl";

interface IRectangleProgramInfomation
{
    program: WebGLProgram,
    attributeLocation:
    {
        vertex: GLint,
    },
    uniformLocation:
    {
        model: WebGLUniformLocation,
        color: WebGLUniformLocation,
    },
}

function createProgramInformation(gl: WebGLRenderingContext, program: WebGLProgram) : IRectangleProgramInfomation
{
    return {
        program: program,
        attributeLocation:
        {
            vertex: gl.getAttribLocation(program, "aVertexPosition"),
        },
        uniformLocation:
        {
            model: <WebGLUniformLocation> gl.getUniformLocation(program, "uModel"),
            color: <WebGLUniformLocation> gl.getUniformLocation(program, "uColor"),
        }
    }
}

function setupGLDrawing(gl: WebGLRenderingContext)
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
}

function setupVertexBuffer(gl: WebGLRenderingContext, programInfo: IRectangleProgramInfomation)
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

function drawRectangle(gl: WebGLRenderingContext, programInfo: IRectangleProgramInfomation, position: vec2, scale: vec2, color: vec3)
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
    const gl = createContext("webgl-canvas", WIDTH, HEIGHT);
    if (gl === null)
    {
        return;
    }

    const vertexShaderSrc = await readFile("shaders/rectangles/vertex.vs");
    if (vertexShaderSrc === null)
    {
        return;
    }
    
    const fragmentShaderSrc = await readFile("shaders/rectangles/fragment.fs");
    if (fragmentShaderSrc === null)
    {
        return;
    }

    const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    if (program === null)
    {
        return;
    }
    const programInfo = createProgramInformation(gl, program);
    gl.useProgram(programInfo.program);

    setupVertexBuffer(gl, programInfo);

    const WAIT_TIME_MS = 500;
    function timeout(gl: WebGLRenderingContext, programInfo: IRectangleProgramInfomation)
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