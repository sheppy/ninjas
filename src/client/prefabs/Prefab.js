import Phaser from "phaser";


export default class Prefab extends Phaser.Sprite {
    constructor(state, name, position, properties) {
        super(state.game, position.x, position.y, properties.texture, properties.frame);

        this.state = state;
        this.name = name;
    }
}
