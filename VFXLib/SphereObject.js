
function SphereObject() {

    var center;
    var radian;

    this.initialize = function(cen, rad) {

        center = cen;
        radian = rad;
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

                vel.addVectors(norVel.multiplyScalar(0.0), tanVel.multiplyScalar(1.0));
            }

            return true;
        }

        return false;
    }
}
