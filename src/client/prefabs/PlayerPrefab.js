import Phaser from "phaser";
import Prefab from "./Prefab";

const WALK_SLIDE_BUFFER = 10;
const WALL_SLIDE_SPEED = 100;
const JUMP_VARIABLE_HEIGHT = -120;
const JUMP_ACCELERATION = -35000;
const ACCELERATION_X = 150;
const ACCELERATION_X_AIR = 2;
const MIN_MOVEMENT_INPUT = 0.25;


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
        this.puffs.setAll("anchor.x", 0.5);
        this.puffs.setAll("scale.x", 0.5);
        this.puffs.setAll("scale.y", 0.5);
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

        this.body.acceleration.y = 0;

        // Wall sliding
        if (!this.body.blocked.down && !this.body.touching.down) {
            if (this.cursors.right.isDown && (this.body.blocked.right || this.body.touching.right)) {
                if (this.body.velocity.y > WALL_SLIDE_SPEED) {
                    this.frameName = "Jump__003.png";
                    this.body.velocity.y = WALL_SLIDE_SPEED;
                }

                this.faceDirection("right");
            } else if (this.cursors.left.isDown && (this.body.blocked.left || this.body.touching.left)) {
                if (this.body.velocity.y > WALL_SLIDE_SPEED) {
                    this.frameName = "Jump__003.png";
                    this.body.velocity.y = WALL_SLIDE_SPEED;
                }

                this.faceDirection("left");
            } else {
                this.killAccelerationIfHittingWall();
            }
        } else {
            this.killAccelerationIfHittingWall();
        }

        // Move right
        if (this.cursors.right.isDown) {
            this.updateMoveSpeed(1);
        } else if (this.cursors.right.justUp && !this.body.blocked.right) {
            this.body.acceleration.x = 0;
        }

        // Move left
        if (this.cursors.left.isDown) {
            this.updateMoveSpeed(-1);
        } else if (this.cursors.left.justUp && !this.body.blocked.left) {
            this.body.acceleration.x = 0;
        }

        // Animations
        if (Math.abs(this.body.velocity.x) > WALK_SLIDE_BUFFER) {
            // Change walking animation speed?
            //this.animations.currentAnim.speed = 20
            this.animations.play("walk");
        } else if (Math.abs(this.body.velocity.y) < WALK_SLIDE_BUFFER) {
            this.animations.play("idle");
        }

        // Jumping
        if (
            this.cursors.up.isDown && !this.cursors.up.repeats &&
            (this.body.blocked.down || this.body.touching.down)
        ) {
            this.jump();
        }

        // Wall jumping
        if (!this.body.blocked.down && !this.body.touching.down) {
            if ((this.body.blocked.right || this.body.touching.right) && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.updateMoveSpeed(-1);
                this.jump();
            } else if ((this.body.blocked.left || this.body.touching.left) && this.cursors.up.isDown && !this.cursors.up.repeats) {
                this.updateMoveSpeed(1);
                this.jump();
            }
        }

        // Variable height jump
        if (this.cursors.up.isUp && this.cursors.up.justDown && this.body.velocity.y < JUMP_VARIABLE_HEIGHT) {
            this.body.velocity.y = JUMP_VARIABLE_HEIGHT;
        }

        // TODO: Double jump

        this.game.world.wrap(this, 0, true);
    }

    jump() {
        if (this.body.velocity.y > 0) {
            this.body.velocity.y = 0;
        }

        this.body.acceleration.y = JUMP_ACCELERATION;
        this.animations.play("jump");
        this.showPuff();
    }

    killAccelerationIfHittingWall() {
        // Kill acceleration when hitting a wall
        if (
            (this.body.acceleration.x > 0 && (this.body.blocked.right || this.body.touching.right)) ||
            (this.body.acceleration.x < 0 && (this.body.blocked.left || this.body.touching.left))
        ) {
            this.body.acceleration.x = 0;
        }
    }

    updateMoveSpeed(speed) {
        // Ignore if the player input speed is too slow
        if (speed * speed < MIN_MOVEMENT_INPUT) {
            speed = 0;
        }

        // Allow fast turning
        if ((speed > 0) != (this.body.velocity.x > 0) && this.body.velocity.x != 0) {
            this.body.velocity.x = 0;
            this.body.acceleration.x = 0;
        }

        // Update acceleration
        if (this.body.blocked.down || this.body.touching.down) {
            this.body.acceleration.x += ACCELERATION_X * speed;
        } else {
            this.body.acceleration.x += ACCELERATION_X * speed * ACCELERATION_X_AIR;
        }

        // Update facing direction
        this.faceDirection(speed > 0 ? "right" : "left");
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
