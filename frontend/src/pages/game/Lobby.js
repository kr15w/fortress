import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
/**
 * @todo handle animations
 * @todo automate origin setting (use the relative position of the largest sprite)
 * @todo emit a signal on each event
 * @todo hint at player to click on char to be ready
 * @todo show usernaem
 * @todo add prelobby in case user reloads screen (how to handle?)
 */
const ANIMS = {
  lobby_player: [
    {
      key: "enter",

      start: 0,
      end: 3,
      frameRate: 24,
      repeat: -1,
    },
    {
      key: "idle",

      start: 4,
      end: 4,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "ready",
      start: 5,
      end: 16,
      frameRate: 24,
      repeat: 0,
    },
  ],
};

export default class Lobby extends Phaser.Scene {
  constructor() {
    super("Lobby");
  }
  preload() {
    this.load.image("lobby_table", "assets/lobby_table.png");
    this.load.atlas(
      "lobby_player",
      "assets/lobby_player.png",
      "assets/lobby_player.json"
    );
    this.load.image("lobby_bg", "assets/lobby_bg.png");

    /* Get from server*/
    this.p1Enter = false;
    this.p2Enter = false;
    this.p1Ready = false;
    this.p2Ready = false; // if this is true, then p2Enter must be true
  }

  create() {
    const SCENE_W = this.sys.game.canvas.width;
    const SCENE_H = this.sys.game.canvas.height;

    /*static sprites*/
    this.bg = this.add.image(-244, -197, "lobby_bg").setOrigin(0, 0);
    this.table = this.add.sprite(760, 886, "lobby_table").setOrigin(0, 0);
    this.table.scale = 0.859;
    this.table.setDepth(100);

    /*animated sprirtes*/
    this.p1 = this.add.sprite(0, 1098, "lobby_player").setName("p1");
    this.p2 = this.add.sprite(0, 1098, "lobby_player").setName("p2");

    // PIVOTS
    // AUTOMATE THIS, use the largest anim for the stuff
    this.p1.setOrigin(291 / this.p1.width, 800 / this.p1.height);
    this.p2.setOrigin(291 / this.p2.width, 800 / this.p2.height);

    // Create dots to visualize p1's and p2's origins
    this.p1OriginDot = this.add.circle(0, 0, 5, 0x00ff00); // Green dot for p1
    this.p1OriginDot.setDepth(200); // Make sure it's visible above everything

    this.p2OriginDot = this.add.circle(0, 0, 5, 0xff0000); // Red dot for p2
    this.p2OriginDot.setDepth(200); // Make sure it's visible above everything

    loadAnims(ANIMS, this);

    this.p1.play("enter", true);
    this.p2.play("enter", true);

    this.p1.setPosition(-this.p1.width, 1098);

    if (this.p2Enter) {
      this.p2.setPosition(1922, 1098);
      this.p2.play("idle");
    } else {
      this.p2.setPosition(SCENE_W + this.p2.width, 1098);
    }

    this.p1.scale = this.p2.scale = 1;
    this.p2.scaleX = -1; // don't use flipX

    /******handle inputs */
    //Emits a Player enters room event
    this.tweens.add({
      targets: this.p1,
      x: 627,
      ease: "Linear",
      duration: 1500,
      repeat: 0,
      yoyo: false,
      onComplete: () => {
        console.log("idle");
        this.p1.play("idle");
        this.p1Enter = true;
      },
    });

    //Fire when server acknowledges p2 enter
    this.input.keyboard.on("keydown", (e) => {
      if (e.key === "r" && !e.repeat) {
        if (!this.p2Enter) {
          console.log("p2 enters");
          this.tweens.add({
            targets: this.p2,
            x: 1922,
            ease: "Linear",
            duration: 1000,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
              console.log("idle");
              this.p2.play("idle");
              this.p2Enter = true;
            },
          });
        }
      }
    });
    this.input.keyboard.on("keydown", (e) => {
      if (e.key === "e" && !e.repeat) {
        if (!this.p2Enter) {
          return;
        }
        //console.log("p2 RED");
        if (this.p2Ready) {
          this.p2.play("idle");
        } else {
          this.p2.play("ready");
        }
        this.p2Ready = !this.p2Ready;
      }
    });

    //WHY IS TI UNDEFINED
    // DEFINING CLICKABLE AREA FOR A SPECIFIC FRAME IDK NOW DELEGATE IT SDFAJKL;ASDFJKL;
    // Wait for animation to start before setting hit area
    /*this.p1.on("animationstart", (animation, frame) => {
			const frameWidth = frame.width;
			const frameHeight = frame.height;
			// Create a hit area based on the frame size
			this.p1.setInteractive({
				cursor: "pointer",
				hitArea: new Phaser.Geom.Rectangle(0, 0, frameWidth, frameHeight),
				hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			});

			console.log("Set hit area to frame size:", frameWidth, "x", frameHeight);
		});
*/
    // Initial interactive setup with placeholder
    this.p1.setInteractive({
      cursor: "pointer",
    });
    this.p1.on("pointerdown", (pointer) => {
      if (this.p1Enter && !this.p1Ready) {
        console.log("Player 1 ready");
        this.p1Ready = true;
        this.p1.play("ready");
      } else if (this.p1Ready) {
        console.log("Player 1 unready");
        this.p1Ready = false;
        this.p1.play("idle");
      }
    });
  }

  update() {
    // Check if both players are ready to start the game
    // Is it good to poll?
    if (this.p1Ready && this.p2Ready) {
      if (!this.startingGame) {
        this.startingGame = true;
        console.log("both ready, start in 2 sec");
        this.time.delayedCall(2000, () => {
          this.scene.stop("Lobby"); // Stop this scene first
          this.scene.start("Match");
        });
      }
    }
  }
}
