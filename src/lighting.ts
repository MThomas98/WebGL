const WIDTH: number = 640;
const HEIGHT: number = 480;

const VERTEX_SHADER_PATH = "shaders/lighting/vertex.vs";
const FRAGMENT_SHADER_PATH = "shaders/lighting/fragment.fs";

import { mat3, mat4, vec3 } from "gl-matrix";

import { createContext, ShaderProgram, VertexBuffer, Camera} from "./webgl";
import { CUBE } from "./shapes";

function setupGLOptions(gl: WebGLRenderingContext)
{
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1);
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
    const vertexStride = CUBE.stride;
    const vertexOffset = CUBE.vertexOffset;
    vertexBuffer.addAttribute(vertexLocation, vertexSize, vertexType, vertexNormalise, vertexStride, vertexOffset);

    // Texture Coords
    const texCoordLocation = shaderProgram.getAttributeLocation("aTexCoord");
    const texCoordSize = 2;
    const texCoordType = gl.FLOAT;
    const texCoordNormalise = false;
    const texCoordStride = CUBE.stride;
    const texCoordOffset = CUBE.texCoordsOffset;
    vertexBuffer.addAttribute(texCoordLocation, texCoordSize, texCoordType, texCoordNormalise, texCoordStride, texCoordOffset);
    
    // Normals
    const normalLocation = shaderProgram.getAttributeLocation("aNormal");
    const normalSize = 3;
    const normalType = gl.FLOAT;
    const normalNormalise = false;
    const normalStride = CUBE.stride;
    const normalOffset = CUBE.normalsOffset;
    vertexBuffer.addAttribute(normalLocation, normalSize, normalType, normalNormalise, normalStride, normalOffset);

    return vertexBuffer;
}

function setupTexture(gl: WebGLRenderingContext)
{
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    const image = new Image();
    image.src = "img/f-texture.png";
    image.addEventListener("load", function() 
    {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
}

function calculateLighting(shaderProgram: ShaderProgram)
{
    const dirLightDirection: vec3 = [1, 1, 1];
    vec3.normalize(dirLightDirection, dirLightDirection);
    shaderProgram.setUniform3fv("uDirLightDirection", dirLightDirection);
}

function calculatePerspective(gl: WebGLRenderingContext, shaderProgram: ShaderProgram)
{
    const projectionMatrix = mat4.create();
    // mat4.ortho(projectionMatrix, 0, gl.canvas.width, gl.canvas.height, 0, 0.1, 10000);
    mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), gl.canvas.width / gl.canvas.height, 0.1, 100000);
    shaderProgram.setUniformMatrix4fv("uProjection", false, projectionMatrix);
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
    shaderProgram.use();

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, position);
    mat4.scale(modelMatrix, modelMatrix, scale);
    mat4.rotateX(modelMatrix, modelMatrix, rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, rotation[2]);
    shaderProgram.setUniformMatrix4fv("uModel", false, modelMatrix);

    const normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix, modelMatrix);
    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);
    shaderProgram.setUniformMatrix3fv("uNormalMatrix", false, normalMatrix);

    shaderProgram.setUniformMatrix4fv("uView", false, camera.getLookAtView());

    buffer.bufferData(new Float32Array(CUBE.verticies), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, CUBE.verticies.length / 3);
}

function drawLoop(gl: WebGLRenderingContext, shaderProgram: ShaderProgram, buffer: VertexBuffer)
{
    const cubePosition: vec3 = [0, 0, -1000];
    const cubeRotationSpeed = Math.PI / 2; // deg/s
    var cubeRotationY = 0;

    const cameraRadius = 1000;
    const cameraRotationSpeed = Math.PI / 2; // deg/s
    var cameraAngle = 0;

    const camera = new Camera([0, 0, 0], cubePosition);

    var lastTime = Date.now();
    function draw()
    {
        var deltaTime = (Date.now() - lastTime) / 1000; // In seconds
        lastTime = Date.now();
        
        drawCube(
            gl, shaderProgram, buffer,
            cubePosition, 
            [0, cubeRotationY, -Math.PI / 4],
            [200, 200, 200],
            camera);

        cubeRotationY += cubeRotationSpeed * deltaTime;
        
        // cameraAngle += cameraRotationSpeed * deltaTime;
        // camera.orbitTarget(cameraRadius, cameraAngle);

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
    shaderProgram.registerAttribute("aTexCoord");
    shaderProgram.registerAttribute("aNormal");

    shaderProgram.registerUniform("uProjection");
    shaderProgram.registerUniform("uView");
    shaderProgram.registerUniform("uModel");
    shaderProgram.registerUniform("uNormalMatrix")

    shaderProgram.registerUniform("uDirLightDirection");

    shaderProgram.use();

    const buffer = setupVertexBuffer(gl, shaderProgram);

    calculatePerspective(gl, shaderProgram);
    calculateLighting(shaderProgram);
    setupTexture(gl);

    drawLoop(gl, shaderProgram, buffer);
}

main();