

function AdditiveTerrain() {

    var _this = this;

    var min;
    var max;

    var iRes, jRes;
    var dx, dz;
    var du, dv;

    var ptSize = 0.0;

    var positions;
    var indices;
    var texCoords;

    //

    var geometry;
    var material;
    var mesh;

    // textures

    var terrainColor = 0xffffff;
    var decalColor = 0xffffff;


    // decals
    var totalNum;
    var countNum;

    var decalPos;
    var decalTex;

    var decalGeometry;
    var decalMaterial;
    var decalMesh;


    this.initialize = function(vMin, vMax, iSize, jSize, _totalNum, _ptSize, params) {

        min = vMin.clone();
        max = vMax.clone();

        ptSize = _ptSize;
        totalNum = _totalNum;

        iRes = iSize;
        jRes = jSize;

        dx = (max.x - min.x) / iRes;
        dz = (max.z - min.z) / jRes;

        du = 0.01;
        dv = 0.01;

        max = new THREE.Vector3(min.x+iRes*dx, max.y, min.z+jRes*dz);

        var numTri = (iRes-1)*(jRes-1)*2;

        positions = new Float32Array(iRes*jRes*3);
        texCoords = new Float32Array(iRes*jRes*2);
        indices = new Uint32Array(numTri*3);


        for(var j=0; j<jRes; j++) {
            for(var i=0; i<iRes; i++) {

                var idx = j*iRes + i;

                var px = min.x + i*dx;
                var pz = min.z + j*dz;

                var pu = i*du;
                var pv = j*dv;

                //var height = Math.random() * 0.5;
                var height = 0.0;

                positions[idx*3+0] = px;
                positions[idx*3+1] = height + min.y;
                positions[idx*3+2] = pz;

                texCoords[idx*2+0] = pu;
                texCoords[idx*2+1] = pv;
            }
        }

        var c=0;
        for(var j=0; j<jRes-1; j++) {
            for(var i=0; i<iRes-1; i++) {

                var idx = j*iRes + i;

                indices[c++] = idx;
                indices[c++] = idx+1;
                indices[c++] = idx+1+iRes;

                indices[c++] = idx;
                indices[c++] = idx+1+iRes;
                indices[c++] = idx+iRes;
            }
        }

        geometry = new THREE.BufferGeometry();

        geometry.addAttribute('index', new THREE.BufferAttribute(indices, 3));
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('texCoord', new THREE.BufferAttribute(texCoords, 2));


        var tex;
        var dTex;

        if(params != undefined) {

            if(params.terrainColor != undefined) {
                terrainColor = params.terrainColor;
            }
            if(params.decalColor != undefined) {
                decalColor = params.decalColor;
            }
            if(params.terrainImage != undefined) {
                tex = new THREE.ImageUtils.loadTexture(params.terrainImage);
            }
            if(params.decalImage != undefined) {
                dTex = new THREE.ImageUtils.loadTexture(params.decalImage);
            }
        }

        //

        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(100, 100);

        material = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                texCoord : {type:'v2', value: null},
            },
            uniforms: {

                texture  : {type: 't', value: tex},
                color    : {type: 'c', value: new THREE.Color(terrainColor)}
            },
            vertexShader  : loadFileToString("./shaders/additiveTerrainShader.vert"),
            fragmentShader: loadFileToString("./shaders/additiveTerrainShader.frag"),
            side: THREE.DoubleSide,
            //wireframe: false
        });

        //
        mesh = new THREE.Mesh(geometry, material);

        // initialize decals
        countNum = 0;

        decalPos = new THREE.BufferAttribute(new Float32Array(totalNum*3), 3);
        decalTex = new THREE.BufferAttribute(new Float32Array(totalNum*2), 2);

        decalGeometry = new THREE.BufferGeometry();

        decalGeometry.addAttribute('position', decalPos);
        decalGeometry.addAttribute('texCoord', decalTex);


        decalMaterial = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                texCoord : {type:'v2', value: null},
            },
            uniforms: {
                texture  : {type: 't', value: dTex},
                color    : {type: 'c', value: new THREE.Color(decalColor)}
            },
            vertexShader  : loadFileToString("./shaders/additiveTerrainShader.vert"),
            fragmentShader: loadFileToString("./shaders/additiveTerrainShader.frag"),
            side: THREE.BackSide,
            transparent : true,
            depthTest : true,
            depthWrite : false
        });


        decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
    }

    this.getNormal = function(pos) {

        var i = parseInt((pos.x-min.x)/dx);
        var j = parseInt((pos.z-min.z)/dz);

        var idx = parseInt(j*iRes+i);

        var p = new THREE.Vector3(pos.x, 0.0, pos.z);

        var q0 = new THREE.Vector3(min.x+(i+1)*dx, 0.0, min.z+j*dz);
        var q1 = new THREE.Vector3(min.x+i*dx, 0.0, min.z+(j+1)*dz);

        var len0 = p.distanceTo(q0);
        var len1 = p.distanceTo(q1);

        if(len0 <= len1) {

            var v0 = new THREE.Vector3(positions[idx*3+0], positions[idx*3+1], positions[idx*3+2]);
            var v1 = new THREE.Vector3(positions[(idx+1)*3+0], positions[(idx+1)*3+1], positions[(idx+1)*3+2]);
            var v2 = new THREE.Vector3(positions[(idx+1+iRes)*3+0], positions[(idx+1+iRes)*3+1], positions[(idx+1+iRes)*3+2]);

            var nVector = new THREE.Vector3();
            nVector.crossVectors(v1.sub(v0), v2.sub(v0));
            nVector.normalize();

            return nVector;
        }
        else {

            var v0 = new THREE.Vector3(positions[idx*3+0], positions[idx*3+1], positions[idx*3+2]);
            var v1 = new THREE.Vector3(positions[(idx+1+iRes)*3+0], positions[(idx+1+iRes)*3+1], positions[(idx+1+iRes)*3+2]);
            var v2 = new THREE.Vector3(positions[(idx+iRes)*3+0], positions[(idx+iRes)*3+1], positions[(idx+iRes)*3+2]);

            var nVector = THREE.Vector3();
            nVector.crossVectors(v1-v0, v2-v0);
            nVector.normalize();

            return nVector;
        }
    }

    this.getHeight = function(posX, posZ) {

        var i = parseInt((posX-min.x)/dx);
        var j = parseInt((posZ-min.z)/dz);

        var idx = parseInt(j*iRes+i);

        var p = new THREE.Vector3(posX, 0.0, posZ);

        var q0 = new THREE.Vector3(min.x+(i+1)*dx, 0.0, min.z+j*dz);
        var q1 = new THREE.Vector3(min.x+i*dx, 0.0, min.z+(j+1)*dz);

        var len0 = p.distanceTo(q0);
        var len1 = p.distanceTo(q1);

        if(len0 <= len1) {

            var h0 = positions[idx*3+1];
            var h1 = positions[(idx+1)*3+1];
            var h2 = positions[(idx+1+iRes)*3+1];

            var v0 = new THREE.Vector3(positions[idx*3+0], 0.0, positions[idx*3+2]);
            var v1 = new THREE.Vector3(positions[(idx+1)*3+0], 0.0, positions[(idx+1)*3+2]);
            var v2 = new THREE.Vector3(positions[(idx+1+iRes)*3+0], 0.0, positions[(idx+1+iRes)*3+2]);

            var triangle = new THREE.Triangle(v0, v1, v2);
            var b = triangle.barycoordFromPoint(p);

            return b.x * h0 + b.y * h1 + h2 * b.z;
        }
        else {

            var h0 = positions[idx*3+1];
            var h1 = positions[(idx+1+iRes)*3+1];
            var h2 = positions[(idx+iRes)*3+1];

            var v0 = new THREE.Vector3(positions[idx*3+0], 0.0, positions[idx*3+2]);
            var v1 = new THREE.Vector3(positions[(idx+1+iRes)*3+0], 0.0, positions[(idx+1+iRes)*3+2]);
            var v2 = new THREE.Vector3(positions[(idx+iRes)*3+0], 0.0, positions[(idx+iRes)*3+2]);

            var triangle = new THREE.Triangle(v0, v1, v2);
            var b = triangle.barycoordFromPoint(p);

            return b.x * h0 + b.y * h1 + h2 * b.z;
        }
    }

    this.addDecal = function(pos) {

        if(countNum >= totalNum) {
            return;
        }

        var dd = (ptSize*Math.random()*0.5) + ptSize*0.5;
        var padx = dx*1.1;
        var padz = dz*1.1;

        if(pos.x >= max.x-padx || pos.x <= min.x+padx || pos.z >= max.z-padz || pos.z <= min.z+padz) {
            return;
        }

        var i = parseInt((pos.x-dd-min.x)/dx);
        var j = parseInt((pos.z+dd-min.z)/dz);

        var theta = Math.PI*0.5*(0.5-Math.random());

        var c = Math.cos(theta);
        var s = Math.sin(theta);

        var x0 = +dd, z0 = +dd;
        var x1 = -dd, z1 = -dd;

        if(Math.random() > 0.5) {
            x0 = -dd; z0 = -dd;
            x1 = +dd; z1 = +dd;
        }

        var v0 = new THREE.Vector3(x0, _this.getHeight(x0,z0)+5.0, z0);
        var v1 = new THREE.Vector3(x1, _this.getHeight(x1,z0)+5.0, z0);
        var v2 = new THREE.Vector3(x1, _this.getHeight(x1,z1)+5.0, z1);
        var v3 = new THREE.Vector3(x0, _this.getHeight(x0,z1)+5.0, z1);

        v0.setX((v0.x)*c - (v0.z)*s + pos.x);
        v0.setZ((v0.x)*s + (v0.z)*c + pos.z);

        v1.setX((v1.x)*c - (v1.z)*s + pos.x);
        v1.setZ((v1.x)*s + (v1.z)*c + pos.z);

        v2.setX((v2.x)*c - (v2.z)*s + pos.x);
        v2.setZ((v2.x)*s + (v2.z)*c + pos.z);

        v3.setX((v3.x)*c - (v3.z)*s + pos.x);
        v3.setZ((v3.x)*s + (v3.z)*c + pos.z);


        var ix = countNum*3;

        decalPos.array[ix+0] = v0.x; decalPos.array[ix+1] = v0.y; decalPos.array[ix+2] = v0.z;
        decalPos.array[ix+3] = v1.x; decalPos.array[ix+4] = v1.y; decalPos.array[ix+5] = v1.z;
        decalPos.array[ix+6] = v2.x; decalPos.array[ix+7] = v2.y; decalPos.array[ix+8] = v2.z;

        decalPos.array[ix+9]  = v0.x; decalPos.array[ix+10] = v0.y; decalPos.array[ix+11] = v0.z;
        decalPos.array[ix+12] = v2.x; decalPos.array[ix+13] = v2.y; decalPos.array[ix+14] = v2.z;
        decalPos.array[ix+15] = v3.x; decalPos.array[ix+16] = v3.y; decalPos.array[ix+17] = v3.z;

        ix = countNum*2;

        decalTex.array[ix+0] = 0.0; decalTex.array[ix+1] = 0.0;
        decalTex.array[ix+2] = 1.0; decalTex.array[ix+3] = 0.0;
        decalTex.array[ix+4] = 1.0; decalTex.array[ix+5] = 1.0;

        decalTex.array[ix+6]  = 0.0; decalTex.array[ix+7]  = 0.0;
        decalTex.array[ix+8]  = 1.0; decalTex.array[ix+9]  = 1.0;
        decalTex.array[ix+10] = 0.0; decalTex.array[ix+11] = 1.0;

        countNum += 6;

        decalMesh.geometry.drawcalls.pop();
        decalMesh.geometry.addDrawCall(0, countNum, 0);

        decalPos.needsUpdate = true;
        decalTex.needsUpdate = true;
    }

    this.getMesh = function() {
        return mesh;
    }

    this.getDecalMesh = function() {
        return decalMesh;
    }

    this.clearDecals = function() {
        countNum = 0;
    }
}