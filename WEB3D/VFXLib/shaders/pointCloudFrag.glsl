precision mediump float;
precision mediump int;

uniform vec3 color;
uniform sampler2D texture;
uniform float maxLife;

varying float vOpacity;
varying float vLife;


void main() {

    if(vLife < 0.0) discard;

    vec4 c = texture2D(texture, gl_PointCoord);
    //if(c.w < 0.9) discard;

    vec3 glColor = vec3(c.x, c.y, c.z);

    float a = (vLife/maxLife);
    if(a < 0.0) a = 0.0;

    gl_FragColor = vec4(glColor, c.w*a);
}