precision mediump float;
precision mediump int;

uniform vec3 color;
uniform sampler2D texture;
uniform float maxLife;

varying float vOpacity;
varying float vLife;


void main() {

    vec4 c = texture2D(texture, gl_PointCoord);
    if(c.w < 0.01) discard;

    vec3 glColor = vec3(c.x, c.y, c.z) * color;

    float a = vLife/maxLife;
    gl_FragColor = vec4(glColor, c.w*a);
}