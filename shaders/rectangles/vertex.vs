attribute vec4 aVertexPosition;

uniform mat4 uTranslation;

void main()
{
    gl_Position = uTranslation * aVertexPosition;
}
