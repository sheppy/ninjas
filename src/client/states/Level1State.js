import Phaser from "phaser";
import dat from "exdat";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import LineOfSightPlugin from "../plugins/LineOfSightPlugin";


export default class Level1State extends Phaser.State {
    create() {
        this.stage.backgroundColor = "#222034";

        this.createMap();

        // this.setupGUI();

        // Render line of sight
        this.lineOfSight = this.game.plugins.add(LineOfSightPlugin, {
            // tileMapLayer: this.layers.collision
            shadowColor: 'rgb(15, 15, 15)'
        });

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.world.enableBody = true;
        this.game.physics.arcade.gravity.y = 1250;

        this.game.physics.arcade.OVERLAP_BIAS = 20;

        this.createPlayer();
    }

    setupGUI() {
        this.gui = new dat.GUI();

        var guiLevel = this.gui.addFolder('Physics');

        // guiLevel.add(this.game.physics.arcade.gravity, 'y', 0, 999).name('gravity').listen();
        // guiLevel.add(this.player, 'x', 0, this.game.width).name('x').listen();
        // guiLevel.add(this.player, 'y', 0, this.game.height).name('y').listen();
        guiLevel.open();
    }

    createMap() {
        // Create map and set tileset
        this.map = this.add.tilemap("map2");

        // Loop thru all tilesets
        this.map.tilesets.forEach(tileset => {
            this.map.addTilesetImage(tileset.name);
        });

        this.map.addTilesetImage(this.map.tilesets[0].name);

        // Create map layers
        this.layers = {};
        this.map.layers.forEach(layer => {
            this.layers[layer.name] = this.map.createLayer(layer.name);

            // Collision layer
            if (layer.properties.collision) {
                let collisionTiles = [];
                this.layers[layer.name].alpha = 0;  // Hide this layer
                layer.data.forEach(dataRow => {
                    // Find tiles used in the layer
                    dataRow.forEach(tile => {
                        // Check if it's a valid tile index and isn't already in the list
                        if (tile.index > 0 && collisionTiles.indexOf(tile.index) === -1) {
                            collisionTiles.push(tile.index);
                        }
                    });
                });

                this.map.setCollision(collisionTiles, true, layer.name);
            }
        });

        // TODO: Create groups?
        this.groups = {};
        this.groups["collision"] = this.game.add.group();
        this.groups["player-spawn"] = [];

        // Create objects
        this.prefabs = {};
        for (let objectLayer in this.map.objects) {
            if (this.map.objects.hasOwnProperty(objectLayer)) {
                this.map.objects[objectLayer].forEach(this.createObject, this);
            }
        }

        // Resize the world to be the size of the current layer
        this.layers[this.map.layer.name].resizeWorld();
    }

    createObject(object) {
        switch (object.type) {
            case "collision":
                let collider = this.game.add.sprite(object.x, object.y);
                collider.width = object.width;
                collider.height = object.height;
                this.game.physics.arcade.enable(collider);
                collider.body.allowGravity = false;
                collider.body.immovable = true;
                // collider.renderable = false;
                collider.bringToTop();

                if (object.properties.allowUp) {
                    collider.body.checkCollision.down = false;
                }
            break;

            case "player-spawn":
                this.groups["player-spawn"].push({
                    x: object.x,
                    y: object.y,
                    facing: object.properties.facing
                });
            break;

            default:
                console.warn(`Unknown object type "${object.type}"`);
        }
    }

    createPlayer() {
        // TODO: Get random spawn
        let numSpawns = this.groups["player-spawn"].length;
        let spawnIndex = Math.floor(Math.random() * numSpawns);
        let spawn = this.groups["player-spawn"][spawnIndex];

        console.log(spawn);

        this.player = new PlayerPrefab(this, "player", { x: spawn.x, y: spawn.y }, {
            texture: "ninja",
            frame: "Idle__009.png",
            facing: spawn.facing
        });
    }

    updatePlayerLineOfSight() {
        this.lineOfSight.updateLineOfSite(this.player.x, this.player.y);
    }

    update() {
        this.updatePlayerLineOfSight();
    }

    render() {
        // this.game.debug.text(this.game.time.fps, 2, 14, "#6ABD30");
        this.game.debug.bodyInfo(this.player, 16, 24, "#6ABD30");
        // this.game.debug.body(this.player);
    }
}
