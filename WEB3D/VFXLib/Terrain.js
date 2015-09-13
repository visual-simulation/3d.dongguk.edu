//define( ["three", "geometry",
//"shader!terrain.vert", "shader!terrain.frag", "shader!terrainSnow.frag", "shader!terrainToon.frag", "texture"],

function Terrain() {

    function loadFileToString(path) {

        var client = new XMLHttpRequest();

        client.open('GET', path, false);
        client.send();

        if(client.status == 200) {
            return client.responseText;
        }
        else {
            return null;
        }
    }

    // Tiles that sit next to a tile of a greater scale need to have their edges morphed to avoid
    // edges. Mark which edges need morphing using flags. These flags are then read by the vertex
    // shader which performs the actual morph
    var Edge = {
        NONE: 0,
        TOP: 1,
        LEFT: 2,
        BOTTOM: 4,
        RIGHT: 8
    };

    var this_ = this;
    var terrainVert, terrainFrag, terrainSnowFrag, terrainToonFrag;
    var texturePath = "textures/";
    var textures;
    var offset;

    var fragShaders;
    var fragShader;

    var resolution, heightData, worldWidth, levels;

    var tileGeometry;

    var mesh = new THREE.Object3D();
    var pi = 3.1415926535897932384626433832795;

    this.setOffset = function(pos){
        offset.x = pos.x;
        offset.y = pos.y;
    }

    // Terrain is an extension of Object3D and thus can be added directly to the stage
    this.initialize = function( height_parm, width_parm, level_parm, res_param ) {

        terrainVert = loadFileToString("./shaders/terrain.vert");
        terrainFrag = loadFileToString("./shaders/terrain.frag");
        terrainSnowFrag = loadFileToString("./shaders/terrainSnow.frag");
        terrainToonFrag = loadFileToString("./shaders/terrainToon.frag");

        textures = {
            grass: THREE.ImageUtils.loadTexture( texturePath + "grass.jpg" ),
            rock: THREE.ImageUtils.loadTexture( texturePath + "rock.jpg" ),
            snow: THREE.ImageUtils.loadTexture( texturePath + "snow.jpg" )
        };

        for ( var t in textures ) {
            if ( textures.hasOwnProperty( t ) ) {
                textures[t].wrapS = textures[t].wrapT = THREE.RepeatWrapping;
            }
        }

        THREE.Object3D.call( this );

        worldWidth = ( width_parm !== undefined ) ? width_parm : 1024;
        levels = ( level_parm !== undefined ) ? level_parm : 6;
        resolution = ( res_param !== undefined ) ? res_param : 128;
        heightData = height_parm;

        // Offset is used to re-center the terrain, this way we get the greates detail
        // nearest to the camera. In the future, should calculate required detail level per tile
        offset = new THREE.Vector3( 0, 0, 0 );

        // Which shader should be used for rendering
        fragShaders = [terrainFrag, terrainSnowFrag, terrainToonFrag];
        mesh.fragShader = terrainSnowFrag;

        // Create geometry that we'll use for each tile, just a standard plane
        tileGeometry = new THREE.PlaneGeometry( 1, 1, resolution, resolution );
        // Place origin at bottom left corner, rather than center
        var m = new THREE.Matrix4();
        m.makeTranslation( 0.5, 0.5, 0 );
        tileGeometry.applyMatrix( m );

        // Create collection of tiles to fill required space
        /*jslint bitwise: true */
        var initialScale = worldWidth / Math.pow( 2, levels );

        // Create center layer first
        //    +---+---+
        //    | O | O |
        //    +---+---+
        //    | O | O |
        //    +---+---+
        createTile( -initialScale, -initialScale, initialScale, Edge.NONE );
        createTile( -initialScale, 0, initialScale, Edge.NONE );
        createTile( 0, 0, initialScale, Edge.NONE );
        createTile( 0, -initialScale, initialScale, Edge.NONE );

        // Create "quadtree" of tiles, with smallest in center
        // Each added layer consists of the following tiles (marked 'A'), with the tiles
        // in the middle being created in previous layers
        // +---+---+---+---+
        // | A | A | A | A |
        // +---+---+---+---+
        // | A |   |   | A |
        // +---+---+---+---+
        // | A |   |   | A |
        // +---+---+---+---+
        // | A | A | A | A |
        // +---+---+---+---+
        for ( var scale = initialScale; scale < worldWidth; scale *= 2 ) {
            createTile( -2 * scale, -2 * scale, scale, Edge.BOTTOM | Edge.LEFT );
            createTile( -2 * scale, -scale, scale, Edge.LEFT );
            createTile( -2 * scale, 0, scale, Edge.LEFT );
            createTile( -2 * scale, scale, scale, Edge.TOP | Edge.LEFT );

            createTile( -scale, -2 * scale, scale, Edge.BOTTOM );
            // 2 tiles 'missing' here are in previous layer
            createTile( -scale, scale, scale, Edge.TOP );

            createTile( 0, -2 * scale, scale, Edge.BOTTOM );
            // 2 tiles 'missing' here are in previous layer
            createTile( 0, scale, scale, Edge.TOP );

            createTile( scale, -2 * scale, scale, Edge.BOTTOM | Edge.RIGHT );
            createTile( scale, -scale, scale, Edge.RIGHT );
            createTile( scale, 0, scale, Edge.RIGHT );
            createTile( scale, scale, scale, Edge.TOP | Edge.RIGHT );
        }

        var m = new THREE.Matrix4();
        m.makeRotationX(pi * 1.5);
        mesh.applyMatrix( m );
        /*jslint bitwise: false */
    };

    this.getMesh = function()    {
        return mesh;
    }

    function createTile( x, y, scale, edgeMorph ) {
        var terrainMaterial = createTerrainMaterial( heightData,
            offset,
            new THREE.Vector2( x, y ),
            scale,
            resolution,
            edgeMorph );
        var plane = new THREE.Mesh( tileGeometry, terrainMaterial );
        mesh.add( plane );
    }

    function createTerrainMaterial( heightData, globalOffset, offset, scale, resolution, edgeMorph ) {
        // Is it bad to change this for every tile?
        modifyDefine(terrainVert, "TILE_RESOLUTION", resolution.toFixed(1));

        return new THREE.ShaderMaterial( {
            uniforms: {
                uEdgeMorph: { type: "i", value: edgeMorph },
                uGlobalOffset: { type: "v3", value: globalOffset },
                uHeightData: { type: "t", value: heightData },
                //uGrass: { type: "t", value: textures.grass },
                uRock: { type: "t", value: textures.rock },
                //uSnow: { type: "t", value: textures.snow },
                uTileOffset: { type: "v2", value: offset },
                uScale: { type: "f", value: scale }
            },
            vertexShader: terrainVert,
            fragmentShader: mesh.fragShader,
            transparent: true
        } );
    };

    function modifyDefine(target ,define, value ) {
        var regexp = new RegExp("#define " + define + " .*", "g");
        var newDefine = "#define " + define + ( value ? " " + value : "" );
        if ( target.match( regexp ) ) {
            // #define already exists, update its value
            target = target.replace( regexp, newDefine );
        }
        else {
            // New #define, prepend to start of file
            target = newDefine + "\n" + target.value;
        }
    }

    this.cycleShader = function() {
        // Swap between different terrains
        var f = mesh.fragShaders.indexOf( mesh.fragShader );
        f = ( f + 1 ) % mesh.fragShaders.length;
        this.fragShader = mesh.fragShaders[f];

        // Update all tiles
        for ( var c in mesh.children ) {
            var tile = mesh.children[c];
            tile.material.fragmentShader = mesh.fragShader.value;
            tile.material.needsUpdate = true;
        }

        return f;
    };
}
