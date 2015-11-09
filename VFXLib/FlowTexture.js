
function FlowTexture() {

    var _this = this;

    var geometry = new THREE.BufferGeometry();

    var material;
    var mesh;

    this.construct = function(pathPoints, upDir, width) {

        var num = pathPoints.length;

        for(var i=0; i<num-1; i++) {

            var dir = new THREE.Vector3();
            dir.subVectors(pathPoints[i+1], pathPoints[i]);

            var tan = new THREE.Vector3();
            tan.crossVectors(dir, upDir);

            tan = tan.normalize();
        }

        var triNum = 4;

        var positions = new Float32Array(triNum * 3 * 3);
        var texCoords = new Float32Array(triNum * 2 * 3);

        positions[0] = -1.0; positions[1] = 0.0; positions[2] = -1.0;
        positions[3] =  1.0; positions[4] = 0.0; positions[5] =  1.0;
        positions[6] = -1.0; positions[7] = 0.0; positions[8] =  1.0;

        positions[9]  = 1.0; positions[10] = 0.0; positions[11] = 1.0;
        positions[12] =-1.0; positions[13] = 0.0; positions[14] =-1.0;
        positions[15] = 1.0; positions[16] = 0.0; positions[17] =-1.0;

        texCoords[0] = 0.0; texCoords[1] = 0.0;
        texCoords[2] = 1.0; texCoords[3] = 1.0;
        texCoords[4] = 0.0; texCoords[5] = 1.0;

        texCoords[6]  = 1.0; texCoords[7]  = 1.0;
        texCoords[8]  = 0.0; texCoords[9]  = 0.0;
        texCoords[10] = 1.0; texCoords[11] = 0.0;


        positions[18] = -1.0; positions[19] = -0.0; positions[20] =  1.0;
        positions[21] = -2.0; positions[22] = -1.0; positions[23] =  1.0;
        positions[24] = -2.0; positions[25] = -1.0; positions[26] = -1.0;

        positions[27] = -1.0; positions[28] = -0.0; positions[29] = -1.0;
        positions[30] = -1.0; positions[31] = -0.0; positions[32] =  1.0;
        positions[33] = -2.0; positions[34] = -1.0; positions[35] = -1.0;


        texCoords[12] =  0.0; texCoords[13] = 1.0;
        texCoords[14] = -1.0; texCoords[15] = 1.0;
        texCoords[16] = -1.0; texCoords[17] = 0.0;

        texCoords[18]  = 0.0; texCoords[19] = 0.0;
        texCoords[20]  = 0.0; texCoords[21] = 1.0;
        texCoords[22]  =-1.0; texCoords[23] = 0.0;


        //
        var tex = new THREE.ImageUtils.loadTexture("./textures/uv_texture.jpg");
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(100, 100);


        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('texCoord', new THREE.BufferAttribute(texCoords, 2));


        material = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                texCoord : {type:'v2', value: null},
            },
            uniforms: {
                time     : {type: 'f', value: 0.0},
                velocity : {type: 'f', value: 0.2},
                texture  : {type: 't', value: tex}
            },
            vertexShader  : loadFileToString("./shaders/FlowTexVertexShader.glsl"),
            fragmentShader: loadFileToString("./shaders/FlowTexFragmentShader.glsl"),
            side: THREE.DoubleSide
        });

        //
        mesh = new THREE.Mesh(geometry, material);
    }

    this.getMesh = function() {
        return mesh;
    }

    this.update = function(time) {

        material.uniforms.time = {type: 'f', value: time};

        material.needsUpdate = true;
        mesh.needsUpdate = true;
    }
}
