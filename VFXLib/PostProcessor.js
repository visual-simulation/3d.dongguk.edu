var textureFlare0 = THREE.ImageUtils.loadTexture( "./textures/lensflare0.png" );
var textureFlare1 = THREE.ImageUtils.loadTexture( "./textures/lensflare1.png" );
var textureFlare2 = THREE.ImageUtils.loadTexture( "./textures/lensflare2.png" );
var textureFlare3 = THREE.ImageUtils.loadTexture( "./textures/lensflare3.png" );

function PostProcessor() {

    var _this = this;
    var canvas = document.createElement('canvas');

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
    var rainColors;
    var rainAlpha;
    var rainWidths;
    var rainHeights;
    var rainSeedSize;
    var rainSeedLife;
    var rainSpeeds;
    var rainStops;
    var rainOptions;
    var PRIVATE_GRAVITY_FORCE_FACTOR_X;
    var reflectionScaledownFactor = 5;
    var reflectionDropMappingWidth = 200;
    var reflectionDropMappingHeight = 200;
    var reflected;
    var width;
    var height;
    var img;
    var crop;

    var ox;
    var oy;
    var xe;
    var ye;
    var xm;
    var ym;

    //earthquake
    var pre_x = 0;
    var pre_y = 0;
    var pre_z = 0;

    //steps
    var currentStep = 0;
    var stepOffset = 3;

    this.rain = function( _total ) {

        rainCanvas = canvas;
//        rainCanvas.width = window.innerWidth;
//        rainCanvas.height = window.innerHeight;


        rainCanvas.width = 128;
        rainCanvas.height = 128;

        rainContext = rainCanvas.getContext('2d');

        rainOptions = {
            opacity: 0.1,
            fps: 60,
            gravityThreshold: 1,
            gravityAngle: Math.PI / 2,
            gravityAngleVariance: 0
        };

        PRIVATE_GRAVITY_FORCE_FACTOR_X = ((Math.PI / 2) - rainOptions.gravityAngle) * (rainOptions.fps * 0.001) / 50;

        rainSeedSize = 3;
        rainSeedLife = 3;

        rainTotal = _total;
        rainCount = 0;
        rainTail = -1;

        rainPositions = new Float32Array(rainTotal*2);
        rainLives = new Float32Array(rainTotal * 1);
        rainSizes = new Float32Array(rainTotal * 1);
        rainColors = new Array(rainTotal * 1);
        rainAlpha = new Float32Array(rainTotal * 1);
        rainWidths = new Float32Array(rainTotal * 1);
        rainHeights = new Float32Array(rainTotal * 1);
        rainSpeeds = new Float32Array(rainTotal * 1);
        rainStops = new Float32Array(rainTotal * 1);

        return rainCanvas;
    }

    this.addRain = function( i, x, y ) {

        var colors = [
            "rgba(0, 0, 255)," + (Math.random() +.5) + ")",
            "rgba(52, 152, 200,"+ (Math.random() + .5) +")",
            "rgba(41, 128, 250,"+ (Math.random() + .5) +")"];

        if(i >= rainTotal) {
            return;
        }

        var idx = i*2;

        rainLives[i] = Math.random()*rainSeedLife;
        rainSizes[i] = Math.random()*rainSeedSize;
        rainColors[i] = colors[Math.floor(Math.random()*3)];
        rainAlpha[i] = Math.random()*0.3;
        rainWidths[i] = Math.random()*3 + rainSeedSize;
        rainHeights[i] = Math.random()*5 + rainSeedSize;
        rainSpeeds[i] = 0.02 * Math.floor(rainSizes[i]*Math.random()*100);
        rainStops[i] = Math.random()*rainTotal/100;

        rainPositions[idx+0] = x;
        rainPositions[idx+1] = y;

        rainCount += 1;
        rainTail = Math.max(i, snowTail);

    }

    this.drawRain = function(number) {

        rainContext.clearRect(0, 0, rainCanvas.width, rainCanvas.height);


        for(var i = 0; i < number; i++){

            var idx = i*2;

            rainContext.fillStyle = rainColors[i];

            //rainContext.globalAlpha = 0.3;

            if(rainSizes[i] < rainOptions.gravityThreshold){
                rainContext.shadowBlur = 0;
                rainContext.globalAlpha = 0.5;
                rainContext.beginPath();
                rainContext.moveTo(rainPositions[idx + 0], rainPositions[idx + 1]);
                rainContext.arc(rainPositions[idx + 0], rainPositions[idx + 1], rainSizes[i], 0, Math.PI * 2, true);
                rainContext.closePath();
                rainContext.fill();
            }else {

                var x = rainPositions[idx+0];
                var y = rainPositions[idx+1];
                var w = rainWidths[i];
                var h = rainHeights[i];

                _this.bubbleCalculate(x,y,w,h);

                rainContext.shadowBlur = 1;
                rainContext.shadowColor="black";
                rainContext.strokeStyle = rainColors[i];
                rainContext.globalAlpha = 1;
                rainContext.lineWidth = 0.1;

                rainContext.beginPath();
                rainContext.moveTo(x, ym);
                rainContext.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                rainContext.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                rainContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                rainContext.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                rainContext.closePath();
                rainContext.stroke();

                rainContext.beginPath();
                rainContext.moveTo(x, ym);
                rainContext.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                rainContext.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                rainContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                rainContext.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                rainContext.closePath();
                rainContext.stroke();

                x += 1;
                y += 0.2;

                _this.bubbleCalculate(x,y,w-4,w-4);
                rainContext.shadowBlur=0;
                rainContext.fillStyle = '#FFFAFA';
                rainContext.globalAlpha = 0.4;
                //rainContext.lineWidth = 0.1;
                rainContext.beginPath();
                rainContext.moveTo(x, ym);
                rainContext.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                rainContext.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                rainContext.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                rainContext.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                rainContext.closePath();
                rainContext.fill();

            }

        }

    }

    this.bubbleCalculate = function(x, y, w, h) {
        var kappa = 0.5522848;
        kappa = 0.65;

        ox = (w / 2) * kappa;
        oy = (h / 2) * kappa;
        xe = x + w;
        ye = y + h;
        xm = x + w / 2;
        ym = y + h / 2;
    }

    this.updateRain = function(number) {

        if(number > rainTotal)
        {
            number = rainTotal;
        }
        for(var i=0; i < number; i++) {

            var idx = i*2;

            if(rainLives[i] > 0){

                if(rainStops[i] > 0){
                    rainStops[i] -= 0.1;
                }
                else {
                    if(rainSizes[i] > rainOptions.gravityThreshold){

                        rainPositions[idx+1] += rainSpeeds[i];
                        rainSpeeds[i] -= 0.05;
                        if(rainSpeeds[i] < 0) {
                            rainSpeeds[i] = 0.02 * Math.floor(rainSizes[i]*Math.random()*100);
                        }
                        rainPositions[idx] += PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(rainSizes[i]);
                    }
                    else{
                        rainLives[i] -= 0.1;
                    }
                    if(rainPositions[idx+1] > parseFloat(rainCanvas.height)){
                        rainLives[i] = -1;
                        rainStops[i] = Math.random()*rainTotal/100;
                    }
                }

            }
            else{
                _this.addRain(i, Math.random() * rainCanvas.width, Math.random() * rainCanvas.height);
            }
        }

        _this.drawRain(number);

    }

    this.rainImage = function( _total, _img ) {

        img = _img;
        crop = [0, 0, img.naturalWidth, img.naturalHeight];

        rainCanvas = canvas;
//        rainCanvas.width = window.innerWidth;
//        rainCanvas.height = window.innerHeight;

        rainCanvas.width = 100;
        rainCanvas.height = 100;

        width = img.clientWidth;
        height = img.clientHeight;

        reflected = document.createElement('canvas');
        reflected.width = rainCanvas.width / reflectionScaledownFactor;
        reflected.height = rainCanvas.height / reflectionScaledownFactor;
        var ctx = reflected.getContext('2d');
        ctx.drawImage(img, crop[0], crop[1], crop[2], crop[3], 0, 0, reflected.width, reflected.height);

        rainContext = rainCanvas.getContext('2d');

        rainOptions = {
            opacity: 0.1,
            fps: 60,
            gravityThreshold: 3,
            gravityAngle: Math.PI / 2,
            gravityAngleVariance: 0
        };


        PRIVATE_GRAVITY_FORCE_FACTOR_X = ((Math.PI / 2) - rainOptions.gravityAngle) * (rainOptions.fps * 0.001) / 50;

        rainSeedSize = 5;
        rainSeedLife = 3;

        rainTotal = _total;
        rainCount = 0;
        rainTail = -1;

        rainPositions = new Float32Array(rainTotal*2);
        rainLives = new Float32Array(rainTotal * 1);
        rainSizes = new Float32Array(rainTotal * 1);
        rainColors = new Array(rainTotal * 1);
        rainAlpha = new Float32Array(rainTotal * 1);
        rainWidths = new Float32Array(rainTotal * 1);
        rainHeights = new Float32Array(rainTotal * 1);
        rainSpeeds = new Float32Array(rainTotal * 1);
        rainStops = new Float32Array(rainTotal * 1);

        return rainCanvas;
    }

    this.drawRainImage = function(number) {

        rainContext.clearRect(0, 0, rainCanvas.width, rainCanvas.height);


        for(var i = 0; i < number; i++){

            var idx = i*2;

            rainContext.save();
            rainContext.beginPath();

            var orgR = rainSizes[i];
            rainSizes[i] = 0.95 * rainSizes[i];
            if(rainSizes[i] < 3) {
                rainContext.arc(rainPositions[idx + 0], rainPositions[idx + 1], rainSizes[i], 0, Math.PI * 2, true);
                rainContext.closePath();
            }
            else if(rainSpeeds[i] > 2){
                var yr = 1 + 0.1 * rainSpeeds[i];
                rainContext.moveTo(rainPositions[idx + 0] - rainSizes[i] / yr, rainPositions[idx + 1]);
                rainContext.bezierCurveTo(rainPositions[idx + 0] - rainSizes[i], rainPositions[idx + 1] - rainSizes[i] * 2, rainPositions[idx + 0] + rainSizes[i], rainPositions[idx+1] - rainSizes[i] * 2, rainPositions[idx + 0] + rainSizes[i] / yr, rainPositions[idx + 1]);
                rainContext.bezierCurveTo(rainPositions[idx + 0] + rainSizes[i], rainPositions[idx + 1] + yr * rainSizes[i], rainPositions[idx + 0] - rainSizes[i], rainPositions[idx+1] + yr * rainSizes[i], rainPositions[idx + 0] - rainSizes[i] / yr, rainPositions[idx + 1]);
            }
            else{
                rainContext.arc(rainPositions[idx+0], rainPositions[idx+1], rainSizes[i] * 0.9, 0, Math.PI * 2, true);
                rainContext.closePath();
            }

            rainContext.clip();

            rainSizes[i] = orgR;

            //reflection
            var sx = Math.max((rainPositions[idx+0] - reflectionDropMappingWidth) / reflectionScaledownFactor, 0);
            var sy = Math.max((rainPositions[idx+1] - reflectionDropMappingHeight) / reflectionScaledownFactor, 0);
            var sw = _this.positiveMin(reflectionDropMappingWidth * 2 / reflectionScaledownFactor, reflected.width - sx);
            var sh = _this.positiveMin(reflectionDropMappingHeight * 2 / reflectionScaledownFactor, reflected.height - sy);
            var dx = Math.max(rainPositions[idx+0] - 1.1 * rainSizes[i], 0);
            var dy = Math.max(rainPositions[idx+1] - 1.1 * rainSizes[i], 0);
            rainContext.drawImage(reflected, sx, sy, sw, sh, dx, dy, rainSizes[i] * 2, rainSizes[i] * 2);


            rainContext.restore();

        }

    }

    this.updateRainImage = function(number) {

        if(number > rainTotal)
        {
            number = rainTotal;
        }
        for(var i=0; i < number; i++) {

            var idx = i*2;

            if(rainLives[i] > 0){

                if(rainStops[i] > 0){
                    rainStops[i] -= 0.1;
                }
                else {
                    if(rainSizes[i] > rainOptions.gravityThreshold){

                        rainPositions[idx+1] += rainSpeeds[i];
                        rainSpeeds[i] -= 0.05;
                        if(rainSpeeds[i] < 0) {
                            rainSpeeds[i] = 0.02 * Math.floor(rainSizes[i]*Math.random()*100);
                        }
                        rainPositions[idx] += PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(rainSizes[i]);
                    }
                    else{
                        rainLives[i] -= 0.1;
                    }
                    if(rainPositions[idx+1] > parseFloat(rainCanvas.height)){
                        rainLives[i] = -1;
                        rainStops[i] = Math.random()*rainTotal/100;
                    }
                }

            }
            else{
                _this.addRain(i, Math.random() * rainCanvas.width, Math.random() * rainCanvas.height);
            }
        }

        _this.drawRainImage(number);

    }

    this.positiveMin = function(val1, val2) {
        var result = 0;
        if(val1 < val2) {
            if(val1 <= 0) {
                result = val2;
            }
            else {
                result = val1;
            }
        }
        else {
            if(val2 <= 0) {
                result = val1;
            }
            else {
                result = val2;
            }
        }
        return result <= 0 ? 1 : result;
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



    this.earthquake = function( _camera, force_x, force_y, force_z) {

        var cx = (0.5  - Math.random()) * force_x;
        var cy = (0.5  - Math.random()) * force_y;
        var cz = (0.5  - Math.random()) * force_z;

        var change_camera = _camera;

        change_camera.position.set(change_camera.position.x - pre_x + cx, change_camera.position.y - pre_y + cy, change_camera.position.z - pre_z + cz);

        pre_x = cx;
        pre_y = cy;
        pre_z = cz;

        return change_camera;
    };

    this.changeState = function( state ){

        if(state) {
            pre_x = 0;
            pre_y = 0;
            pre_z = 0;
            return false;
        }
        else {
            return true;
        }


    }

    this.snow = function( _total ) {

        snowCanvas = canvas;
//      snowCanvas.width = window.innerWidth;
//      snowCanvas.height = window.innerHeight;

        snowCanvas.width = 128;
        snowCanvas.height = 128;

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

    this.updateSnow = function(dt, number) {

        if(number > snowTotal){
            number = snowTotal;
        }

        for(var i=0; i < number; i++) {
            if(snowSizes[i] > 0.05 && snowLives[i] > 0.0) {
                snowLives[i] -= dt;
                snowSizes[i] -= (Math.random() * 0.05);
                if(snowSizes[i] < 0.1) {
                    _this.addSnows(i, Math.random() * snowCanvas.width, Math.random() * snowCanvas.height);
                }
            }else{
                _this.addSnows(i, Math.random() * snowCanvas.width, Math.random() * snowCanvas.height);
            }
        }

        currentStep++;

        if(currentStep == stepOffset) {
            _this.drawSnow(number);
        }

        if(currentStep > stepOffset) {
            currentStep = 0;
        }
    }

    this.addSnows = function( i, x, y ) {
        if(i >= snowTotal) {
            return;
        }

        var idx = i*2;

        snowLives[i] = Math.random()*snowSeedLife;
        snowSizes[i] = Math.random()*snowSeedSize+3;

        snowPositions[idx+0] = x;
        snowPositions[idx+1] = y;

        snowCount += 1;
        snowTail = Math.max(i, snowTail);
    }

    this.drawSnow = function(number) {

        snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

        snowCtx.fillStyle = '#FFFAFA';
        snowCtx.globalAlpha = 0.5;
        snowCtx.shadowBlur = 0.1;
        snowCtx.shadowColor="white";

        for(var i = 0; i < number/2; i++){

            var idx = i*2;

            snowCtx.beginPath();
            snowCtx.moveTo(snowPositions[idx + 0], snowPositions[idx + 1]);
            snowCtx.arc(snowPositions[idx + 0], snowPositions[idx + 1], snowSizes[i], 0, Math.PI * 2, true);
            snowCtx.closePath();
            snowCtx.fill();

        }

    }

}