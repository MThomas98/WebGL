attribute vec4 aVertexPosition;
attribute vec4 aColor;
attribute vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

varying vec4 vColor;
varying vec2 vTexCoord;

void main()
{
    vColor = aColor;
    vTexCoord = aTexCoord;

    gl_Position = uProjection * uView * uModel * aVertexPosition;
}
