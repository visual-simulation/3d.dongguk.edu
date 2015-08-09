
function SphereObject() {

    var center;
    var radian;

    this.collide = function(pos, vel) {

        var deviation = new THREE.Vector3();
        deviation.subVectors(center, pos);

        var length = deviation.length();
        var dir = deviation.clone();
        dir.normalize();

        if(length <= radian) {

            pos.addVectors(center, dir.clone().multiplyScalar(radian));

        }
    }
}
