import Phaser from "phaser";

const R = 2560 / 1920;

const ANIMS = {
    enter: { start: 0, end: 3, repeat: -1 },
    idle: { start: 4, end: 4, repeat: -1 },
    ready: { start: 5, end: 16, repeat: 1 }
};

export default class Lobby extends Phaser.Scene {
    constructor() {
        super('Lobby');
    }

    createAnimations() {
        Object.entries(ANIMS).forEach(([key, anim]) => {
            this.anims.create({
                key: `${key}_p1`,
                frames: this.anims.generateFrameNumbers('p1', {
                    start: anim.start,
                    end: anim.end
                }),
                repeat:anim.repeat
            });
    }
    playAnim(sprite, key) {
        const anim = ANIMS[key];
        if (!anim) return;
        
        // Create a unique animation key for this sprite+animation combination
        const animKey = `${key}_${sprite.name}`;
        
        // Create the animation if it doesn't exist
        if (!this.anims.exists(animKey)) {
            this.anims.create({
                key: animKey,
                frames: this.anims.generateFrameNumbers('p1', {
                    start: anim.start,
                    end: anim.end
                }),
                repeat: key === 'ready' ? 1 : -1
            });
        }
        
        sprite.play(animKey);
    }

    preload() {
        this.load.image("table", "assets/lobby_table.png");
        this.load.spritesheet("p1", "assets/lobby_player.png", {
            frameWidth: 512,  // Adjust to your frame size
            frameHeight: 512
        });
        this.load.image("bg", "assets/lobby_bg.png");

        this.p1Enter = false;
        this.p2Enter = false;
        this.p1Ready = false;
    }

    create() {
        const SCENE_W = this.sys.game.canvas.width;
        const SCENE_H = this.sys.game.canvas.height;

        /*** add sprites******/
        this.bg = this.add.image(-244, -197, "bg").setOrigin(0, 0);

        // Draw debug point
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000);
        graphics.strokeCircle(627, 1098, 5);
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(627, 1098, 5);

        // Create all animations
        this.createAnimations();

        //this.p1 = this.add.sprite(486,427,"p1").setOrigin(-0,-146).play("enter");
        this.p1 = this.add.sprite(-999, 1098, "p1").setOrigin(0.5, 1).setName('p1');  // Add name for unique animation key
        this.p2 = this.add.sprite((SCENE_W), 1098, "p2").setOrigin(0.5, 1).setName('p2');  // Add name for unique animation key
        this.playAnim(this.p1, 'enter');
        this.playAnim(this.p2, 'enter');

        // Initial location
        this.p1.setPosition(-this.p1.width, 1098);
        this.p2.setPosition(SCENE_W + this.p2.width, 1098);
        //this.p1.setPosition(486, 378); //test
        //this.p2.setPosition(1610, 378);//test //How is this number??????

        //this.p2.setPosition(this.p2.w + SCENE_W, 427);
        this.table = this.add.sprite(760, 886, "table").setOrigin(0, 0);
        this.table.scale = .859;
        this.p1.scale = this.p2.scale = 1;

        this.p2.flipX = true;
        this.bg.scale = 1


        /******handle inputs */
        /*
                this.input.keyboard.on("keydown",(e)=>{
                    this.p2.flipX = !this.p2.flipX;
                });*/
        //P1 enters at the start of the scene
        // plays enter naim
        //Emits a Player enters room event

        this.tweens.add({
            targets: this.p1,
            x: 627,
            ease: "Linear",
            duration: 1000,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                console.log("idle");
                this.playAnim(this.p1, 'idle');
                this.p1Enter = true;
            }
        })
        //Fire when server acknowledges p2 enter
        this.input.keyboard.on("keydown", (e) => {
            //console.log("p2 enters")
            if (e.key === "r" && !e.repeat && !this.p2Enter) {
                console.log("p2 enters");
                this.tweens.add({
                    targets: this.p2,
                    x: 1922,
                    ease: "Linear",
                    duration: 1000,
                    repeat: 0,
                    yoyo: false,
                    onComplete: () => {
                        this.playAnim(this.p2, 'idle');
                        this.p2Enter = true;
                    }
                });
            }
        });

        this.p1.setInteractive({ cursor: "pointer" });
        this.p1.on("pointerdown", (pointer) => {
            if (this.p1Enter && !this.p1Ready) {
                console.log("Player 1 ready");
                this.p1Ready = true;
                this.playAnim(this.p1, 'ready');
            } else if (this.p1Ready) {
                console.log("Player 1 unready");
                this.p1Ready = false;
                this.playAnim(this.p1, 'idle');
            }
        });
    }

    update() {
    }
}
