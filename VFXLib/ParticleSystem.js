
function ParticleSystem() {

    var this_ = this;

    this.geometry = new THREE.Geometry();

    this.positions = new Float32Array(10000*3);
    this.velocities = new Float32Array(10000*3);

    this.backCount = -1;
    this.particleCount = 0;

    this.gravity;

    this.initialize = function() {

        this_.geometry.dynamic = true;
        this_.geometry.verticesNeedUpdate = true;

    }

    this.addParticle = function(pos, vel) {

        this_.backCount += 1;
        var idx = this_.backCount * 3;

        this_.positions[idx+0] = pos.x;
        this_.positions[idx+1] = pos.y;
        this_.positions[idx+2] = pos.z;

        this_.velocities[idx+0] = vel.x;
        this_.velocities[idx+1] = vel.y;
        this_.velocities[idx+2] = vel.z;

        this_.particleCount += 1;

    };

    this.updateParticles = function(dt) {

        for(var i=0; i<this_.particleCount; i++) {

            var idx = i*3;

            this_.positions[idx+0] += this_.velocities[idx+0]*dt;
            this_.positions[idx+1] += this_.velocities[idx+1]*dt;
            this_.positions[idx+2] += this_.velocities[idx+2]*dt;

        }
    }
}