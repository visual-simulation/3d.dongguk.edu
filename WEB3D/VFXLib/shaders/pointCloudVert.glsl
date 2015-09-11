precision mediump float;
precision mediump int;

attribute vec3 velocity;
attribute float life;
attribute float size;
attribute float opacity;

varying float vOpacity;
varying float vLife;

void main() {

    vOpacity = opacity;
    vLife = life;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size*(300.0/length( mvPosition.xyz));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}