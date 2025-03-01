import { vec4, mat4 } from "gl-matrix";

import { readFile } from "./utils";

export function createContext(canvasId: string, width: number, height: number) : WebGLRenderingContext | null
{
    const canvas = <HTMLCanvasElement | null> document.querySelector(`#${canvasId}`);
    if (canvas === null)
    {
        alert(`Failed to find WebGL canvas (${canvasId})`);
        return null;
    }

    canvas.width = width;
    canvas.height = height;

    const gl = canvas.getContext("webgl");
    if (gl === null)
    {
        alert("Failed to obtain WebGL Context");
        return null;
    }

    return gl;
}

export function createShader(gl: WebGLRenderingContext, type: GLint, src: string) : WebGLShader | null
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


export function createProgram(gl: WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string) : WebGLProgram | null
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

    return program;
}

export class ShaderProgram
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
export class VertexBuffer
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