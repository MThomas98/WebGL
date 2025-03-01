attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

uniform mat3 uNormalMatrix;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main()
{
    vTexCoord = aTexCoord;
    vNormal = uNormalMatrix * aNormal;

    gl_Position = uProjection * uView * uModel * aVertexPosition;
}
