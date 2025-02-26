attribute vec4 aVertexPosition;
attribute vec4 aColor;

uniform mat4 uProjection;
uniform mat4 uTranslation;

varying vec4 vColor;

void main()
{
    vColor = aColor;

    gl_Position = uProjection * uTranslation * aVertexPosition;
}
