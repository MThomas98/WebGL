const WIDTH: number = 640;
const HEIGHT: number = 480;

const VERTEX_SHADER_PATH = "shaders/cube/vertex.vs";
const FRAGMENT_SHADER_PATH = "shaders/cube/fragment.vs";

import { mat4, vec3, vec4 } from "gl-matrix";

import { readFile } from "./utils";
import { createProgram, createContext, createShader } from "./webgl";

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


class ShaderProgram
{
    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
    }

    public async initialise(vertexPath: string, fragmentPath: string) : Promise<boolean>
    {
        var vertexSrc: string;
        var fragmentSrc: string;
        try
        {
            vertexSrc = await readFile(vertexPath);
            fragmentSrc = await readFile(fragmentPath);
        }
        catch (err)
        {
            return false;
        }

        const program = createProgram(this.gl, vertexSrc, fragmentSrc);
        if (program === null)
        {
            return false;
        }

        this.program = program;
        return true;
    }

    public use()
    {
        this.gl.useProgram(this.program);
    }

    public registerAttribute(attribName: string)
    {
        if (this.program === null)
        {
            return;
        }
        
        const attribLocation = this.gl.getAttribLocation(this.program, attribName);
        if (attribLocation === -1)
        {
            alert(`Failed to get attribute ${attribName}`);
            return;
        }

        this.attribLocations.set(attribName, attribLocation);
    }

    public getAttributeLocation(attribName: string) : GLint
    {
        const attribLocation = this.attribLocations.get(attribName);
        if (attribLocation === undefined)
        {
            alert(`Tried to get unregistered attribute ${attribName}`);
            return -1;
        }

        return attribLocation;
    }

    public registerUniform(uniformName: string)
    {
        if (this.program === null)
        {
            return;
        }

        const uniformLocation = this.gl.getUniformLocation(this.program, uniformName);
        if (uniformLocation === null)
        {
            alert(`Failed to get uniform ${uniformName}`);
            return;
        }

        this.uniformLocations.set(uniformName, uniformLocation);
    }

    public setUniform4fv(name: string, value: vec4)
    {
        const uniformLocation = this.uniformLocations.get(name);
        if (uniformLocation === undefined)
        {
            alert(`Tried setting unregistered uniform ${name}`);
            return;
        }

        this.gl.uniform4fv(uniformLocation, value)
    }

    public setUniformMatrix4fv(name: string, transpose: boolean, value: mat4)
    {
        const uniformLocation = this.uniformLocations.get(name);
        if (uniformLocation === undefined)
        {
            alert(`Tried setting unregistered uniform ${name}`);
            return;
        }

        this.gl.uniformMatrix4fv(uniformLocation, transpose, value);
    }

    private gl : WebGLRenderingContext;
    private program : WebGLProgram | null = null;

    private attribLocations = new Map<string, GLint>;
    private uniformLocations = new Map<string, WebGLUniformLocation>;
}

// TODO: Has potentially redundant bind calls, maybe make a buffer manager?
class VertexBuffer
{
    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        this.buffer = gl.createBuffer();
    }

    public bind()
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    public bufferData(data: AllowSharedBufferSource, usage: GLenum)
    {
        this.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    }

    public addAttribute(attributeLocation: GLint, size: GLint, type: GLenum, normalize: GLboolean, stride: GLsizei, offset: GLintptr)
    {
        this.bind();  
        this.gl.enableVertexAttribArray(attributeLocation);
        this.gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset);
    }

    private gl: WebGLRenderingContext;
    private buffer: WebGLBuffer;
}

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

    buffer.bufferData(new Float32Array(VERTICIES), gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, VERTICIES.length / 3);
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