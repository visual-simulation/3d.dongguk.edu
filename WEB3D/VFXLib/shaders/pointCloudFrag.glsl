precision mediump float;
precision mediump int;

uniform vec3 color;
uniform sampler2D texture;


void main() {

    //gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
    vec4 c = texture2D(texture, gl_PointCoord);

   // if(c.w < 0.1) discard;

    gl_FragColor = c;



    //gl_FragColor.w *= 0.1;


}