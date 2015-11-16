
uniform sampler2D texture;

varying vec2 vertTex;

void main() {

    vec4 c = texture2D(texture, vertTex);


	//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	gl_FragColor = c;
}
