precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;

void main()
{
    // gl_FragColor = vec4(1.0, 1.0, 1.0,1.0);
    gl_FragColor = texture2D(uTexture, vTexCoord);
}