precision mediump float;
precision mediump int;

attribute vec2 texCoord;

uniform float time;
uniform float velocity;

varying vec2 vertTex;

void main() {

    float deviation = texCoord.x + time * velocity;

    vertTex = vec2(deviation, texCoord.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}