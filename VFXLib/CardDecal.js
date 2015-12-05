
function CardDecal() {

    var _this = this;

    var geometry;
    var mesh;
    var meshBottom;

    //
    var width, depth;

    //
    var rotate = 0;
    var scaleX = 1, scaleY = 1, scaleZ = 1;
    var transX = 0, transY = 0, transZ = 0;
    var rotateEnd = Math.PI * 0.5;

    this.setRotateEnd = function(phi) {
        rotateEnd = phi;
    }

    this.initialize = function(params) {

        width = params.width;
        depth = params.depth;

        transX = params.px;
        transY = params.py;
        transZ = params.pz;

        scaleX = params.sx;
        scaleY = params.sy;
        scaleZ = params.sz;

        var texture = THREE.ImageUtils.loadTexture(params.imagePath);
        var cardMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.SmoothShading,
            side:params.side, map:texture, transparent: true, depthTest: true, depthWrite:true } );

        geometry = new THREE.PlaneBufferGeometry(width, depth, 2, 2);
        mesh = new THREE.Mesh(geometry, cardMaterial);

        mesh.matrix = new THREE.Matrix4();

        var sclMatrix = new THREE.Matrix4();
        sclMatrix.makeScale(scaleX, scaleY, scaleZ);

        var rotMatrix = new THREE.Matrix4();
        rotMatrix.makeRotationAxis(new THREE.Vector3(1,0,0), 0.5 * Math.PI);

        var posMatrix = new THREE.Matrix4();
        posMatrix.makeTranslation(0, depth*0.5, 0);

        mesh.applyMatrix(sclMatrix);
        mesh.applyMatrix(posMatrix);
        mesh.applyMatrix(rotMatrix);

        var transAniMatrix = new THREE.Matrix4().makeTranslation(transX, transY, transZ);
        mesh.applyMatrix(transAniMatrix);

        mesh.updateMatrix();

        var bottomMaterial = new THREE.ShaderMaterial({
            uniforms: {
                texture      : {type: 't', value: texture},
                shadowColor  : {type: 'c', value: new THREE.Color(params.color) }
            },
            vertexShader  : loadFileToString("./shaders/CardShader.vert"),
            fragmentShader: loadFileToString("./shaders/CardShader.frag"),
            side:THREE.DoubleSide,
            transparent : true
        });

        meshBottom = new THREE.Mesh(geometry, bottomMaterial);
        meshBottom.matrix = new THREE.Matrix4();

        meshBottom.applyMatrix(sclMatrix);
        meshBottom.applyMatrix(posMatrix);
        meshBottom.applyMatrix(rotMatrix);
        meshBottom.applyMatrix(transAniMatrix);

        meshBottom.updateMatrix();
    }


    this.update = function(vel, dt) {

        rotate += vel * dt;
        if(rotate > rotateEnd) rotate = rotateEnd;

        mesh.matrix = new THREE.Matrix4();

        var sclMatrix = new THREE.Matrix4();
        sclMatrix.makeScale(scaleX, scaleY, scaleZ);

        var rotMatrix = new THREE.Matrix4();
        rotMatrix.makeRotationAxis(new THREE.Vector3(1,0,0), 0.5 * Math.PI);

        var posMatrix = new THREE.Matrix4();
        posMatrix.makeTranslation(0, depth*0.5, 0);

        mesh.applyMatrix(sclMatrix);
        mesh.applyMatrix(posMatrix);
        mesh.applyMatrix(rotMatrix);

        var rotAniMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(-1,0,0), rotate);
        mesh.applyMatrix(rotAniMatrix);

        var transAniMatrix = new THREE.Matrix4().makeTranslation(transX, transY, transZ);
        mesh.applyMatrix(transAniMatrix);

        mesh.updateMatrix();
    }

    this.getMesh = function() {
        return mesh;
    }

    this.getMeshBottom = function() {
        return meshBottom;
    }

    this.getRotation = function() {
        return rotate;
    }
}
