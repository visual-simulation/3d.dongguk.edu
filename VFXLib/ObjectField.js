document.write("<script type='text/javascript' src='./Obstacle.js'><"+"/script>");

function ObjectField() {

    var _this = this;

    var obstacleArray;

    var fieldArray;
    var externalFieldArray;

    var objectArray;
    var idCount = 0;

    this.initialize = function(grid) {

        obstacleArray = new Array();

        var num = grid.getCellNum();
        var fieldArray = new Array(num);

        for(var n=0; n<num; n++) {
            fieldArray[n] = new Array();
        }

        externalFieldArray = new Array();
        objectArray = new Array();
    }

    this.initialize = function() {

        obstacleArray = new Array();

    }

    this.addObstacle = function(obs) {
        obstacleArray.push(obs);
    }

    this.collide = function(pos, vel) {
        for(var i=0; i<obstacleArray.length; i++) {
            obstacleArray[i].collide(pos, vel);
        }
    }

    this.addMesh = function(mesh) {

        mesh.ofId = idCount.toString();
        objectArray[mesh.ofId] = mesh;

        idCount++;

        /*
        mesh.geometry.computeBoundingBox();

        var min = new THREE.Vector3();
        var max = new THREE.Vector3();

        min.addVectors(mesh.geometry.boundingBox.min, mesh.position);
        max.addVectors(mesh.geometry.boundingBox.max, mesh.position);
        */

    }

    this.removeMesh = function(mesh) {

        delete objectArray[mesh.ofId];
    }
/*
    this.collide = function(pos, vel, dt) {

        for(var n=0; n<objectArray.length; n++) {

            var mesh = objectArray[n];
            var deviation = new THREE.Vector3();
            deviation.subVectors(pos, mesh.position);

            var phi = deviation.length() - mesh.geometry.boundingSphere.radius

            if(mesh.geometry.boundingSphere.radius >= deviation.length()) {
                return {isInside:true, phi:phi, normal:deviation.normalize()};
            }
        }

        return {isInside:true, distance:0, normal:new THREE.Vector3()};
    }
*/
}
