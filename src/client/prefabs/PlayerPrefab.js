import Phaser from "phaser";
import Prefab from "./Prefab";

const WALK_SLIDE_BUFFER = 10;
const WALL_SLIDE_SPEED = 100;
const WALL_JUMP_SIDE_ACCELERATION = 1000;
const WALL_JUMP_SIDE_VELOCITY = 250;
const JUMP_VARIABLE_HEIGHT = -120;
const JUMP_ACCELERATION = -35000;


export default class PlayerPrefab extends Prefab {
    constructor(state, name, position, properties) {
        super(state, name, position, properties);

        this.anchor.setTo(0.5, 0.5);
        this.state.game.add.existing(this);
        this.scale.setTo(0.36);

        // this.animations.add("walk-down", [1, 2, 1, 0], 10, true);
        // this.animations.add("walk-left", [4, 5, 4, 3], 10, true);
        // this.animations.add("walk-right", [7, 8, 7, 6], 10, true);
        // this.animations.add("walk-up", [10, 11, 10, 9], 10, true);

        this.animations.add("walk", Phaser.Animation.generateFrameNames("Run__", 0, 9, '.png', 3), 10, true, false);
        this.animations.add("idle", Phaser.Animation.generateFrameNames("Idle__", 0, 9, '.png', 3), 10, true, false);
        this.animations.add("jump", Phaser.Animation.generateFrameNames("Jump__", 0, 9, '.png', 3), 10, false, false);
        this.animations.play("idle");

        this.state.game.physics.arcade.enable(this);
        // this.body.collideWorldBounds = true;

        this.walkingSpeed = 150;
        this.jumpingSpeed = 500;

        this.body.drag.x = 900;
        this.body.maxVelocity.x = 250;
        this.body.maxVelocity.y = 1000;

        this.facing = "right";
        this.faceDirection(properties.facing);

        this.cursors = this.state.game.input.keyboard.createCursorKeys();

        this.puffs = this.state.game.add.group();
        this.puffs.createMultiple(5, "puff", 0, false);
        this.puffs.alpha = 0.5;
        this.puffs.callAll("animations.add", "animations", "puff", [0, 1, 2, 3, 4], 20, true);
        this.puffs.setAll('anchor.x', 0.5);
        this.puffs.setAll('scale.x', 0.5);
        this.puffs.setAll('scale.y', 0.5);
    }

    faceDirection(direction) {
        if (this.facing !== direction) {
            this.facing = direction;
            this.scale.x *= -1; // Flip the sprite
        }
    }

    update() {
        this.state.game.physics.arcade.collide(this, this.state.layers.collision);
        this.state.game.physics.arcade.collide(this, this.state.groups.collision);

        this.updateWalking();
        this.updateJumping();
        this.updateWallSliding();
        this.updateWallJumping();

        // TODO: Double jump

        this.game.world.wrap(this, 0, true);
    }

    updateWalking() {
        // Move left
        if (this.cursors.left.isDown) {
            if (this.body.velocity.x > WALK_SLIDE_BUFFER) {
                this.body.velocity.x = WALK_SLIDE_BUFFER;
            }

            this.body.acceleration.x -= this.walkingSpeed;

            this.faceDirection("left");
        } else if (this.cursors.left.justUp) {
            this.body.acceleration.x = 0;
        }

        // Move right
        if (this.cursors.right.isDown) {
            if (this.body.velocity.x < -WALK_SLIDE_BUFFER) {
                this.body.velocity.x = -WALK_SLIDE_BUFFER;
            }

            this.body.acceleration.x += this.walkingSpeed;

            this.faceDirection("right");
        } else if (this.cursors.right.justUp) {
            this.body.acceleration.x = 0;
        }

        if (Math.abs(this.body.velocity.x) > WALK_SLIDE_BUFFER) {
            // Change walking animation speed?
            //this.animations.currentAnim.speed = 20
            this.animations.play("walk");
        } else if (Math.abs(this.body.velocity.y) < WALK_SLIDE_BUFFER) {
            this.animations.play("idle");
        }
    }

    updateJumping() {
        this.body.acceleration.y = 0;

        // Jump only if touching a tile
        if (
            this.cursors.up.isDown && !this.cursors.up.repeats &&
            (this.body.blocked.down || this.body.touching.down)
        ) {
            this.body.acceleration.y = JUMP_ACCELERATION;
            this.animations.play("jump");

            this.showPuff();
        }

        // Variable height jump
        if (this.cursors.up.isUp && this.cursors.up.justDown && this.body.velocity.y < JUMP_VARIABLE_HEIGHT) {
            this.body.velocity.y = JUMP_VARIABLE_HEIGHT;
        }
    }

    updateWallSliding() {
        // Wall sliding
        if (!this.body.blocked.down && !this.body.touching.down) {
            if (this.cursors.right.isDown && (this.body.blocked.right || this.body.touching.right)) {
                if (this.body.velocity.y > WALL_SLIDE_SPEED) {
                    this.frameName = "Jump__003.png";
                    this.body.velocity.y = WALL_SLIDE_SPEED;
                }
            }

            if (this.cursors.left.isDown && (this.body.blocked.left || this.body.touching.left)) {
                if (this.body.velocity.y > WALL_SLIDE_SPEED) {
                    this.frameName = "Jump__003.png";
                    this.body.velocity.y = WALL_SLIDE_SPEED;
                }

                this.faceDirection("left");
            }
        }
    }

    updateWallJumping() {
        // TODO: Possibly refactor to use the same jumping calculation as static jumps
        // Wall jumping
        if (!this.body.blocked.down && !this.body.touching.down) {
            if ((this.body.blocked.right || this.body.touching.right) && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.body.velocity.y = -this.jumpingSpeed;
                this.body.acceleration.x = -WALL_JUMP_SIDE_ACCELERATION;
                this.body.velocity.x = -WALL_JUMP_SIDE_VELOCITY;
                this.animations.play("jump");
                this.faceDirection("left");
                this.showPuff();
            } else if ((this.body.blocked.left || this.body.touching.left) && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.body.velocity.y = -this.jumpingSpeed;
                this.body.acceleration.x = WALL_JUMP_SIDE_ACCELERATION;
                this.body.velocity.x = WALL_JUMP_SIDE_VELOCITY;
                this.animations.play("jump");
                this.faceDirection("right");
                this.showPuff();
            }
        }
    }

    showPuff() {
        let puff = this.puffs.getFirstExists(false);

        if (puff) {
            puff.reset(this.x, this.y);
            puff.frame = 0;
            puff.animations.play("puff", 25, false, true);
        }
    }
}
