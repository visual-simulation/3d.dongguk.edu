/**
 * Created by SeungHo on 2015-09-14.
 */

Examples = {
    fire :
    {
        seedVelDir: new THREE.Vector3(0, 1, 0),
        seedVelMag: 800.0,
        globalForce: new THREE.Vector3(0, 10, 0),
        globalForceX: 0,
        globalForceY: 10,
        globalForceZ: 0,
        windStrength: 2,
        seedSize: 200,
        seedLife: 0.5,
        texFile : "./textures/flame.png",
        particleColor: new THREE.Color(1,0.8,0.8),
        alpha : 5.0
    },

    snowStorm :
    {
        seedVelDir: new THREE.Vector3(0.0,-1,0),
        seedVelMag: 500.0,
        globalForce: new THREE.Vector3(0, -0.1, 0),
        globalForceX: 0,
        globalForceY: -0.1,
        globalForceZ: 0,
        windStrength: 50,
        seedSize: 30,
        seedLife: 2.0,
        texFile : "./textures/snowflake.png",
        particleColor: new THREE.Color(0Xfffafa),
        alpha : 1.0
    },

    rain :
    {
        seedVelDir: new THREE.Vector3(0.3,-1,0),
        seedVelMag: 500.0,
        globalForce: new THREE.Vector3(0, -0.1, 0),
        windStrength: 50,
        seedSize: 30,
        seedLife: 2.0,
        texFile : "./textures/snowflake.png",
        particleColor: new THREE.Color(0Xfffafa),
        alpha : 1.0
    }


}