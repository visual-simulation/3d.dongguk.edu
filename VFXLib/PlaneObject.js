
function PlaneObject() {

    var normal;
    var position;

    this.initialize = function(pos, nor) {

        position = pos;
        normal = nor;

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

                vel.addVectors(norVel.multiplyScalar(0.2), tanVel.multiplyScalar(1.0));
            }

            return true;
        }

        return false;
    }

}