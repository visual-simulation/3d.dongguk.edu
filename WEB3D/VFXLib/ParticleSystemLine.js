document.write("<script type='text/javascript' src='./GlobalDefinition.js'><"+"/script>");
document.write("<script type='text/javascript' src='./NoiseGenerator.js'><"+"/script>");
document.write("<script type='text/javascript' src='./ObjectField.js'><"+"/script>");


function ParticleSystemLine() {

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

        if(params.shape != undefined) {
            shapeBuffer.array[i] = params.shape;
        }
    }

    this.getParticle = function(i) {
        var idx = i*3;
        return {position: new THREE.Vector3(positionBuffer.array[idx+0], positionBuffer.array[idx+1], positionBuffer.array[idx+2]),
                velocity: new THREE.Vector3(positionBuffer.array[idx+0], positionBuffer.array[idx+1], positionBuffer.array[idx+2]),
                life: lifeBuffer.array[i],
                size: sizeBuffer.array[i],
                shape: shapeBuffer.array[i]};
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

        positionBuffer = new THREE.BufferAttribute(new Float32Array(total*3*2),3);

        velocityBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        sizeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);
        lifeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);

        // initialize three.js Mesh
        pointGeometry = new THREE.BufferGeometry();

        pointGeometry.addAttribute('position', positionBuffer);
        //pointGeometry.addAttribute('velocity', velocityBuffer);


        var material = new THREE.LineBasicMaterial({
            color: 0x034aec,
            transparent: true,
            opacity: 0.5
        });

        pointMesh = new THREE.Line(pointGeometry, material, THREE.LinePieces);
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

                var pos = new THREE.Vector3(positionBuffer.array[idx*2+0], positionBuffer.array[idx*2+1], positionBuffer.array[idx*2+2]);
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

                positionBuffer.array[idx*2+0] = pos.x;
                positionBuffer.array[idx*2+1] = pos.y;
                positionBuffer.array[idx*2+2] = pos.z;

                var size = sizeBuffer.array[i];
                var dir = vel.clone();
                dir.normalize();
                dir.multiplyScalar(size);

                var qq = pos.clone();
                qq.add(dir);

                positionBuffer.array[idx*2+3] = qq.x;
                positionBuffer.array[idx*2+4] = qq.y;
                positionBuffer.array[idx*2+5] = qq.z;


                if(terrain != undefined) {
                    var h = terrain.getHeight(pos.x, pos.z);

                    if (h > pos.y) {
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

        idx = i*3;

        lifeBuffer.array[i]  = Math.random()*seedLife;
        sizeBuffer.array[i]  = Math.random()*seedSize;

        velocityBuffer.array[idx+0] = vel.x;
        velocityBuffer.array[idx+1] = vel.y;
        velocityBuffer.array[idx+2] = vel.z;

        positionBuffer.array[idx*2+0] = pos.x;
        positionBuffer.array[idx*2+1] = pos.y;
        positionBuffer.array[idx*2+2] = pos.z;

        positionBuffer.array[idx*2+3] = pos.x;
        positionBuffer.array[idx*2+4] = pos.y;
        positionBuffer.array[idx*2+5] = pos.z;

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