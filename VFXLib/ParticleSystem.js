
var vertexShaderCode;
var fragmentShaderCode;

function ParticleSystem() {

    var this_ = this;
    var totalNum = 10000;

    this.particleCount = 0;

    // info for vertex array
    this.texCoords  = new Float32Array(totalNum*2);
    this.positions  = new Float32Array(totalNum*3);
    this.velocities = new Float32Array(totalNum*3);

    this.texPositions;
    this.texVelocities;

    // info for texture;
    this.width  = 1024;
    this.height = 1024;

    // optional
    this.gravity = new THREE.Vector3();

    //
    var rendererRTT;
    var sceneRTT;
    var cameraRTT;
    var planeGeo;
    var quad;

    this.initialize = function(renderer) {

        rendererRTT = renderer;

        this_.texPositions = new THREE.WebGLRenderTarget(this_.width, this_.height,
            {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat});
        this_.texVelocities = new THREE.WebGLRenderTarget(this_.width, this_.height,
            {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat});

        sceneRTT = new THREE.Scene();

        cameraRTT = new THREE.OrthographicCamera(this_.width / -2, this_.width / 2, this_.height / 2, this_.height / -2, -10000, 10000);
        cameraRTT.position.z = 100;


        var material = new THREE.ShaderMaterial({

            uniform : { posField:{ type:"t", value:0, texture:this_.texPositions},
                        velField:{ type:"t", value:0, texture:this_.texVelocities}},
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode

        });



        planeGeo = new THREE.PlaneGeometry(this_.width, this_.height);
        quad = new THREE.Mesh(planeGeo, material);
        quad.position.z = 100;
    }

    this.addParticle = function(pos, vel) {

        this_.particleCount += 1;

        var idx = (this_.particleCount-1)*3;


        this_.positions[idx+0] = pos.x;
        this_.positions[idx+1] = pos.y;
        this_.positions[idx+2] = pos.z;

        this_.velocities[idx+0] = vel.x;
        this_.velocities[idx+1] = vel.y;
        this_.velocities[idx+2] = vel.z;

        // compute texture coordinates

        var i = (this_.particleCount-1)&this_.width;
        var j = (this_.particleCount-1)/this_.width;

        var tix = (this_.particleCount-1)*2;

        this_.texCoords[tix+0] = i/this_.width;
        this_.texCoords[tix+1] = j/this_.height;
    };

    this.updateParticles = function(dt) {

        for(var i=0; i<this_.particleCount; i++) {

            var idx = i*3;

            this_.positions[idx+0] += this_.velocities[idx+0]*dt;
            this_.positions[idx+1] += this_.velocities[idx+1]*dt;
            this_.positions[idx+2] += this_.velocities[idx+2]*dt;

        }
    }

    this.advectParticles = function(dt) {

        // use gpgpu for test






    }
}


vertexShaderCode = ""
fragmentShaderCode = ""


// references
// https://classes.soe.ucsc.edu/cmps161/Winter06/projects/keller/
// http://www.hackbarth-gfx.com/2013/03/17/making-of-1-million-particles/
// https://threejsdoc.appspot.com/doc/index.html#Particle

