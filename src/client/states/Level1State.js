import Phaser from "phaser";
import dat from "exdat";
import PlayerPrefab from "../prefabs/PlayerPrefab";
import LineOfSightPlugin from "../plugins/LineOfSightPlugin";


export default class Level1State extends Phaser.State {
    create() {
        this.stage.backgroundColor = "#696A6A";

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
        this.map = this.add.tilemap("map1");

        // TODO: Loop thru all tilesets
        this.map.addTilesetImage(this.map.tilesets[0].name);

        // Create map layers
        this.layers = {};
        this.map.layers.forEach(layer => {
            this.layers[layer.name] = this.map.createLayer(layer.name);
        });

        // TODO: Create groups?
        this.groups = {};
        this.groups["collision"] = this.game.add.group();

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
                collider.body.checkCollision.down = false;

                this.groups["collision"].add(collider);

                this.collider = collider;
            break;
        }
    }

    createPlayer() {
        this.player = new PlayerPrefab(this, "player", { x: 176, y: 144 }, {
            texture: "ninja",
            frame: "Idle__009.png"
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
        // this.game.debug.bodyInfo(this.player, 16, 24, "#6ABD30");
        // this.game.debug.spriteInfo(this.collider, 10, 10, 'rgba(0,255,0,0.5)');
        // this.game.debug.spriteBounds(this.collider);
        // this.game.debug.spriteCoords(this.collider, 10, 10);

        // this.game.debug.bodyInfo(this.player, 32, 32);
        // this.game.debug.body(this.player);
    }
}
