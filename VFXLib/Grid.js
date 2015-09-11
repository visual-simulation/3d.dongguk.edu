
function Grid() {

    var _this = this;

    var min, max;
    var iRes, jRes, kRes;

    var numCells;

    var dx, dy, dz;

    var mesh;

    this.initialize = function(iRes_, jRes_, kRes_, min_, max_) {

        dx = (max_.x - min_.x)/iRes_;
        dy = (max_.y - min_.y)/jRes_;
        dz = (max_.z - min_.z)/kRes_;

        iRes = iRes_; jRes = jRes_; kRes = kRes_;

        numCells = iRes * jRes * kRes;

        min = min_.clone();
        max = min_.clone();

        max.addVectors(min, new THREE.Vector3(dx*iRes, dy*jRes, dz*kRes));

        //
        var geometry = new THREE.Geometry();

        for(var i=0; i<=iRes; i++) {
            for(var j=0; j<=jRes; j++) {
                geometry.vertices.push(
                    new THREE.Vector3(min.x+dx*i, min.y+dy*j, min.z),
                    new THREE.Vector3(min.x+dx*i, min.y+dy*j, max.z)
                );
            }
        }

        for(var i=0; i<=iRes; i++) {
            for(var k=0; k<=kRes; k++) {
                geometry.vertices.push(
                    new THREE.Vector3(min.x+dx*i, min.y, min.z+dz*k),
                    new THREE.Vector3(min.x+dx*i, max.y, min.z+dz*k)
                );
            }
        }

        for(var j=0; j<=jRes; j++) {
            for(var k=0; k<=kRes; k++) {
                geometry.vertices.push(
                    new THREE.Vector3(min.x, min.y+dy*j, min.z+dz*k),
                    new THREE.Vector3(max.x, min.y+dy*j, min.z+dz*k)
                );
            }
        }

        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        mesh = new THREE.Line(geometry, material, THREE.LinePieces);

    }

    this.getCellCener = function(i, j, k) {

        return new THREE.Vector3(min.x+(i+0.5)*dx, min.y+(j+0.5)*dy, min.z+(k+0.5)*dz);

    }

    this.getCellIndex = function(pos) {

        var i = parseInt((pos.x-min.x)/dx);
        var j = parseInt((pos.y-min.y)/dy);
        var k = parseInt((pos.z-min.z)/dz);

        return {i:i, j:j, k:k};
    }

    this.getCellNum = function() {

        return numCells;

    }

    this.getMesh = function() {
        return mesh;
    }

}