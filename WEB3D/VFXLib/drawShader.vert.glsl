uniform mat4 modelViewMatrix; // optional
uniform mat4 projectionMatrix; // optional

attribute vec4 position;

void main(void) {

    gl_PointSize = 10.0;
//  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * position;

    float ccc = position.w;
}