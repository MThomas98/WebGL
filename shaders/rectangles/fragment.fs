precision mediump float;

uniform vec3 uColor;

void main()
{
    gl_FragColor = vec4(uColor.x, uColor.y, uColor.z, 1.0);
}