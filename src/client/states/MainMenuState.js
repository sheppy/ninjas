import Phaser from "phaser";


export default class MainMenuState extends Phaser.State {
    create() {
        this.background = this.add.tileSprite(0, 0, 640, 480, "main-menu-bg");
        this.background.alpha = 0;

        // Fade the background in
        this.add.tween(this.background).to({ alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

        // Fade out when clicked
        this.input.onDown.addOnce(this.fadeOut, this);
    }

    fadeOut() {
        let tween = this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(this.startGame, this);
    }

    startGame() {
        this.game.state.start("Level1", true, false);
    }
}
