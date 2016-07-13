import Phaser from "phaser";
import Prefab from "./Prefab";


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

    update() {
        // this.state.game.physics.arcade.collide(this, this.state.layers.collision);
        this.state.game.physics.arcade.collide(this, this.state.groups.collision);

        // Move left
        if (this.cursors.left.isDown) {
            if (this.body.velocity.x > 10) {
                this.body.velocity.x = 10;
            }
            this.body.acceleration.x -= this.walkingSpeed;

            if (this.facing !== "left") {
                this.facing = "left";
                this.scale.x *= -1;
            }

        } else if (this.cursors.left.justUp) {
            this.body.acceleration.x = 0;
        }

        // Move right
        if (this.cursors.right.isDown) {
            if (this.body.velocity.x < -10) {
                this.body.velocity.x = -10;
            }
            this.body.acceleration.x += this.walkingSpeed;

            if (this.facing !== "right") {
                this.facing = "right";
                this.scale.x *= -1;
            }
        } else if (this.cursors.right.justUp) {
            this.body.acceleration.x = 0;
        }

        if (Math.abs(this.body.velocity.x) > 10) {
            this.animations.play("walk");
        } else if (Math.abs(this.body.velocity.y) < 10) {
            // this.animations.stop();
            this.animations.play("idle");
        }

        // Jump only if touching a tile
        if (
            this.cursors.up.isDown && !this.cursors.up.repeats &&
            (this.body.blocked.down || this.body.touching.down)
        ) {
            this.body.velocity.y = -this.jumpingSpeed;
            this.animations.play("jump");
        }

        // Wall sliding
        if (!this.body.touching.down) {
            if (this.cursors.right.isDown && this.body.touching.right) {
                if (this.body.velocity.y > 100) {
                    this.frameName = "Jump__003.png";
                    this.body.velocity.y = 100;
                }

                if (this.facing !== "right") {
                    this.facing = "right";
                    this.scale.x *= -1;
                }
            }

            if (this.cursors.left.isDown && this.body.touching.left) {
                if (this.body.velocity.y > 100) {
                    this.frameName = "Jump__003.png";
                    this.body.velocity.y = 100;
                }

                if (this.facing !== "left") {
                    this.facing = "left";
                    this.scale.x *= -1;
                }
            }
        }

        // Wall jumping
        if (!this.body.touching.down) {
            if (this.body.touching.right && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.body.velocity.y = -this.jumpingSpeed;
                this.body.acceleration.x = -1000;
                this.body.velocity.x = -250;
                this.animations.play("jump");

                if (this.facing !== "left") {
                    this.facing = "left";
                    this.scale.x *= -1;
                }
            } else if (this.body.touching.left && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.body.velocity.y = -this.jumpingSpeed;
                this.body.acceleration.x = 1000;
                this.body.velocity.x = 250;
                this.animations.play("jump");

                if (this.facing !== "right") {
                    this.facing = "right";
                    this.scale.x *= -1;
                }
            }
        }


        // TODO: Double jump

        this.game.world.wrap(this, 0, true);
    }

    hasReachedTargetPosition(targetPosition) {
        return Phaser.Point.distance(this.position, targetPosition) < 1;
    }

    moveTo(targetPosition) {
        this.state.pathfinding.findPath(this.position, targetPosition, this.setPath, this);
    }

    setPath(path = []) {
        this.path = path;
        this.pathStep = 0;
    }
}
