const WIDTH: number = 640;
const HEIGHT: number = 480;

import { vec2, mat4, vec3 } from "gl-matrix";

import { readFile, randomFloat } from "./utils";
import { createProgram, createContext } from "./webgl";

const VERTICIES = 
[
    -0.5, -0.5, -0.5, // 0.0, 0.0,
    0.5, -0.5, -0.5,  //1.0, 0.0,
    0.5,  0.5, -0.5,  //1.0, 1.0,
    0.5,  0.5, -0.5,  //1.0, 1.0,
    -0.5,  0.5, -0.5,  //0.0, 1.0,
    -0.5, -0.5, -0.5,  //0.0, 0.0,

    -0.5, -0.5,  0.5,  //0.0, 0.0,
    0.5, -0.5,  0.5,  //1.0, 0.0,
    0.5,  0.5,  0.5,  //1.0, 1.0,
    0.5,  0.5,  0.5,  //1.0, 1.0,
    -0.5,  0.5,  0.5,  //0.0, 1.0,
    -0.5, -0.5,  0.5,  //0.0, 0.0,

    -0.5,  0.5,  0.5,  //1.0, 0.0,
    -0.5,  0.5, -0.5,  //1.0, 1.0,
    -0.5, -0.5, -0.5,  //0.0, 1.0,
    -0.5, -0.5, -0.5,  //0.0, 1.0,
    -0.5, -0.5,  0.5,  //0.0, 0.0,
    -0.5,  0.5,  0.5,  //1.0, 0.0,

    0.5,  0.5,  0.5,  //1.0, 0.0,
    0.5,  0.5, -0.5,  //1.0, 1.0,
    0.5, -0.5, -0.5,  //0.0, 1.0,
    0.5, -0.5, -0.5,  //0.0, 1.0,
    0.5, -0.5,  0.5,  //0.0, 0.0,
    0.5,  0.5,  0.5,  //1.0, 0.0,

    -0.5, -0.5, -0.5,  //0.0, 1.0,
    0.5, -0.5, -0.5,  //1.0, 1.0,
    0.5, -0.5,  0.5,  //1.0, 0.0,
    0.5, -0.5,  0.5,  //1.0, 0.0,
    -0.5, -0.5,  0.5,  //0.0, 0.0,
    -0.5, -0.5, -0.5,  //0.0, 1.0,

    -0.5,  0.5, -0.5,  //0.0, 1.0,
    0.5,  0.5, -0.5,  //1.0, 1.0,
    0.5,  0.5,  0.5,  //1.0, 0.0,
    0.5,  0.5,  0.5,  //1.0, 0.0,
    -0.5,  0.5,  0.5,  //0.0, 0.0,
    -0.5,  0.5, -0.5,  //0.0, 1.0
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

    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,

    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,

    1.0, 1.0, 0,
    1.0, 1.0, 0,
    1.0, 1.0, 0,
    1.0, 1.0, 0,
    1.0, 1.0, 0,
    1.0, 1.0, 0,
]


interface ICubeProgramInformation
{
    program: WebGLProgram,
    attributeLocation:
    {
        vertex: GLint,
        color: GLint
    },
    uniformLocation:
    {
        projection: WebGLUniformLocation,
        translation: WebGLUniformLocation,
    },
}

interface IBuffers
{
    vertex: WebGLBuffer,
    color: WebGLBuffer
}

function createProgramInformation(gl: WebGLRenderingContext, program: WebGLProgram) : ICubeProgramInformation
{
    return {
        program: program,
        attributeLocation:
        {
            vertex: gl.getAttribLocation(program, "aVertexPosition"),
            color: gl.getAttribLocation(program, "aColor"),
        },
        uniformLocation:
        {
            projection: <WebGLUniformLocation> gl.getUniformLocation(program, "uProjection"),
            translation: <WebGLUniformLocation> gl.getUniformLocation(program, "uTranslation"),
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

    gl.enableVertexAttribArray(programInfo.attributeLocation.vertex);
    const vertexSize = 3;
    const vertexType = gl.FLOAT;
    const vertexNormalise = false;
    const vertexStride = 0; // 0 implies: move forward size * sizeof(type) each iteration to get the next position
    const vertexOffset = 0;
    gl.vertexAttribPointer(programInfo.attributeLocation.vertex, vertexSize, vertexType, vertexNormalise, vertexStride, vertexOffset);

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
        color: colorBuffer
    }
}

function drawCube(
    gl: WebGLRenderingContext, 
    programInfo: ICubeProgramInformation,
    buffers: IBuffers,
    position: vec2, 
    rotation: vec3,
    scale: vec3)
{
    const projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, 0, gl.canvas.width, gl.canvas.height, 0, 0.1, 10000);
    gl.uniformMatrix4fv(programInfo.uniformLocation.projection, false, projectionMatrix);

    const translationMatrix = mat4.create();
    mat4.translate(translationMatrix, translationMatrix, [position[0], position[1], -1000.0]);
    mat4.scale(translationMatrix, translationMatrix, [scale[0], scale[1], scale[2]]);
    mat4.rotateX(translationMatrix, translationMatrix, rotation[0]);
    mat4.rotateY(translationMatrix, translationMatrix, rotation[1]);
    mat4.rotateZ(translationMatrix, translationMatrix, rotation[2]);
    gl.uniformMatrix4fv(programInfo.uniformLocation.translation, false, translationMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICIES), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(COLORS), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, VERTICIES.length / 3);
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

    drawCube(
        gl, programInfo, buffers,
        [gl.canvas.width / 2, gl.canvas.height / 2], 
        [0, Math.PI / 6, Math.PI / 4],
        [200, 200, 200]);

}

main();