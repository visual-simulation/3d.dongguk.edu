precision mediump float;
precision mediump int;

uniform vec3 color;
uniform sampler2D texture;


void main() {

    //gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
    gl_FragColor = texture2D(texture, gl_PointCoord);


}