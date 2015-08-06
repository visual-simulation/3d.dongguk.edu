
function loadShaderFile(path) {

    var client = new XMLHttpRequest();

    client.open('GET', path, false);
    client.send();

    if(client.status == 200) {
        return client.responseText;
    }
    else {
        return null;
    }
}

function ParticleSystemGPU() {

    var _this = this;

    this.indices;
    this.lifeTime;
    this.positions;
    this.velocities;

    this.texPositions;
    this.texVelocities;
    this.texData;

    this.out;

    var width, height;
    var totalSize;

    var count;

    // renderer
    var renderer;
    var gl;

    //
    var scene;
    var camera;
    var target;

    var geometry;
    var material;
    var mesh;

    this.initialize = function(total, threeRen, threeCam) {

        width = 1024;
        height = parseInt(total/width)+1;

        if(height % 2 > 0) height++;
        height = parseInt(height);

        totalSize = width * height;
        count = 0;

        _this.indices = new Float32Array(totalSize);
        _this.lifeTime = new Float32Array(totalSize);
        _this.positions = new Float32Array(totalSize*4);
        _this.velocities = new Float32Array(totalSize*3);

        for(var i=0; i<totalSize; i++) {
           // _this.indices[i] = i;
        }

        _this.texPositions = new THREE.WebGLRenderTarget(width, height,
                { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat });
        _this.texPositions.needsUpdate = true;
        _this.texVelocities = new THREE.WebGLRenderTarget(width, height,
                { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat });
        _this.texVelocities.needsUpdate = true;


        _this.out = new Uint8Array(totalSize*4);

        renderer = threeRen;
        gl = renderer.getContext();

        camera = threeCam;

        target = new THREE.WebGLRenderTarget(width, height,
            { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType, format: THREE.RGBAFormat });

        //

        scene = new THREE.Scene();
        geometry = new THREE.BufferGeometry();
        mesh = new THREE.PointCloud(geometry);

        mesh.needsUpdate = true;
        scene.add(mesh);

        //_this.initializeShaderMaterials();
    }

    this.initializeTextures = function() {

        _this.texDataPos = new THREE.DataTexture(_this.positions, width, height, THREE.RGBAFormat, THREE.FloatType);
        _this.texDataPos.minFilter = THREE.NearestFilter;
        _this.texDataPos.magFilter = THREE.NearestFilter;
        _this.texDataPos.needsUpdate = true;

        _this.texDataIdx = new THREE.DataTexture(_this.indices, width, height, THREE.AlphaFormat, THREE.FloatType);
        _this.texDataIdx.minFilter = THREE.NearestFilter;
        _this.texDataIdx.magFilter = THREE.NearestFilter;
        _this.texDataIdx.needsUpdate = true;

    }

    this.initializeShaderMaterials = function() {

        _this.initializeTextures();

        _this.assignMaterial = new THREE.RawShaderMaterial({
            attributes:
            {
                position : {type: 'v3', value: null},
                locID : {type: 'f', value: null}
            },
            uniforms:
            {
                width : {type: 'i', value: width},
                height : {type: 'i', value: height}
            },
            vertexShader : loadShaderFile("./shaders/assignShaderVert.glsl"),
            fragmentShader : loadShaderFile("./shaders/assignShaderFrag.glsl")
        });

        _this.drawMaterial = new THREE.RawShaderMaterial({
            attributes:
            {
                position : {type: 'v3', value: null},
                locID : {type: 'f', value: null}
            },
            uniforms:
            {
                texPosition : {type: 't', value: _this.texDataPos},
                width : {type: 'i', value: width},
                height : {type: 'i', value: height}
            },
            vertexShader : loadShaderFile("./shaders/drawParticlesVert.glsl"),
            fragmentShader : loadShaderFile("./shaders/drawParticlesFrag.glsl")
        })
    }

    this.assignParticles = function() {

        mesh.geometry.addDrawCall(0, count, 0);

        mesh.geometry.addAttribute('position', new THREE.BufferAttribute(_this.positions, 3));
        mesh.geometry.addAttribute('locID', new THREE.BufferAttribute(_this.indices, 1));

        mesh.material = _this.assignMaterial;

        renderer.render(scene, camera, _this.texPositions, true);
        //renderer.readRenderTargetPixels(_this.texPositions, 0,0, width, height, _this.out);
    }

    this.drawParticles = function(screenScene, screenCamera) {

        screenScene.remove(mesh);

        mesh.geometry.addDrawCall(0, count, 0);

       // mesh.geometry.addAttribute('position', new THREE.BufferAttribute(_this.positions, 3));
        mesh.geometry.addAttribute('locID', new THREE.BufferAttribute(_this.indices, 1));

        mesh.material = _this.drawMaterial;

        screenScene.add(mesh);

        renderer.render(screenScene, screenCamera);
    }


    this.advectParticles = function(dt) {

        //renderer.render(scene, camera, target, true);

        renderer.render(scene, camera);

        //gl.readPixels(0,0, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, _this.out);
        //var a = 100;

    }

    this.addParticle = function(pos, vel) {

        var idx = count;
        count++;

        _this.indices[idx] = idx;
        _this.lifeTime[idx] = 100.0;

        _this.positions[idx+0] = pos.x;
        _this.positions[idx+1] = pos.y;
        _this.positions[idx+2] = pos.z;
        _this.positions[idx+3] = 1.0;

        _this.velocities[idx+0] = vel.x;
        _this.velocities[idx+1] = vel.y;
        _this.velocities[idx+2] = vel.z;
    }



}
