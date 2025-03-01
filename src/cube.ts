const WIDTH: number = 640;
const HEIGHT: number = 480;

const VERTEX_SHADER_PATH = "shaders/cube/vertex.vs";
const FRAGMENT_SHADER_PATH = "shaders/cube/fragment.fs";

import { mat4, vec3 } from "gl-matrix";

import { createContext, ShaderProgram, VertexBuffer, Camera, FLOAT32_BYTES, CUBE_VERTICIES } from "./webgl";

function setupGLOptions(gl: WebGLRenderingContext)
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

function setupVertexBuffer(gl: WebGLRenderingContext, shaderProgram: ShaderProgram) : VertexBuffer
{
    const vertexBuffer = new VertexBuffer(gl);

    // Vertex Positions
    const vertexLocation = shaderProgram.getAttributeLocation("aVertexPosition");
    const vertexSize = 3;
    const vertexType = gl.FLOAT;
    const vertexNormalise = false;
    const vertexStride = 5 * FLOAT32_BYTES;
    const vertexOffset = 0;
    vertexBuffer.addAttribute(vertexLocation, vertexSize, vertexType, vertexNormalise, vertexStride, vertexOffset);

    // Texture Coords
    const texCoordLocation = shaderProgram.getAttributeLocation("aTexCoord");
    const texCoordSize = 2;
    const texCoordType = gl.FLOAT;
    const texCoordNormalise = false;
    const texCoordStride = 5 * FLOAT32_BYTES;
    const texCoordOffset = 3 * FLOAT32_BYTES;
    vertexBuffer.addAttribute(texCoordLocation, texCoordSize, texCoordType, texCoordNormalise, texCoordStride, texCoordOffset);

    return vertexBuffer;
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
    shaderProgram: ShaderProgram,
    buffer: VertexBuffer,
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
    shaderProgram.setUniformMatrix4fv("uModel", false, translationMatrix);

    shaderProgram.setUniformMatrix4fv("uView", false, camera.getViewMatrix());

    buffer.bufferData(new Float32Array(CUBE_VERTICIES), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, CUBE_VERTICIES.length / 3);
}

function drawLoop(gl: WebGLRenderingContext, shaderProgram: ShaderProgram, buffer: VertexBuffer)
{
    const projectionMatrix = mat4.create();
    // mat4.ortho(projectionMatrix, 0, gl.canvas.width, gl.canvas.height, 0, 0.1, 10000);
    mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), gl.canvas.width / gl.canvas.height, 0.1, 100000);
    shaderProgram.setUniformMatrix4fv("uView", false, projectionMatrix);

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
            gl, shaderProgram, buffer,
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

    setupGLOptions(gl);

    const shaderProgram = new ShaderProgram(gl);
    if (!await shaderProgram.initialise(VERTEX_SHADER_PATH, FRAGMENT_SHADER_PATH))
    {
        return;
    } 

    shaderProgram.registerAttribute("aVertexPosition");
    shaderProgram.registerAttribute("aColor");
    shaderProgram.registerAttribute("aTexCoord");

    shaderProgram.registerUniform("uProjection");
    shaderProgram.registerUniform("uView");
    shaderProgram.registerUniform("uModel");

    shaderProgram.use();

    const buffer = setupVertexBuffer(gl, shaderProgram);

    createTexture(gl);

    drawLoop(gl, shaderProgram, buffer);
}

main();