
function PlaneObject() {

    var normal;
    var position;

    var norCoeff = 0.0;
    var tanCoeff = 0.0;

    this.initialize = function(pos, nor) {
        position = pos;
        normal = nor;
    }

    this.setParameters = function(nor, tan) {
        norCoeff = nor;
        tanCoeff = tan;
    }

    this.collide = function(pos, vel) {

        var deviation = new THREE.Vector3();
        deviation.subVectors(pos, position);

        var length = normal.dot(deviation);

        if(length < 0) {
            // update position

            pos.addVectors(pos, normal.clone().multiplyScalar(-length));

            var norVelMag = normal.clone().dot(vel);

            if(norVelMag < 0.0) {
                // update velocity

                var norVel = normal.clone().multiplyScalar(norVelMag);
                var tanVel = vel.clone().sub(norVel);

                norVel.multiplyScalar(-1);

                vel.addVectors(norVel.multiplyScalar(norCoeff), tanVel.multiplyScalar(tanCoeff));
            }

            return true;
        }
        return false;
    }

}

function SphereObject() {

    var center;
    var radian;

    var norCoeff = 0.0;
    var tanCoeff = 0.0;

    this.initialize = function(cen, rad) {

        center = cen;
        radian = rad;
    }

    this.setParameters = function(nor, tan) {
        norCoeff = nor;
        tanCoeff = tan;
    }

    this.collide = function(pos, vel) {

        var deviation = new THREE.Vector3();
        deviation.subVectors(pos, center);

        var length = deviation.length();

        if(length <= radian) {
            // update position

            var nor = deviation.clone().normalize();
            var norVelMag = nor.clone().dot(vel);

            pos.addVectors(center, nor.clone().multiplyScalar(radian));

            if(norVelMag < 0.0) {
                // update velocity

                var norVel = nor.clone().multiplyScalar(norVelMag);
                var tanVel = vel.clone().sub(norVel);

                norVel.multiplyScalar(-1);

                vel.addVectors(norVel.multiplyScalar(norCoeff), tanVel.multiplyScalar(tanCoeff));
            }

            return true;
        }

        return false;
    }
}
