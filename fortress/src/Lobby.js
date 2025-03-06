import Phaser from "phaser";

const R = 2560/1920;

export class Lobby extends Phaser.Scene {

    constructor() {
        super('Lobby');
    }

    preload() {
        this.load.image("table", "assets/lobby_table.png");
        this.load.atlas("p1", "assets/lobby_player.png", "assets/lobby_player.json");
        this.load.image("bg", "assets/lobby_bg.png");

        this.p1Enter = false;

        //Retrieve this from server!
        this.p2Enter = false;

    }

    create() {
        const SCENE_W = this.sys.game.canvas.width
        const SCENE_H = this.sys.game.canvas.height;
        //console.log(SCENE_W, SCENE_H)

        /*** add sprites******/ 
        this.bg = this.add.image(-244,-197,"bg").setOrigin(0,0);

        //Display origin = -x of the symbol in group, -y of symbol in goup
        //
        // /*oafkjldfsaadfsjo;js*/ this.p1anims = {"Enter":{count: 4,offsets: {x: 0, y: 150}},
        {name: "Idle"}};
        this.anims.create(
            { key: 'enter',
            frames: this.anims.generateFrameNames(
                'p1',
                { prefix: 'lobby_playerEnter', end: 3, zeroPad: 4 }
            ),
            repeat: -1 });
        this.anims.create(
            { key: 'idle',
            frames: this.anims.generateFrameNames(
                'p1',
                { prefix: 'lobby_playerIdle', end: 0, zeroPad: 4 }
            ),
            repeat: -1 });
        this.anims.create(
            { key: 'ready',
            frames: this.anims.generateFrameNames(
                'p1',
                { prefix: 'lobby_playerReady', end: 10, zeroPad: 4 }
            ),
            repeat: 1 });

        
        //this.p1 = this.add.sprite(486,427,"p1").setOrigin(-0,-146).play("enter");
        this.p1 = this.add.sprite(-999,427,"p1").setDisplayOrigin(0,-150).play("enter");
        this.p2 = this.add.sprite((SCENE_W),427,"p1").setDisplayOrigin(0,-150).play("enter");


        // Initial location
        this.p1.setPosition(-this.p1.width, 378);
        this.p2.setPosition(SCENE_W+this.p2.width, 378);
        //this.p1.setPosition(486, 378); //test
        //this.p2.setPosition(1610, 378);//test //How is this number??????

        //this.p2.setPosition(this.p2.w + SCENE_W, 427);
        this.table = this.add.sprite( 760, 886, "table").setOrigin(0,0);
        this.table.scale = .859
        this.p1.scale = this.p2.scale = 1

        this.p2.flipX = true;
        this.bg.scale = 1

        
        /******handle inputs */
/*
        this.input.keyboard.on("keydown",(e)=>{
            this.p2.flipX = !this.p2.flipX;
        });*/
        //P1 enters at the start of the scene
        //Fire when the scene loads
        //Emits a Player enters room event
        
        this.input.keyboard.once("keydown",(e)=>{
            if (e.key === "e" && !e.repeat && !this.p1Enter){
                //this.p1.play("enter");
            console.log("p1 enters")
            this.tweens.add({
                targets:this.p1,
                x: 487,
                east: "Linear",
                duration: 1000,
                repeat: 0,
                yoyo:false,
                onComplete: ()=>{
                    console.log("idle")
                    this.p1.play("idle");
                    this.p1Enter = true;
                }
            })
        }

        })

        //Fire when server acknowledges p2 enter
        this.input.keyboard.once("keydown",(e)=>{
            if (e.key==="r" && !e.repeat && !this.p2Enter){
                console.log("p2 enters")
                    this.tweens.add({
                    targets:this.p2,
                    x: 1610,
                    east: "Linear",
                    duration: 1000,
                    repeat: 0,
                    yoyo:false,
                    onComplete: ()=>{
                        this.p2.play("idle");
                        this.p2Enter = true;
                    }
                })
            }
        }, true)


        this.p1.setInteractive({cursor: "pointer"});
        this.p1.on("pointerdown", (pointer)=>{
            if (this.p1Enter)
            {
                console.log("ldskjsjk")
                this.p1.setDisplayOrigin(115,31).play("ready");
            }
        });

       
    }
    playAnim(sprite, animName){
        //look up offsets 
        setDisplayOrigin(115,31).play("ready");
    }
    update() {
        
    }
    
}
