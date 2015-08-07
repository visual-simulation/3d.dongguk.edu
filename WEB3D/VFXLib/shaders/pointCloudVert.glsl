precision mediump float;
precision mediump int;

attribute vec3 velocity;
attribute float life;
attribute float size;

void main() {

    gl_PointSize = 30.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}