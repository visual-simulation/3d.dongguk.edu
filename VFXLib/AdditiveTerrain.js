

function AdditiveTerrain() {

    var _this = this;

    // terrain info

    var min;
    var max;

    var iRes, jRes;
    var dx, dz;
    var du, dv;

    var positionAttrib;
    var normalAttrib;
    var uvAttrib;
    var indexAttrib;

    // Mesh info

    var geometry;
    var material;
    var mesh;

    // textures

    var terrainColor = 0xffffff;
    var decalColor = 0xffffff;


    // decals

    var ptSize = 0.0;

    var totalNum;
    var countNum;

    var decalPos;
    var decalTex;

    var decalGeometry;
    var decalMaterial;
    var decalMesh;

    this.save = function(fileName) {

        var data = {
            min: min, max: max,
            iRes: iRes, jRes: jRes,
            dx: dx, dz: dz,
            du: du, dv: dv,
            position: positionAttrib.array
        }

        var json = JSON.stringify(data);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.download = fileName;
        a.href = url;

        a.click();
    }

    this.load = function(fileName) {

    }

    this.getDx = function() {
        return dx;
    }

    this.getDz = function() {
        return dz;
    }

    this.initialize = function(vMin, vMax, iSize, jSize, _totalNum, _ptSize, params) {

        var data = undefined;

        if(params.load == undefined) {

            min = vMin.clone();
            max = vMax.clone();

            iRes = iSize;
            jRes = jSize;

            dx = (max.x - min.x) / iRes;
            dz = (max.z - min.z) / jRes;

            du = 0.1;
            dv = 0.1;

            max = new THREE.Vector3(min.x+iRes*dx, max.y, min.z+jRes*dz);
        }
        else {

            var json = loadFileToString(params.load);
            data = JSON.parse(json);

            min = data.min;
            max = data.max;

            iRes = data.iRes;
            jRes = data.jRes;

            dx = data.dx;
            dz = data.dz;

            du = data.du;
            dv = data.dv;
        }

        ptSize = _ptSize;
        totalNum = _totalNum;

        var numTri = (iRes-1)*(jRes-1)*2;

        positionAttrib = new THREE.BufferAttribute(new Float32Array(iRes*jRes*3), 3);
        normalAttrib   = new THREE.BufferAttribute(new Float32Array(iRes*jRes*3), 3);
        uvAttrib       = new THREE.BufferAttribute(new Float32Array(iRes*jRes*2), 2);
        indexAttrib    = new THREE.BufferAttribute(new Uint32Array(numTri*3)    , 3);


        for(var j=0; j<jRes; j++) {
            for(var i=0; i<iRes; i++) {

                var idx = j*iRes + i;

                var px = min.x + i*dx;
                var pz = min.z + j*dz;

                var pu = i*du;
                var pv = j*dv;

                //var height = Math.random() * 0.5;
                var height = 0.0;

                if(data == undefined) {

                    positionAttrib.array[idx*3+0] = px;
                    positionAttrib.array[idx*3+1] = height+min.y;
                    positionAttrib.array[idx*3+2] = pz;
                }
                else {

                    positionAttrib.array[idx*3+0] = data.position[idx*3+0];
                    positionAttrib.array[idx*3+1] = data.position[idx*3+1];
                    positionAttrib.array[idx*3+2] = data.position[idx*3+2];
                }

                uvAttrib.array[idx*2+0] = pu;
                uvAttrib.array[idx*2+1] = pv;
            }
        }

        for(var j=1; j<=jRes-2; j++) {
            for(var i=1; i<=iRes-2; i++) {

                var idx = j*iRes + i;

                var v0 = new THREE.Vector3(
                    positionAttrib.array[(idx+1)*3+0]-positionAttrib.array[(idx-1)*3+0],
                    positionAttrib.array[(idx+1)*3+1]-positionAttrib.array[(idx-1)*3+1],
                    positionAttrib.array[(idx+1)*3+2]-positionAttrib.array[(idx-1)*3+2]
                );

                var v1 = new THREE.Vector3(
                    positionAttrib.array[(idx+iRes)*3+0]-positionAttrib.array[(idx-iRes)*3+0],
                    positionAttrib.array[(idx+iRes)*3+1]-positionAttrib.array[(idx-iRes)*3+1],
                    positionAttrib.array[(idx+iRes)*3+2]-positionAttrib.array[(idx-iRes)*3+2]
                );

                var nor = new THREE.Vector3();
                nor = nor.crossVectors(v0, v1);
                nor = nor.normalize(nor);

                normalAttrib.array[idx*3+0] = nor.x;
                normalAttrib.array[idx*3+1] = nor.y;
                normalAttrib.array[idx*3+2] = nor.z;
            }
        }

        var c=0;
        for(var j=0; j<jRes-1; j++) {
            for(var i=0; i<iRes-1; i++) {

                var idx = j*iRes + i;

                indexAttrib.array[c++] = idx;
                indexAttrib.array[c++] = idx+1;
                indexAttrib.array[c++] = idx+1+iRes;

                indexAttrib.array[c++] = idx;
                indexAttrib.array[c++] = idx+1+iRes;
                indexAttrib.array[c++] = idx+iRes;
            }
        }

        geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', positionAttrib);
        geometry.addAttribute('normal'  , normalAttrib  );
        geometry.addAttribute('uv'      , uvAttrib      );
        geometry.addAttribute('index'   , indexAttrib   );

        var tex;
        var tex2;

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
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(100, 100);

                tex2 = tex;
            }
            if(params.terrainImage1 != undefined) {
                tex2 = new THREE.ImageUtils.loadTexture(params.terrainImage1);
                tex2.minFilter = THREE.LinearFilter;
                tex2.magFilter = THREE.LinearFilter;
                tex2.wrapS = THREE.RepeatWrapping;
                tex2.wrapT = THREE.RepeatWrapping;
                tex2.repeat.set(100, 100);
            }
            if(params.decalImage != undefined) {
                dTex = new THREE.ImageUtils.loadTexture(params.decalImage);
            }
        }

        //

        material = new THREE.ShaderMaterial({
            attributes: {
                position : {type:'v3', value: null},
                normal   : {type:'v3', value: null},
                uv       : {type:'v2', value: null},
            },
            uniforms: {
                texture  : {type: 't', value: tex},
                texture2 : {type: 't', value: tex2},
                color    : {type: 'c', value: new THREE.Color(terrainColor)}

            },
            vertexShader  : loadFileToString("./shaders/additiveTerrainShader.vert"),
            fragmentShader: loadFileToString("./shaders/additiveTerrainShader.frag"),
            side: THREE.DoubleSide,
            wireframe: false,
        });

        //
        mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;

        // initialize decals
        countNum = 0;

        decalPos = new THREE.BufferAttribute(new Float32Array(totalNum*3), 3);
        decalTex = new THREE.BufferAttribute(new Float32Array(totalNum*2), 2);

        decalGeometry = new THREE.BufferGeometry();

        decalGeometry.addAttribute('position', decalPos);
        decalGeometry.addAttribute('uv', decalTex);


        decalMaterial = new THREE.MeshBasicMaterial({
            map: dTex,
            color: new THREE.Color(decalColor),
            side: THREE.BackSide,
            transparent : true,
            depthTest : true,
            depthWrite : false
        });


        decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
    }

    this.getHeight = function(x, z) {

        var i = parseInt((x-min.x)/dx);
        var j = parseInt((z-min.z)/dz);

        var idx = parseInt(j*iRes+i);

        var p = new THREE.Vector2((min.x)+i*dx, (min.z)+j*dz);

        var v00 = positionAttrib.array[idx*3+1];
        var v01 = positionAttrib.array[(idx+1)*3+1];
        var v10 = positionAttrib.array[(idx+iRes)*3+1];
        var v11 = positionAttrib.array[(idx+iRes+1)*3+1];

        var vv0 = v00*(1.0-(x-p.x)/dx) + v01*((x-p.x)/dx);
        var vv1 = v10*(1.0-(x-p.x)/dx) + v11*((x-p.x)/dx);

        var val = vv0*(1.0-(z-p.y)/dz) + vv1*((z-p.y)/dz);

        return val;
    }

    this.setHeight = function(ci, cj, h) {

        var d = 10.0;

        var start_i = Math.max(ci-d-10, 0);
        var end_i   = Math.min(ci+d+10, iRes-1);

        var start_j = Math.max(cj-d-10, 0);
        var end_j   = Math.min(cj+d+10, jRes-1);

        var center = new THREE.Vector2(ci,cj);

        for(var j=start_j; j<=end_j; j++) {
            for(var i=start_i; i<=end_i; i++) {

                var p = new THREE.Vector2(i,j);
                var dist = p.distanceTo(center);

                if(dist <= d) {

                    var u = dist/d;
                    var w = 70.0/80.0*Math.pow(1-u*u*u, 3);

                    var idx = parseInt(j*iRes+i);
                    positionAttrib.array[idx*3+1] += h*w;
                }
            }
        }

        for(var j=start_j; j<=end_j; j++) {
            for(var i=start_i; i<=end_i; i++) {

                var idx = parseInt(j*iRes+i);

                var v0 = new THREE.Vector3(
                    positionAttrib.array[(idx+1)*3+0]-positionAttrib.array[(idx-1)*3+0],
                    positionAttrib.array[(idx+1)*3+1]-positionAttrib.array[(idx-1)*3+1],
                    positionAttrib.array[(idx+1)*3+2]-positionAttrib.array[(idx-1)*3+2]
                );

                var v1 = new THREE.Vector3(
                    positionAttrib.array[(idx+iRes)*3+0]-positionAttrib.array[(idx-iRes)*3+0],
                    positionAttrib.array[(idx+iRes)*3+1]-positionAttrib.array[(idx-iRes)*3+1],
                    positionAttrib.array[(idx+iRes)*3+2]-positionAttrib.array[(idx-iRes)*3+2]
                );

                var nor = new THREE.Vector3();
                nor = nor.crossVectors(v0, v1);
                nor = nor.normalize(nor);

                normalAttrib.array[idx*3+0] = nor.x;
                normalAttrib.array[idx*3+1] = nor.y;
                normalAttrib.array[idx*3+2] = nor.z;
            }
        }

        positionAttrib.needsUpdate = true;
        normalAttrib.needsUpdate = true;
    }

    this.getIndex = function(pos) {
        return new THREE.Vector2((pos.x-min.x)/dx, (pos.z-min.z)/dz);
    }

    this.addDecal = function(pos) {

        if(countNum >= totalNum) {
            return;
        }

        if(pos.x >= max.x || pos.x <= min.x || pos.z >= max.z || pos.z <= min.z) {
            return;
        }

        var dd = (ptSize*Math.random()*0.5) + ptSize*0.5;

        var theta = Math.PI*0.5*(0.5-Math.random());
        if(Math.random() > 0.5) {
            theta *= -1.0;
        }

        var c = Math.cos(theta);
        var s = Math.sin(theta);

        var x0 = -dd, z0 = -dd;
        var x1 = +dd, z1 = +dd;

        //var v0 = new THREE.Vector3(x0, _this.getHeight(x0,z0)+5.0, z0);
        //var v1 = new THREE.Vector3(x1, _this.getHeight(x1,z0)+5.0, z0);
        //var v2 = new THREE.Vector3(x1, _this.getHeight(x1,z1)+5.0, z1);
        //var v3 = new THREE.Vector3(x0, _this.getHeight(x0,z1)+5.0, z1);

        var v0 = new THREE.Vector3(x0, 0.0, z0);
        var v1 = new THREE.Vector3(x1, 0.0, z0);
        var v2 = new THREE.Vector3(x1, 0.0, z1);
        var v3 = new THREE.Vector3(x0, 0.0, z1);

        var offset = dx*0.2;

        v0.setX((v0.x)*c - (v0.z)*s + pos.x);
        v0.setZ((v0.x)*s + (v0.z)*c + pos.z);
        v0.setY(_this.getHeight(v0.x, v0.z)+offset);

        v1.setX((v1.x)*c - (v1.z)*s + pos.x);
        v1.setZ((v1.x)*s + (v1.z)*c + pos.z);
        v1.setY(_this.getHeight(v1.x, v1.z)+offset);

        v2.setX((v2.x)*c - (v2.z)*s + pos.x);
        v2.setZ((v2.x)*s + (v2.z)*c + pos.z);
        v2.setY(_this.getHeight(v2.x, v2.z)+offset);

        v3.setX((v3.x)*c - (v3.z)*s + pos.x);
        v3.setZ((v3.x)*s + (v3.z)*c + pos.z);
        v3.setY(_this.getHeight(v3.x, v3.z)+offset);


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
        mesh.renderOrder = 1000;
        return mesh;
    }

    this.getDecalMesh = function() {
        mesh.renderOrder = 1001;
        return decalMesh;
    }

    this.clearDecals = function() {
        countNum = 0;
    }
}