var textureFlare0 = THREE.ImageUtils.loadTexture( "./textures/lensflare0.png" );
var textureFlare1 = THREE.ImageUtils.loadTexture( "./textures/lensflare1.png" );
var textureFlare2 = THREE.ImageUtils.loadTexture( "./textures/lensflare2.png" );
var textureFlare3 = THREE.ImageUtils.loadTexture( "./textures/lensflare3.png" );

function PostProcessor() {

    var _this = this;

    //snow
    var snowCanvas;
    var snowCtx;
    var snowPositions;
    var snowLives;
    var snowSizes;
    var snowSeedLife;
    var snowSeedSize;
    var snowTotal;
    var snowTail;
    var snowCount;

    //rain
    var rainCanvas;
    var rainContext;
    var rainTotal;
    var rainCount;
    var rainTail;
    var rainPositions;
    var rainLives;
    var rainSizes;
    var rainSeedSize;
    var rainDrops;
    var rainOptions;
    var rainsClone;
    var PRIVATE_GRAVITY_FORCE_FACTOR_Y;
    var PRIVATE_GRAVITY_FORCE_FACTOR_X;
    var a;


    this.rain = function( _total ) {

        rainCanvas = document.createElement('canvas');
        rainCanvas.width = window.innerWidth;
        rainCanvas.height = window.innerHeight;

        rainContext = rainCanvas.getContext('2d');

        rainOptions = {
            opacity: 1,
            fps: 60,
            gravityThreshold: 3,
            gravityAngle: Math.PI / 2,
            gravityAngleVariance: 0
        };


        PRIVATE_GRAVITY_FORCE_FACTOR_Y = (rainOptions.fps * 0.001) / 25;
        PRIVATE_GRAVITY_FORCE_FACTOR_X = ((Math.PI / 2) - rainOptions.gravityAngle) * (rainOptions.fps * 0.001) / 50;

        rainSeedSize = 4;

        rainTotal = _total;
        rainCount = 0;
        rainTail = -1;

        rainPositions = new Float32Array(rainTotal*2);
        rainLives = new Float32Array(rainTotal * 1);
        rainSizes = new Float32Array(rainTotal * 1);

        return rainCanvas;
    }

    this.addRain = function( i, x, y ) {

        if(i >= rainTotal) {
            return;
        }

        var idx = i*2;

        rainLives[i] = 1;
        rainSizes[i] = Math.random()*rainSeedSize;

        rainPositions[idx+0] = x;
        rainPositions[idx+1] = y;

        rainCount += 1;
        rainTail = Math.max(i, snowTail);

    }

    this.drawRain = function() {

        rainContext.clearRect(0, 0, rainCanvas.width, rainCanvas.height);

        rainContext.fillStyle = '#FFFAFA';
        rainContext.globalAlpha = 1.0;

        for(var i = 0; i < snowTotal; i++){

            var idx = i*2;

            rainContext.beginPath();
            rainContext.moveTo(rainPositions[idx + 0], rainPositions[idx + 1]);
            rainContext.arc(rainPositions[idx + 0], rainPositions[idx + 1], rainSizes[i], 0, Math.PI * 2, true);
            rainContext.closePath();
            rainContext.fill();

        }

    }

    this.updateRain = function() {
        _this.addRain();
        rainsClone = rainDrops.slice();
        var newRains = [];
        for (var i = 0; i < rainsClone.length; ++i) {
            if( rainsClone[i].animate()) {
                newRains.push(rainsClone[i]);
            }
        }
        rainDrops = newRains;
    }

    this.putRain = function(drop) {
        drop.draw();
        if(drop.r > rainOptions.gravityThreshold) {
            rainDrops.push(drop);
        }
    }

    this.clearDrop = function(drop, force){
        var result = drop.clear(force);
        if (result) {
            var index = rainDrops.indexOf(drop);
            if (index >= 0) {
                this.drops.splice(index, 1);
            }
        }
        return result;
    }

    this.rainGravity = function(drop){
        if (_this.clearDrop(drop)) {
            return true;
        }

        if (drop.yspeed) {
            drop.yspeed += this.PRIVATE_GRAVITY_FORCE_FACTOR_Y * Math.floor(drop.r);
            drop.xspeed += this.PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(drop.r);
        } else {
            drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
            drop.xspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_X;
        }

        drop.y += drop.yspeed;
        drop.draw();
        return false;
    }


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

    this.snow = function( _total ) {

        snowCanvas = document.createElement('canvas');
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;

        snowCtx = snowCanvas.getContext('2d');

        snowSeedLife = 3;
        snowSeedSize = 4;

        snowTotal = _total;
        snowCount = 0;
        snowTail = -1;

        snowPositions = new Float32Array(snowTotal*2);
        snowLives = new Float32Array(snowTotal * 1);
        snowSizes = new Float32Array(snowTotal * 1);

        for(var i = 0; i < snowTotal; i++){
            _this.addSnows(i, Math.random() * snowCanvas.width, Math.random() * snowCanvas.height);
        }

        return snowCanvas;

    }

    this.updateSnow = function(dt) {

        for(var i=0; i < snowTotal; i++) {
            if(snowSizes[i] > 0.05 && snowLives[i] > 0.0) {
                snowLives[i] -= dt;
                snowSizes[i] -= 0.002;
                if(snowSizes[i] < 0.1) {
                    _this.addSnows(i, Math.random() * snowCanvas.width, Math.random() * snowCanvas.height);
                }
            }else{
                _this.addSnows(i, Math.random() * snowCanvas.width, Math.random() * snowCanvas.height);
            }
        }

        _this.drawSnow();
    }

    this.addSnows = function( i, x, y ) {
        if(i >= snowTotal) {
            return;
        }

        var idx = i*2;

        snowLives[i] = Math.random()*snowSeedLife;
        snowSizes[i] = Math.random()*snowSeedSize;

        snowPositions[idx+0] = x;
        snowPositions[idx+1] = y;

        snowCount += 1;
        snowTail = Math.max(i, snowTail);
    }

    this.drawSnow = function() {

        snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

        snowCtx.fillStyle = '#FFFAFA';
        snowCtx.globalAlpha = 1.0;

        for(var i = 0; i < snowTotal; i++){

            var idx = i*2;

            snowCtx.beginPath();
            snowCtx.moveTo(snowPositions[idx + 0], snowPositions[idx + 1]);
            snowCtx.arc(snowPositions[idx + 0], snowPositions[idx + 1], snowSizes[i], 0, Math.PI * 2, true);
            snowCtx.closePath();
            snowCtx.fill();

        }

    }

}

/**
 * Defines a new raindrop object.
 * @param rainyday reference to the parent object
 * @param centerX x position of the center of this drop
 * @param centerY y position of the center of this drop
 * @param min minimum size of a drop
 * @param base base value for randomizing drop size
 */

function Drop(rainy, centerX, centerY, min, base) {
    this.x = Math.floor(centerX);
    this.y = Math.floor(centerY);
    this.r = (Math.random() * base) + min;
    this.rainy = rainy;
    this.canvas = rainy.getRainCanvas();
    this.context = rainy.getRainContext();
}

/**
 * Draws a raindrop on canvas at the current position.
 */
Drop.prototype.draw = function() {
    this.context.save();
    this.context.beginPath();

    var orgR = this.r;
    this.r = 0.95 * this.r;
    if (this.r < 3) {
        this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        this.context.closePath();
    } else {
        this.context.arc(this.x, this.y, this.r * 0.9, 0, Math.PI * 2, true);
        this.context.closePath();
    }

    this.context.clip();

    this.r = orgR;

    this.context.fillStyle = '#8ED6FF';
    this.context.fill();

    this.context.restore();
};

/**
 * Clears the raindrop region.
 * @param force force stop
 * @returns Boolean true if the animation is stopped
 */
Drop.prototype.clear = function(force) {
    this.context.clearRect(this.x - this.r - 1, this.y - this.r - 2, 2 * this.r + 2, 2 * this.r + 2);
    if (force) {
        this.terminate = true;
        return true;
    }
    if ((this.y - this.r > this.canvas.height) || (this.x - this.r > this.canvas.width) || (this.x + this.r < 0)) {
        // over edge so stop this drop
        return true;
    }
    return false;
};

/**
 * Moves the raindrop to a new position according to the gravity.
 */
Drop.prototype.animate = function() {
    if (this.terminate) {
        return false;
    }
    var stopped = this.rainy.rainGravity(this);

    return !stopped || this.terminate;
};