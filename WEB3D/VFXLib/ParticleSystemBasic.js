
function loadFileToString(path) {

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


function ParticleSystemBasic() {

    var _this = this;

    var positionBuffer;
    var velocityBuffer;
    var lifeBuffer;
    var sizeBuffer;

    var total;
    var count;
    var tail;

    // seed properties
    var seedVelDir;
    var seedVelMag;
    var seedLife;
    var seedSize;
    var seedSpread;

    var globalForce;

    // render options for three.js
    var pointGeometry;
    var pointMaterial;
    var pointMesh;

    this.initialize = function(_total) {

        seedVelDir = new THREE.Vector3(0, 0, 0);
        seedVelMag = 0.0;
        seedLife = 10;
        seedSize = 2;
        seedSpread = 0.2;

        globalForce = new THREE.Vector3(0, -100, 0);

        //

        total = _total;
        count = 0;
        tail = -1;

        positionBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        velocityBuffer = new THREE.BufferAttribute(new Float32Array(total*3),3);
        lifeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);
        sizeBuffer     = new THREE.BufferAttribute(new Float32Array(total*1),1);

        // initialize three.js Mesh
        pointGeometry = new THREE.BufferGeometry();

        pointGeometry.addAttribute('position', positionBuffer);
        pointGeometry.addAttribute('velocity', velocityBuffer);
        pointGeometry.addAttribute('life'    , lifeBuffer);
        pointGeometry.addAttribute('size'    , sizeBuffer);

        pointMaterial = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                velocity : {type:'v3', value: null},
                life     : {type:'f' , value: null},
                size     : {type:'f' , value: null}
            },
            uniforms: {
                color    : {type: 'c', value: new THREE.Color(0xffffff)},
                texture  : {type: 't', value: new THREE.ImageUtils.loadTexture("./textures/spark.png")}
            },
            vertexShader  : loadFileToString("./shaders/pointCloudVert.glsl"),
            fragmentShader: loadFileToString("./shaders/pointCloudFrag.glsl"),
            depthTest : false,
            transparent : true,
            side: THREE.DoubleSide
        });

        pointMesh = new THREE.PointCloud(pointGeometry, pointMaterial);
    }

    this.spreadForce = function(acc) {

        if(Math.random() < 0.5) return acc.clone();

        var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
        dir.normalize();

        if(dir.dot(acc) < 0.0) {
            dir.multiplyScalar(-1);
        }

        var accMag = acc.length();
        var accDir = new THREE.Vector3(acc.x, acc.y, acc.z);
        accDir.normalize();

        var spreadAcc = new THREE.Vector3();
        spreadAcc.addVectors(accDir, dir.multiplyScalar(1.0));
        spreadAcc.normalize();
        spreadAcc.multiplyScalar(accMag);

        return spreadAcc;
    }

    this.updateParticles = function(dt) {

        var validCount = 0;
        var validTail = -1;

        for(var i=0; i<=tail; i++) {

            if(lifeBuffer.array[i] > 0.0) {

                validCount += 1;
                validTail = i;

                var idx = i*3;

                lifeBuffer.array[i] -= dt;

                var pos = new THREE.Vector3(positionBuffer.array[idx+0], positionBuffer.array[idx+1], positionBuffer.array[idx+2]);
                var vel = new THREE.Vector3(velocityBuffer.array[idx+0], velocityBuffer.array[idx+1], velocityBuffer.array[idx+2]);

                var force = _this.spreadForce(globalForce);

                vel.addVectors(vel, force.multiplyScalar(dt));

                velocityBuffer.array[idx+0] = vel.x;
                velocityBuffer.array[idx+1] = vel.y;
                velocityBuffer.array[idx+2] = vel.z;

                pos.addVectors(pos, vel.multiplyScalar(dt));

                positionBuffer.array[idx+0] = pos.x;
                positionBuffer.array[idx+1] = pos.y;
                positionBuffer.array[idx+2] = pos.z;

            }
        }

        count = validCount;
        tail = validTail;

        positionBuffer.needsUpdate = true;
        velocityBuffer.needsUpdate = true;
        lifeBuffer.needsUpdate     = true;
        sizeBuffer.needsUpdate     = true;

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
        sizeBuffer.array[i] = seedSize;

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

        for(var i=0; i < total; i++) {

            if(lifeBuffer.array[i] <= 0.0) {

                var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
                dir.normalize();
                dir.multiplyScalar(rad);

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

    this.getMesh = function() {
        pointMesh.geometry.drawcalls.pop();
        pointMesh.geometry.addDrawCall(0,tail+1,0);
        return pointMesh;
    }
}