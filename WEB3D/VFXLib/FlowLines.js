function FlowLines() {

    var points = [];

    var positionBuffer = [];
    var uvBuffer       = [];

    var totalIRes = 0;
    var totalJRes = 0;

    var positionAttrib;
    var uvAttrib;
    var alphaAttrib;
    var indexAttrib;

    var geometry;
    var mesh;
    var flowMaterial;

    var time = 0.0;
    var velocity = -0.2;

    this.save = function(fileName) {

        var data = {
            points: points
        }

        var json = JSON.stringify(data);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.download = fileName;
        a.href = url;

        a.click();
    }

    this.update = function(dt) {

        if(mesh == undefined) return;

        time += dt;
        flowMaterial.uniforms.time = {type:'f', value:time};
        flowMaterial.needsUpdate = true;
        mesh.needsUpdate = true;
    }

    this.updateTerrain = function(terrain) {

        var num = totalIRes*totalJRes;

        var offset = terrain.getDx()*0.2;

        for(var i=0; i<num; i++) {

            var x = positionAttrib.array[i*3+0];
            var z = positionAttrib.array[i*3+2];

            var y = terrain.getHeight(x,z);

            positionAttrib.array[i*3+1] = y + offset + Math.random()*5.0
        }

        positionAttrib.needsUpdate = true;
    }

    this.generateGeometry = function() {

        var numTri = (totalIRes-1)*(totalJRes-1)*2;
        var vertexTotal = totalIRes * totalJRes;

        positionAttrib = new THREE.BufferAttribute(new Float32Array(totalIRes*totalJRes*3), 3);
        uvAttrib       = new THREE.BufferAttribute(new Float32Array(totalIRes*totalJRes*2), 2);
        alphaAttrib    = new THREE.BufferAttribute(new Float32Array(totalIRes*totalJRes*1), 1);
        indexAttrib    = new THREE.BufferAttribute(new Uint32Array(numTri*3), 3);

        for(var i=0; i<vertexTotal; i++) {

            var pos = positionBuffer[i];
            var uv  = uvBuffer[i];

            positionAttrib.array[i*3+0] = pos.x;
            positionAttrib.array[i*3+1] = pos.y + Math.random()*3.0;
            positionAttrib.array[i*3+2] = pos.z;

            uvAttrib.array[i*2+0] = uv.x;
            uvAttrib.array[i*2+1] = uv.y;
        }

        var c=0;
        for(var j=0; j<totalJRes-1; j++) {

            for(var i=0; i<totalIRes-1; i++) {

                var idx = j*totalIRes + i;

                indexAttrib.array[c++] = idx;
                indexAttrib.array[c++] = idx+1;
                indexAttrib.array[c++] = idx+1+totalIRes;

                indexAttrib.array[c++] = idx;
                indexAttrib.array[c++] = idx+1+totalIRes;
                indexAttrib.array[c++] = idx+totalIRes;
            }
        }

        for(var j=0; j<totalJRes; j++) {

            var u = Math.abs(j-totalJRes*0.5)/(totalJRes*0.5);

            var alpha = 15.0/16.0*Math.pow(1.0-u*u, 3);

            for(var i=0; i<totalIRes; i++) {

                var idx = j*totalIRes + i;
                alphaAttrib.array[idx] = alpha;
            }
        }

        //

        geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', positionAttrib);
        geometry.addAttribute('uv'      , uvAttrib      );
        geometry.addAttribute('index'   , indexAttrib   );
        geometry.addAttribute('alpha'   , alphaAttrib   );



        var texture = new THREE.ImageUtils.loadTexture("./textures/resizeFlame.jpg");
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100);

        var basicMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(0xffffff), map:texture});

        flowMaterial = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                uv       : {type:'v2', value: null},
                alpha    : {type:'f' , value: null}
            },
            uniforms: {
                time     : {type:'f', value: time},
                velocity : {type:'f', value: velocity},
                texture  : {type:'t', value: texture}
            },
            vertexShader : loadFileToString('./shaders/FlowTexVertexShader.glsl'),
            fragmentShader : loadFileToString('./shaders/FlowTexFragmentShader.glsl'),
            side: THREE.DoubleSide,
            transparent: true
        });


        mesh = new THREE.Mesh(geometry, flowMaterial);
    }

    this.getMesh = function() {
        return mesh;
    }

    this.addLinePoint = function(point) {
        points.push(point);
    }

    this.addLinesPointsFromJSON = function(fileName) {

        var json = loadFileToString(fileName);
        var data = JSON.parse(json);

        points = data.points;
    }

    this.generate = function() {

        var width = 500.0;
        var iRes = 20;
        var jRes = 20;

        var dy = width/jRes;

        var dv = 0.1;
        var du = dv;

        var u = 0.0;
        var v = 0.0;

        for(var m=0; m<jRes; m++) {

            var count = 0;
            u = 0.0;

            for(var i=0; i<points.length-1; i++) {

                var dir0;
                var dir1;

                if(i > 0) {
                    dir0 = new THREE.Vector3(points[i+1].x-points[i-1].x, points[i+1].y-points[i-1].y, points[i+1].z-points[i-1].z);
                }
                else {
                    dir0 = new THREE.Vector3(points[i+1].x-points[i].x, points[i+1].y-points[i].y, points[i+1].z-points[i].z);
                }

                if(i == points.length-2) {
                    dir1 = new THREE.Vector3(points[i+1].x-points[i].x, points[i+1].y-points[i].y, points[i+1].z-points[i].z);
                }
                else {
                    dir1 = new THREE.Vector3(points[i+2].x-points[i].x, points[i+2].y-points[i].y, points[i+2].z-points[i].z);
                }

                var tan0 = new THREE.Vector3();
                tan0 = tan0.crossVectors(dir0, new THREE.Vector3(0.0, 1.0, 0.0));
                tan0 = tan0.normalize();

                var tan1 = new THREE.Vector3();
                tan1 = tan1.crossVectors(dir1, new THREE.Vector3(0.0, 1.0, 0.0));
                tan1 = tan1.normalize();

                tan0 = tan0.multiplyScalar(width*0.5-dy*m);
                tan1 = tan1.multiplyScalar(width*0.5-dy*m);

                var p0 = new THREE.Vector3().addVectors(points[i]  , tan0);
                var p1 = new THREE.Vector3().addVectors(points[i+1], tan1);

                var dev = new THREE.Vector3().subVectors(p1, p0);
                var dir = new THREE.Vector3().copy(dev);
                dir.normalize();

                var length = dev.length();
                var dx = length/iRes;

                du = dv/width * length;

                for(var n=0; n<iRes; n++) {

                    var forward = new THREE.Vector3().copy(dir);
                    forward.multiplyScalar(dx*n);

                    var pos = new THREE.Vector3().addVectors(p0, forward);

                    positionBuffer.push(pos);
                    uvBuffer.push(new THREE.Vector2(u, v));

                    count++;
                    u += du;
                }
            }

            v += dv;

            totalIRes = count;
            totalJRes = jRes;
        }
    }
}