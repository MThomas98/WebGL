precision mediump float;

uniform sampler2D uTexture;
uniform vec3 uDirLightDirection;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main()
{
    // OpenGL will interpolate the vector, so need to renormalise it
    vec3 normal = normalize(vNormal);
    float dirLight = max(dot(normal, normalize(uDirLightDirection)), 0.0);

    vec4 texture = texture2D(uTexture, vTexCoord);
    texture.rgb *= dirLight;

    gl_FragColor = texture;
}