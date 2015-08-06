precision mediump float;
precision mediump int;


attribute vec3 translate;
attribute vec3 velocity;
attribute float life;
attribute float size;


void main() {

    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position+velocity, 1.0);
}