const WIDTH: number = 640;
const HEIGHT: number = 480;

import { mat4, vec3, vec4 } from "gl-matrix";

import { readFile } from "./utils";
import { createProgram, createContext } from "./webgl";

const VERTICIES = 
[
    -0.5, -0.5, -0.5,  0.0, 0.0,
    0.5, -0.5, -0.5,  1.0, 0.0,
    0.5,  0.5, -0.5,  1.0, 1.0,
    0.5,  0.5, -0.5,  1.0, 1.0,
    -0.5,  0.5, -0.5,  0.0, 1.0,
    -0.5, -0.5, -0.5,  0.0, 0.0,

    -0.5, -0.5,  0.5,  0.0, 0.0,
    0.5, -0.5,  0.5,  1.0, 0.0,
    0.5,  0.5,  0.5,  1.0, 1.0,
    0.5,  0.5,  0.5,  1.0, 1.0,
    -0.5,  0.5,  0.5,  0.0, 1.0,
    -0.5, -0.5,  0.5,  0.0, 0.0,

    -0.5,  0.5,  0.5,  1.0, 0.0,
    -0.5,  0.5, -0.5,  1.0, 1.0,
    -0.5, -0.5, -0.5,  0.0, 1.0,
    -0.5, -0.5, -0.5,  0.0, 1.0,
    -0.5, -0.5,  0.5,  0.0, 0.0,
    -0.5,  0.5,  0.5,  1.0, 0.0,

    0.5,  0.5,  0.5,  1.0, 0.0,
    0.5,  0.5, -0.5,  1.0, 1.0,
    0.5, -0.5, -0.5,  0.0, 1.0,
    0.5, -0.5, -0.5,  0.0, 1.0,
    0.5, -0.5,  0.5,  0.0, 0.0,
    0.5,  0.5,  0.5,  1.0, 0.0,

    -0.5, -0.5, -0.5,  0.0, 1.0,
    0.5, -0.5, -0.5,  1.0, 1.0,
    0.5, -0.5,  0.5,  1.0, 0.0,
    0.5, -0.5,  0.5,  1.0, 0.0,
    -0.5, -0.5,  0.5,  0.0, 0.0,
    -0.5, -0.5, -0.5,  0.0, 1.0,

    -0.5,  0.5, -0.5,  0.0, 1.0,
    0.5,  0.5, -0.5,  1.0, 1.0,
    0.5,  0.5,  0.5,  1.0, 0.0,
    0.5,  0.5,  0.5,  1.0, 0.0,
    -0.5,  0.5,  0.5,  0.0, 0.0,
    -0.5,  0.5, -0.5,  0.0, 1.0
];

const COLORS = 
[
    1.0, 0, 0,
    1.0, 0, 0,
    1.0, 0, 0,
    1.0, 0, 0,
    1.0, 0, 0,
    1.0, 0, 0,

    0, 1.0, 0,
    0, 1.0, 0,
    0, 1.0, 0,
    0, 1.0, 0,
    0, 1.0, 0,
    0, 1.0, 0,

    0, 0, 1.0,
    0, 0, 1.0,
    0, 0, 1.0,
    0, 0, 1.0,
    0, 0, 1.0,
    0, 0, 1.0,

    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,

    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,

    1.0, 0, 1.0, 
    1.0, 0, 1.0, 
    1.0, 0, 1.0, 
    1.0, 0, 1.0, 
    1.0, 0, 1.0, 
    1.0, 0, 1.0, 
]

const FLOAT32_BYTES = 4;

const UP: vec3 = [0.0, 1.0, 0.0];

class Camera
{
    constructor(position: vec3, target: vec3)
    {
        this.position = position;
        this.target = target;
    }

    public getViewMatrix() : mat4 
    {
        // This is how it's calculated
        // const z = vec3.create();
        // vec3.sub(z, this.position, this.target);
        // vec3.normalize(z, z);

        // const x = vec3.create();
        // vec3.cross(x, z, UP);
        // vec3.normalize(x, x);

        // const y = vec3.create();
        // vec3.cross(y, z, x);
        // vec3.normalize(y, y);

        // return [x[0], x[1], x[2], 0,
        //         y[0], y[1], y[2], 0,
        //         z[0], z[1], z[2], 0,
        //         this.position[0], this.position[1], this.position[2], 1]

        const view = mat4.create();
        mat4.lookAt(view, this.position, this.target, UP);
        return view;
    }
    
    position: vec3 = vec3.create();
    target: vec3 = vec3.create();
}

interface ICubeProgramInformation
{
    program: WebGLProgram,
    attributeLocation:
    {
        vertex: GLint,
        color: GLint,
        texCoord: GLint,
    },
    uniformLocation:
    {
        projection: WebGLUniformLocation,
        model: WebGLUniformLocation,
        view: WebGLUniformLocation,
    },
}

// TODO: Integrate in to program informat
interface IBuffers
{
    vertex: WebGLBuffer,
    color: WebGLBuffer,
}

function createProgramInformation(gl: WebGLRenderingContext, program: WebGLProgram) : ICubeProgramInformation
{
    return {
        program: program,
        attributeLocation:
        {
            vertex: gl.getAttribLocation(program, "aVertexPosition"),
            color: gl.getAttribLocation(program, "aColor"),
            texCoord: gl.getAttribLocation(program, "aTexCoord"),
        },
        uniformLocation:
        {
            projection: <WebGLUniformLocation> gl.getUniformLocation(program, "uProjection"),
            model: <WebGLUniformLocation> gl.getUniformLocation(program, "uModel"),
            view: <WebGLUniformLocation> gl.getUniformLocation(program, "uView"),
        }
    }
}

function setupGLDrawing(gl: WebGLRenderingContext)
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    // TODO: Normals
    // VERTICIES isn't in the correct order so outward faces are considered inwards
    // This is just a workaround for now
    gl.disable(gl.CULL_FACE);
}

function setupBuffers(gl: WebGLRenderingContext, programInfo: ICubeProgramInformation) : IBuffers
{
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Vertex positions
    gl.enableVertexAttribArray(programInfo.attributeLocation.vertex);
    const vertexSize = 3;
    const vertexType = gl.FLOAT;
    const vertexNormalise = false;
    const vertexStride = 5 * FLOAT32_BYTES;
    const vertexOffset = 0;
    gl.vertexAttribPointer(programInfo.attributeLocation.vertex, vertexSize, vertexType, vertexNormalise, vertexStride, vertexOffset);

    // Texture Coords
    gl.enableVertexAttribArray(programInfo.attributeLocation.texCoord);
    const texCoordSize = 2;
    const texCoordType = gl.FLOAT;
    const texCoordNormalise = false;
    const texCoordStride = 5 * FLOAT32_BYTES;
    const texCoordOffset = 3 * FLOAT32_BYTES;
    gl.vertexAttribPointer(programInfo.attributeLocation.texCoord, texCoordSize, texCoordType, texCoordNormalise, texCoordStride, texCoordOffset);

    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    gl.enableVertexAttribArray(programInfo.attributeLocation.color);
    const colorSize = 3;
    const colorType = gl.FLOAT;
    const colorNormalise = false;
    const colorStride = 0; // 0 implies: move forward size * sizeof(type) each iteration to get the next position
    const colorOffset = 0;
    gl.vertexAttribPointer(programInfo.attributeLocation.color, colorSize, colorType, colorNormalise, colorStride, colorOffset);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        vertex: vertexBuffer,
        color: colorBuffer,
    }
}

function createTexture(gl: WebGLRenderingContext)
{
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    const image = new Image();
    image.src = "img/f-texture.png";
    image.addEventListener("load", function() 
    {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
}

function drawCube(
    gl: WebGLRenderingContext, 
    programInfo: ICubeProgramInformation,
    buffers: IBuffers,
    position: vec3, 
    rotation: vec3,
    scale: vec3,
    camera: Camera)
{
    const translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, position);
    mat4.scale(translationMatrix, translationMatrix, scale);
    mat4.rotateX(translationMatrix, translationMatrix, rotation[0]);
    mat4.rotateY(translationMatrix, translationMatrix, rotation[1]);
    mat4.rotateZ(translationMatrix, translationMatrix, rotation[2]);
    gl.uniformMatrix4fv(programInfo.uniformLocation.model, false, translationMatrix);

    gl.uniformMatrix4fv(programInfo.uniformLocation.view, false, camera.getViewMatrix());

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICIES), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(COLORS), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, VERTICIES.length / 3);
}

function drawLoop(gl: WebGLRenderingContext, programInfo: ICubeProgramInformation, buffers: IBuffers)
{
    const projectionMatrix = mat4.create();
    // mat4.ortho(projectionMatrix, 0, gl.canvas.width, gl.canvas.height, 0, 0.1, 10000);
    mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), gl.canvas.width / gl.canvas.height, 0.1, 100000);
    gl.uniformMatrix4fv(programInfo.uniformLocation.projection, false, projectionMatrix);

    const rotationSpeed = Math.PI / 2; // deg/s
    var rotationY = 0;

    const fpsElement = document.querySelector("#fps-counter");

    const cubePosition: vec3 = [0, 0, -1000];

    var lastTime = Date.now();
    function draw()
    {
        var deltaTime = (Date.now() - lastTime) / 1000; // In seconds
        lastTime = Date.now();

        if (fpsElement !== null)
        {
            fpsElement.innerHTML = `FPS: ${Math.round(1000 / deltaTime)}`;
        }
        
        drawCube(
            gl, programInfo, buffers,
            cubePosition, 
            [0, rotationY, Math.PI / 4],
            [200, 200, 200],
            new Camera([-100, 0, 0], cubePosition));

        rotationY += rotationSpeed * deltaTime;

        requestAnimationFrame(draw);
    }

    draw();
}

async function main()
{
    const gl = createContext("webgl-canvas", WIDTH, HEIGHT);
    if (gl === null)
    {
        return;
    }
    setupGLDrawing(gl);

    const vertexShaderSrc = await readFile("shaders/cube/vertex.vs");
    if (vertexShaderSrc === null)
    {
        return;
    }
    
    const fragmentShaderSrc = await readFile("shaders/cube/fragment.fs");
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

    const buffers = setupBuffers(gl, programInfo);

    createTexture(gl);

    drawLoop(gl, programInfo, buffers);
}

main();