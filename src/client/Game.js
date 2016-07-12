import Phaser from "phaser";
import BootState from "./states/BootState";
import LoadingState from "./states/LoadingState";
import MainMenuState from "./states/MainMenuState";
import Level1State from "./states/Level1State";


export default class Game extends Phaser.Game {
    constructor() {
        super(960, 512, Phaser.AUTO, document.body, null, false, false);

        this.state.add("Boot", BootState, false);
        this.state.add("Loading", LoadingState, false);
        this.state.add("MainMenu", MainMenuState, false);
        this.state.add("Level1", Level1State, false);

        this.state.start("Boot");
    }
}
