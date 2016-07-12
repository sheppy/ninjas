import Phaser from "phaser";


export default class LoadingState extends Phaser.State {
    init(options) {
        Object.assign(this, options);
    }

    preload() {
        // Custom loading bar
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, "preloadBar");
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);

        this.game.load.onFileComplete.add(this.fileComplete, this);

        // Load the assets
        for (let key in this.assets) {
            if (this.assets.hasOwnProperty(key)) {
                let asset = this.assets[key];

                switch (asset.type) {
                    case "image":
                        this.load.image(key, asset.source);
                    break;
                    case "spritesheet":
                        this.load.spritesheet(key, asset.source, asset.frameWidth, asset.frameHeight, asset.frames, asset.margin, asset.spacing);
                    break;
                    case "tilemap":
                        this.load.tilemap(key, asset.source, null, Phaser.Tilemap.TILED_JSON);
                    break;
                }
            }
        }
    }

    fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
        console.log(`Loaded asset(${success} ${cacheKey} ${progress}% ${totalLoaded}/${totalFiles}`);
    }

    create() {
        let tween = this.add.tween(this.preloadBar).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(this.startNextState, this);
    }

    startNextState() {
        this.game.state.start(this.nextState, true, false);
    }
}
