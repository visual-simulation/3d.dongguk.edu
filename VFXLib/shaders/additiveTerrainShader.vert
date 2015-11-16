precision mediump float;
precision mediump int;

attribute vec2 texCoord;

varying vec2 vertTex;

void main() {

	vertTex = texCoord;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}