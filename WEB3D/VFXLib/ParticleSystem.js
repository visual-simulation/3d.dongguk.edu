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
    var shapeBuffer;

    var total;
    var count;
    var tail;

    // seed properties
    var seedVelDir;
    var seedVelMag;
    var seedLife;
    var seedSize;
    var seedSpread;

    var particleColor;

    var globalForce;
    var windStrength = 0;

    // render options for three.js
    var pointGeometry;
    var pointMaterial;
    var pointMesh;

    var basicMaterial;

    //
    var objectField;

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

    this.initialize = function(_total) {

        seedVelDir = new THREE.Vector3(0, 1, 0);
        seedVelMag = 0.1;
        seedLife = 3;
        seedSize = 0.1;
        seedSpread = 0.2;
        globalForce = new THREE.Vector3(0, 0, 0);

        //

        total = _total;
        count = 0;
        tail = -1;

        positionBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        velocityBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        lifeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);
        sizeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);
        shapeBuffer    = new THREE.BufferAttribute(new Float32Array(total*1),1);

        // initialize three.js Mesh
        pointGeometry = new THREE.BufferGeometry();

        pointGeometry.addAttribute('position', positionBuffer);
        pointGeometry.addAttribute('velocity', velocityBuffer);
        pointGeometry.addAttribute('life'    , lifeBuffer);
        pointGeometry.addAttribute('size'    , sizeBuffer);
        pointGeometry.addAttribute('shape'   , shapeBuffer);


        var tex = new THREE.ImageUtils.loadTexture("./textures/flame.png");
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        pointMaterial = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                velocity : {type:'v3', value: null},
                life     : {type:'f' , value: null},
                size     : {type:'f' , value: null},
                shape    : {type:'f' , value: null}
            },
            uniforms: {
                color    : {type: 'c', value: new THREE.Color(0xffffff)},
                texture  : {type: 't', value: tex},
                maxLife  : {type: 'f', value: seedLife},
                alpha    : {type: 'f', value: 1.0}
            },
            vertexShader  : loadFileToString("./shaders/pointCloudVert.glsl"),
            fragmentShader: loadFileToString("./shaders/pointCloudFrag.glsl"),
            transparent : true,
            depthTest : true,
            depthWrite : false,
            blending : THREE.CustomBlending,
            blendEquation : THREE.AddEquation,
            blendSrc : THREE.SrcAlphaFactor,
            blendDst : THREE.DstAlphaFactor
        });

        basicMaterial = new THREE.PointCloudMaterial({
            color: 0x0000ff
        });
        basicMaterial.size = 10.0;

        pointMesh = new THREE.PointCloud(pointGeometry, pointMaterial);
    }

    this.spreadForce = function(acc) {

        if(Math.random() < 0.3) return acc.clone();

        return acc.clone();

        var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
        dir.normalize();

        if(dir.dot(acc) < 0.0) {
            dir.multiplyScalar(-1);
        }

        var accMag = acc.length();
        var accDir = new THREE.Vector3(acc.x, acc.y, acc.z);
        accDir.normalize();

        var spreadAcc = new THREE.Vector3();
        spreadAcc.addVectors(accDir, dir.multiplyScalar(2));
        spreadAcc.normalize();
        spreadAcc.multiplyScalar(accMag);

        return spreadAcc;
    }

    this.updateParticles = function(dt) {

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

                //var force = _this.spreadForce(globalForce);
                var force = globalForce.clone();

                if(windStrength > 0.0) {

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
        shapeBuffer.needsUpdate    = true;

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

        lifeBuffer.array[i]  = Math.random()*seedLife;
        sizeBuffer.array[i]  = Math.random()*seedSize;
        shapeBuffer.array[i] = Math.random()*Math.PI*2.0;

        positionBuffer.array[idx+0] = pos.x;
        positionBuffer.array[idx+1] = pos.y;
        positionBuffer.array[idx+2] = pos.z;

        velocityBuffer.array[idx+0] = vel.x;
        velocityBuffer.array[idx+1] = vel.y;
        velocityBuffer.array[idx+2] = vel.z;

        count += 1;
        tail = Math.max(i, tail);
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
        return pointMesh;
    }
}