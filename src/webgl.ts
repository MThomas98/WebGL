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
