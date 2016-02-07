var textureFlare0 = THREE.ImageUtils.loadTexture( "./textures/lensflare0.png" );
var textureFlare1 = THREE.ImageUtils.loadTexture( "./textures/lensflare1.png" );
var textureFlare2 = THREE.ImageUtils.loadTexture( "./textures/lensflare2.png" );
var textureFlare3 = THREE.ImageUtils.loadTexture( "./textures/lensflare3.png" );

function PostProcessor(){

    var _this = this;


    this.addLensFlare = function( h, s, l, x, y, z) {

        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5);

        var lensFlare = new THREE.LensFlare( textureFlare0, 2000, 0.0, THREE.AdditiveBlending, flareColor);

        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

        lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
        lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

        lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        lensFlare.position.copy( light.position );

        lensFlareUpdateCallback = function( object ) {
            var f, fl = object.lensFlares.length;
            var flare;
            var vecX = -object.positionScreen.x * 2;
            var vecY = -object.positionScreen.y * 2;


            for( f = 0; f < fl; f++ ) {

                flare = object.lensFlares[ f ];

                flare.x = object.positionScreen.x + vecX * flare.distance;
                flare.y = object.positionScreen.y + vecY * flare.distance;

                flare.rotation = 0;

            }

            object.lensFlares[ 2 ].y += 0.025;
            object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
        }
    }



    this.earthquake = function(camera, sx, sy, sz) {

        var force_x;
        var force_y;
        var force_z;


        if(sx) {
            force_x = sx;
        }
        else {
            force_x = 10;
        }

        if(sy) {
            force_y = sy;
        }
        else {
            force_y = 10;
        }

        if(sz) {
            force_z = sz;
        }
        else {
            force_z = 0;
        }

        var cx = (0.5  - Math.random()) * force_x;
        var cy = (0.5  - Math.random()) * force_y;
        var cz = (0.5  - Math.random()) * force_z;

        var change_camera = camera;
        change_camera.position.set(change_camera.position.x + cx, change_camera.position.y + cy, change_camera.position.z + cz);

        return change_camera;
    }

}
