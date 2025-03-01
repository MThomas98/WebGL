attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main()
{
    vTexCoord = aTexCoord;
    vNormal = aNormal;

    gl_Position = uProjection * uView * uModel * aVertexPosition;
}
