
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

    this.position;
    this.velocity;
    this.lifeTime;
    this.size;

    var count;

    // render options for three.js
    var pointGeometry;
    var pointMaterial;
    var pointMesh;

    this.initialize = function () {

        count = 0;

        _this.position = []; //= new Float32Array(totalSize*3);
        _this.velocity = []; //= new Float32Array(totalSize*3);
        _this.lifeTime = []; //= new Float32Array(totalSize);
        _this.size     = []; //= new Float32Array(totalSize);

        // initialize three.js Mesh
        pointGeometry = new THREE.Geometry();
        pointMaterial = new THREE.RawShaderMaterial({
            vertexShader  : loadFileToString("./shaders/pointCloudVert.glsl"),
            fragmentShader: loadFileToString("./shaders/pointCloudFrag.glsl")
        });

        pointMesh = new THREE.PointCloud(pointGeometry, pointMaterial);
    }

    this.updateParticles = function(dt) {

        var idx = 0;
        var len = _this.position.length;

        for(var i=0; i<=len; i++) {

            if(_this.lifeTime[i] > 0.0) {

                pointGeometry.vertices[idx] = _this.position[i];

                idx++;
            }
        }

        count = idx;
    }

    this.addParticles = function(idx, pos) {


    }

    this.addParticlesFromSphere = function(num, center, rad) {

        var seed = num;
        var len = _this.position.length;

        for(var i=0; i < len; i++) {

            if(seed == 0) break;

            if(_this.lifeTime[i] <= 0.0) {

                var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
                dir.normalize();
                dir.multiplyScalar(rad);

                var pos = new THREE.Vector3();
                pos.addVectors(center, dir);

                _this.lifeTime[i] = 100;
                _this.position[i] = pos;

                seed -= 1;
            }
        }

        for(var i=0; i<seed; i++) {

            var dir = new THREE.Vector3((Math.random()-0.5), (Math.random()-0.5), (Math.random()-0.5));
            dir.normalize();
            dir.multiplyScalar(rad);

            var pos = new THREE.Vector3();
            pos.addVectors(center, dir);

            _this.lifeTime.push(100);
            _this.position.push(pos);

            seed -= 1;
        }
    }

    this.getMesh = function() {
        return pointMesh;
    }
}