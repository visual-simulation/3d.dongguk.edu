
uniform sampler2D texture;
uniform vec3 color;

varying vec2 vertTex;

void main() {

    vec4 c = texture2D(texture, vertTex);

    //vec3 glColor = vec3(c.x*color.x, c.y*color.y, c.z*color.z);
	//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

	gl_FragColor = vec4(c.x*color.x, c.y*color.y, c.z*color.z, c.w);
	//gl_FragColor = vec4(c.x, c.y, c.z, c.w);
}
