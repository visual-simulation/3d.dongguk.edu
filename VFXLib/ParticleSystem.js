document.write("<script type='text/javascript' src='./GlobalDefinition.js'><"+"/script>");
document.write("<script type='text/javascript' src='./NoiseGenerator.js'><"+"/script>");
document.write("<script type='text/javascript' src='./ObjectField.js'><"+"/script>");


function ParticleSystem() {

    var _this = this;

    var noiseGen0 = new SimplexNoise();
    var noiseGen1 = new SimplexNoise();
    var noiseGen2 = new SimplexNoise();

    var positionBuffer;
    var velocityBuffer;
    var lifeBuffer;
    var sizeBuffer;
    var rotationBuffer;
    var angularBuffer;

    var total;
    var count;
    var tail;

    // seed properties
    var seedVelDir;
    var seedVelMag;
    var seedLife;
    var seedSize;
    var seedSpread;
    var angularVel = 0.0;

    var blendingType = THREE.CustomBlending;

    var particleColor;

    var globalForce;
    var windStrength = 0;

    // render options for three.js
    var pointGeometry;
    var pointMaterial;
    var pointMesh;

    //
    var objectField;

    //
    var renderer;

    var rtScene;
    var rtTexture;
    var rtMaterial;
    var rtMesh;

    var rtComposer;
    var effectPass;

    var screenMesh;
    var screenMaterial;

    this.setParticle = function(i, params) {
        var idx = i*3;

        if(params.position != undefined) {
            positionBuffer.array[idx + 0] = params.position.x;
            positionBuffer.array[idx + 1] = params.position.y;
            positionBuffer.array[idx + 2] = params.position.z;
        }

        if(params.velocity != undefined) {
            positionBuffer.array[idx + 0] = params.velocity.x;
            velocityBuffer.array[idx + 1] = params.velocity.y;
            velocityBuffer.array[idx + 2] = params.velocity.z;
        }

        if(params.life != undefined) {
            lifeBuffer.array[i] = params.life;
        }

        if(params.size != undefined) {
            sizeBuffer.array[i] = params.size;
        }

        if(params.rotate != undefined) {
            rotationBuffer.array[i] = params.rotate;
        }
    }

    this.getParticle = function(i) {
        var idx = i*3;
        return {position: new THREE.Vector3(positionBuffer.array[idx+0], positionBuffer.array[idx+1], positionBuffer.array[idx+2]),
                velocity: new THREE.Vector3(positionBuffer.array[idx+0], positionBuffer.array[idx+1], positionBuffer.array[idx+2]),
                life: lifeBuffer.array[i],
                size: sizeBuffer.array[i],
                rotate: rotationBuffer.array[i]};
    }

    this.getCount = function() {
        return count;
    }
    this.getTail = function() {
        return tail;
    }

    this.setObstacleField = function(field) {
        objectField = field;
    }

    this.setParameters = function(params) {

        // params is JSON type
        if(params.seedVelDir != undefined) {
            seedVelDir = params.seedVelDir.clone();
        }
        if(params.seedVelMag != undefined) {
            seedVelMag = params.seedVelMag;
        }
        if(params.angularVel != undefined) {
            angularVel = params.angularVel;
        }
        if(params.seedLife != undefined) {
            seedLife = params.seedLife;
        }
        if(params.seedSize != undefined) {
            seedSize = params.seedSize;
        }
        if(params.seedSpread != undefined) {
            seedSpread = params.seedSpread;
        }
        if(params.globalForce != undefined) {
            globalForce = params.globalForce.clone();
        }
        if(params.windStrength != undefined) {
            windStrength = params.windStrength;
        }
        if(params.tex != undefined) {
            pointMaterial.uniforms.texture = {type: 't', value: params.tex};
            pointMaterial.needsUpdate = true;
        }
        if(params.texFile != undefined) {
            var tex = THREE.ImageUtils.loadTexture(params.texFile);
            pointMaterial.uniforms.texture = {type: 't', value: tex};
            pointMaterial.needsUpdate = true;
        }
        if(params.matcapFile != undefined) {
            var tex = THREE.ImageUtils.loadTexture(params.matcapFile);
            screenMaterial.uniforms.matcap = {type: 't', value: tex};
            screenMaterial.needsUpdate = true;
        }
        if(params.particleColor != undefined) {
            particleColor = params.particleColor.clone();
            pointMaterial.uniforms.color = {type: 'c', value: particleColor};
            pointMaterial.needsUpdate = true;
        }
        if(params.alpha != undefined) {
            pointMaterial.uniforms.alpha = {type: 'f', value: params.alpha};
            pointMaterial.needsUpdate = true;
        }
    }

    this.initialize = function(_total, params) {

        if(params != undefined){

            if(params.blendingType != undefined) {
                blendingType = params.blendingType
            }
        }

        rtScene = new THREE.Scene();
        rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight,
            { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );


        var positionAttrib = new THREE.BufferAttribute(new Float32Array(6*3), 3);
        var uvAttrib       = new THREE.BufferAttribute(new Float32Array(6*2), 2);

        positionAttrib.array[0] = -1.0; positionAttrib.array[1] =  1.0; positionAttrib.array[2] = 0.0;
        positionAttrib.array[3] = -1.0; positionAttrib.array[4] = -1.0; positionAttrib.array[5] = 0.0;
        positionAttrib.array[6] =  1.0; positionAttrib.array[7] =  1.0; positionAttrib.array[8] = 0.0;

        positionAttrib.array[9]  =  1.0; positionAttrib.array[10] =  1.0; positionAttrib.array[11] = 0.0;
        positionAttrib.array[12] = -1.0; positionAttrib.array[13] = -1.0; positionAttrib.array[14] = 0.0;
        positionAttrib.array[15] =  1.0; positionAttrib.array[16] = -1.0; positionAttrib.array[17] = 0.0;

        uvAttrib.array[0] = 0.0; uvAttrib.array[1] = 1.0;
        uvAttrib.array[2] = 0.0; uvAttrib.array[3] = 0.0;
        uvAttrib.array[4] = 1.0; uvAttrib.array[5] = 1.0;

        uvAttrib.array[6]  = 1.0; uvAttrib.array[7]  = 1.0;
        uvAttrib.array[8]  = 0.0; uvAttrib.array[9]  = 0.0;
        uvAttrib.array[10] = 1.0; uvAttrib.array[11] = 0.0;

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', positionAttrib);
        geometry.addAttribute('uv'      , uvAttrib);

        screenMaterial = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                uv       : {type:'v2', value: null}
            },
            uniforms: {
                texture  : {type: 't', value: rtTexture},
                matcap   : {type: 't', value: null}
            },
            vertexShader  : loadFileToString("./shaders/screenMeshVertex.glsl"),
            fragmentShader: loadFileToString("./shaders/screenMeshFragment.glsl"),
            transparent : true
        });

        screenMesh = new THREE.Mesh(geometry, screenMaterial);

        //
        seedVelDir = new THREE.Vector3(0, 1, 0);
        seedVelMag = 0.1;
        seedLife = 3;
        seedSize = 0.1;
        seedSpread = 0.0;
        globalForce = new THREE.Vector3(0, 0, 0);

        //

        total = _total;
        count = 0;
        tail = -1;

        positionBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        velocityBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        lifeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);
        sizeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);
        rotationBuffer = new THREE.BufferAttribute(new Float32Array(total*1),1);
        angularBuffer  = new THREE.BufferAttribute(new Float32Array(total*1),1);

        // initialize three.js Mesh
        pointGeometry = new THREE.BufferGeometry();

        pointGeometry.addAttribute('position', positionBuffer);
        pointGeometry.addAttribute('velocity', velocityBuffer);
        pointGeometry.addAttribute('life'    , lifeBuffer);
        pointGeometry.addAttribute('size'    , sizeBuffer);
        pointGeometry.addAttribute('rotate'  , rotationBuffer);

        var attribArray = {
            position : {type:'v3', value: null},
            velocity : {type:'v3', value: null},
            life     : {type:'f' , value: null},
            size     : {type:'f' , value: null},
            rotate   : {type:'f' , value: null}
        };

        var uniformArray = {
            color    : {type: 'c', value: new THREE.Color(0xff0000)},
            texture  : {type: 't', value: null},
            maxLife  : {type: 'f', value: seedLife},
            alpha    : {type: 'f', value: 0.0}
        };

        pointMaterial = new THREE.ShaderMaterial({
            attributes: attribArray,
            uniforms: uniformArray,
            vertexShader  : loadFileToString("./shaders/pointCloudVert.glsl"),
            fragmentShader: loadFileToString("./shaders/pointCloudFrag.glsl"),
            transparent : true,
            depthTest : true,
            depthWrite : false,
            blending : blendingType,
            blendEquation : THREE.AddEquation,
            blendSrc : THREE.SrcAlphaFactor,
            blendDst : THREE.DstAlphaFactor
        });

        rtMaterial = new THREE.ShaderMaterial({
            attributes: attribArray,
            uniforms: uniformArray,
            vertexShader  : loadFileToString("./shaders/depthMapVertex.glsl"),
            fragmentShader: loadFileToString("./shaders/depthMapFragment.glsl"),
            transparent : true,
            depthTest : true,
            depthWrite : true
        });

        pointMesh = new THREE.PointCloud(pointGeometry, pointMaterial);
        rtMesh    = new THREE.PointCloud(pointGeometry, rtMaterial);

        if(rtScene != undefined) {
            rtScene.add(rtMesh);
        }
    }

    this.updateParticles = function(dt, terrain) {

        var validCount = 0;
        var validTail = -1;

        var d = new Date();
        var n = d.getTime();

        for(var i=0; i<=tail; i++) {

            if(lifeBuffer.array[i] > 0.0) {

                validCount += 1;
                validTail = i;

                var idx = i*3;

                lifeBuffer.array[i] -= dt;

                var pos = new THREE.Vector3(positionBuffer.array[idx+0], positionBuffer.array[idx+1], positionBuffer.array[idx+2]);
                var vel = new THREE.Vector3(velocityBuffer.array[idx+0], velocityBuffer.array[idx+1], velocityBuffer.array[idx+2]);

                var velMag = vel.length();
                var force = globalForce.clone();

                if(windStrength > 0.0 && velMag > 0.05) {

                    var vx = noiseGen0.noise3d(pos.x/500, pos.z/500, n*0.01);
                    var vy = noiseGen1.noise3d(pos.x/500, pos.z/500, n*0.01);
                    var vz = noiseGen2.noise3d(pos.x/500, pos.z/500, n*0.01);

                    var wind = new THREE.Vector3(vx, vy, vz);
                    vel.addVectors(vel, wind.multiplyScalar(windStrength)); // wind strength
                }


                vel.addVectors(vel, force.multiplyScalar(dt));
                pos.addVectors(pos, vel.clone().multiplyScalar(dt));


                if(objectField != undefined) {
                    objectField.collide(pos, vel);
                }

                velocityBuffer.array[idx+0] = vel.x;
                velocityBuffer.array[idx+1] = vel.y;
                velocityBuffer.array[idx+2] = vel.z;

                positionBuffer.array[idx+0] = pos.x;
                positionBuffer.array[idx+1] = pos.y;
                positionBuffer.array[idx+2] = pos.z;

                rotationBuffer.array[i] += angularBuffer.array[i]*100;


                if(terrain != undefined) {

                    var h = terrain.getHeight(pos.x, pos.z);

                    if (h >= pos.y) {
                        terrain.addDecal(pos);

                        lifeBuffer.array[i] = 0.0;
                        sizeBuffer.array[i] = 0.0;
                    }
                }
            }
            else {
                lifeBuffer.array[i] = 0.0;
                sizeBuffer.array[i] = 0.0;
            }
        }

        count = validCount;
        tail = validTail;

        positionBuffer.needsUpdate = true;
        velocityBuffer.needsUpdate = true;
        lifeBuffer.needsUpdate     = true;
        sizeBuffer.needsUpdate     = true;
        rotationBuffer.needsUpdate = true;

        pointGeometry.computeBoundingBox();
        pointGeometry.computeBoundingSphere();

        pointMesh.geometry.drawcalls.pop();
        pointMesh.geometry.addDrawCall(0,tail+1,0);
    }


    this.addParticle = function(i, pos) {

        if(i >= total) return;

        var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
        dir.normalize();

        if(dir.dot(seedVelDir) < 0.0) {
            dir.multiplyScalar(-1);
        }

        var vel = new THREE.Vector3();
        vel.addVectors(seedVelDir, dir.multiplyScalar(seedSpread));
        vel.normalize();
        vel.multiplyScalar(seedVelMag);

        //

        var idx = i*3;

        lifeBuffer.array[i] = seedLife;
        sizeBuffer.array[i] = Math.random()*seedSize;
        rotationBuffer.array[i] = Math.random()*Math.PI*2.0;
        angularBuffer.array[i] = Math.random()*angularVel;

        positionBuffer.array[idx+0] = pos.x;
        positionBuffer.array[idx+1] = pos.y;
        positionBuffer.array[idx+2] = pos.z;

        velocityBuffer.array[idx+0] = vel.x;
        velocityBuffer.array[idx+1] = vel.y;
        velocityBuffer.array[idx+2] = vel.z;

        count += 1;
        tail = Math.max(i, tail);
    }


    this.addParticle2 = function(pos, vel) {

        var i = count++;
        var idx = i*3;

        tail = Math.max(i, tail);

        lifeBuffer.array[i]  = 100.0;
        sizeBuffer.array[i]  = Math.random()*seedSize;
        rotationBuffer.array[i] = Math.random()*Math.PI*2.0;
        angularBuffer.array[i] = Math.random()*angularVel;

        positionBuffer.array[idx+0] = pos.x;
        positionBuffer.array[idx+1] = pos.y;
        positionBuffer.array[idx+2] = pos.z;

        velocityBuffer.array[idx+0] = vel.x;
        velocityBuffer.array[idx+1] = vel.y;
        velocityBuffer.array[idx+2] = vel.z;


    }

    this.addParticlesFromSphere = function(num, center, rad) {

        var seed = num;

        for(var i=0; i<total; i++) {

            if(lifeBuffer.array[i] <= 0.0) {

                var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
                dir.normalize();
                dir.multiplyScalar(Math.random()*rad);

                var pos = new THREE.Vector3();
                pos.addVectors(center, dir);

                _this.addParticle(i, pos);

                seed -= 1;
            }

            if(seed == 0) {
                break;
            }
        }
    }

    this.addParticlesFromDisk = function(num, center, normal, rad) {

        var seed = num;

        for(var i=0; i<total; i++) {

            if(lifeBuffer.array[i] <= 0.0) {

                var dir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
                dir.normalize();
                dir.multiplyScalar(Math.random()*rad);

                var pos = new THREE.Vector3();
                pos.addVectors(center, dir);

                //

                var deviation = new THREE.Vector3();
                deviation.subVectors(pos, center);

                var nor = normal.clone();
                nor.normalize();

                var dot = nor.dot(deviation);
                nor.multiplyScalar(dot);

                pos.subVectors(pos, nor);

                //

                _this.addParticle(i, pos);

                seed -= 1;
            }

            if(seed == 0) {
                break;
            }
        }
    }

    this.getMesh = function() {
        pointMesh.geometry.drawcalls.pop();
        pointMesh.geometry.addDrawCall(0,tail+1,0);
        pointMesh.renderOrder = 1000;
        return pointMesh;
    }

    this.getScreenMesh = function() {
        return screenMesh;
    }

    this.updateTexture = function(renderer, camera) {

        if(renderer == undefined) {
            return;
        }

        if(rtComposer == undefined) {

            rtComposer = new THREE.EffectComposer(renderer, rtTexture);
            rtComposer.addPass(new THREE.RenderPass(rtScene, camera));

            rtComposer.addPass(new THREE.ShaderPass( THREE.VerticalBlurShader));
            rtComposer.addPass(new THREE.ShaderPass( THREE.HorizontalBlurShader ));
            rtComposer.addPass(new THREE.ShaderPass( THREE.VerticalBlurShader));

            var hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
            rtComposer.addPass( hblur );
        }

        if(rtComposer != undefined) {
            rtComposer.render();
        }
    }
}