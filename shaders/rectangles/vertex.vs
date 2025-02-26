attribute vec4 aVertexPosition;

uniform mat4 uModel;

void main()
{
    gl_Position = uModel * aVertexPosition;
}
