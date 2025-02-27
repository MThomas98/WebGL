precision mediump float;

varying vec4 vColor;
varying vec2 vTexCoord;

uniform sampler2D uTexture;

void main()
{
    // gl_FragColor = vColor;
    gl_FragColor = texture2D(uTexture, vTexCoord);
}