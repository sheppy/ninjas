import Phaser from "phaser";


export default class Prefab extends Phaser.Sprite {
    constructor(state, name, position, properties) {
        super(state.game, position.x, position.y, properties.texture);

        this.state = state;
        this.name = name;
    }
}
