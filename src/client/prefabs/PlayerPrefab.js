import Phaser from "phaser";
import Prefab from "./Prefab";

const WALK_SLIDE_BUFFER = 10;
const WALL_SLIDE_SPEED = 100;
const WALL_JUMP_SIDE_ACCELERATION = 1000;
const WALL_JUMP_SIDE_VELOCITY = 250;


export default class PlayerPrefab extends Prefab {
    constructor(state, name, position, properties) {
        super(state, name, position, properties);

        this.anchor.setTo(0.5, 0.5);
        this.state.game.add.existing(this);
        this.scale.setTo(0.4);

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
        this.body.maxVelocity.y = 500;

        this.facing = "right";

        this.cursors = this.state.game.input.keyboard.createCursorKeys();
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
            this.animations.play("walk");
        } else if (Math.abs(this.body.velocity.y) < WALK_SLIDE_BUFFER) {
            this.animations.play("idle");
        }
    }

    updateJumping() {
        // Jump only if touching a tile
        if (
            this.cursors.up.isDown && !this.cursors.up.repeats &&
            (this.body.blocked.down || this.body.touching.down)
        ) {
            this.body.velocity.y = -this.jumpingSpeed;
            this.animations.play("jump");
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

                this.faceDirection("right");
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
        // Wall jumping
        if (!this.body.blocked.down && !this.body.touching.down) {
            if ((this.body.blocked.right || this.body.touching.right) && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.body.velocity.y = -this.jumpingSpeed;
                this.body.acceleration.x = -WALL_JUMP_SIDE_ACCELERATION;
                this.body.velocity.x = -WALL_JUMP_SIDE_VELOCITY;
                this.animations.play("jump");
                this.faceDirection("left");
            } else if ((this.body.blocked.left || this.body.touching.left) && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.body.velocity.y = -this.jumpingSpeed;
                this.body.acceleration.x = WALL_JUMP_SIDE_ACCELERATION;
                this.body.velocity.x = WALL_JUMP_SIDE_VELOCITY;
                this.animations.play("jump");
                this.faceDirection("right");
            }
        }
    }
}
