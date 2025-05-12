import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import { io } from 'socket.io-client';
let playerName;
let RMCODE = sessionStorage.getItem("roomCode") || ""; // Get room code from sessionStorage
let socket;
/**
 * @todo handle animations
 * nah automate origin setting (use the relative position of the largest sprite)
 * @todo emit a signal on each event
 * done hint at player to click on char to be ready
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
			end: 7,

			frameRate: 8,
			repeat: -1,
		},
		{
			key: "ready",
			start: 8,
			end: 10,
			frameRate: 24,
			repeat: 0,
		},
		{
			key: "notice",
			start: 11,
			end: 15,
			frameRate: 24,
			repeat: 0,
		},
		{
			key: "annoyed",
			start: 16,
			end: 16,
		},
	],
};

export default class Lobby extends Phaser.Scene {
	constructor() {
		super("Lobby");
		socket = io('http://localhost:5000');

		socket.on('message_from_server', (msg) => {
            console.log('Received from server:', msg);
            if (msg.startsWith('Room Created: ')) {
                if (!sessionStorage.getItem("roomCode")) {
                    this.RMCODE = msg.substring('Room Created: '.length);
                    console.log('New Room ID:', this.RMCODE);
                	alert('Room ID: ' + this.RMCODE);
					this.updateRoomCode(this.RMCODE);
				}
				else if (msg === 'Error: Room does not exist.') {
					alert('Invalid room code. Please try again.');
					// Redirect back to menu
					window.location.href = '/menu';
				}
            }
        });

        // Then fetch the token and emit
        fetch('/api/token')
            .then(response => response.json())
            .then(data => {
                this.playerName = data.token;
                console.log('Got player name:', this.playerName);
                
                // Now emit the message with the player name
                const message = JSON.stringify({
                    player_name: this.playerName
                });
                console.log('Sending message:', message);
                socket.emit('message_from_client', message);
            })
            .catch(error => console.error('Error fetching token:', error));
	}

	updateRoomCode(code) {
		code.toUpperCase()
        if (!this.rmCodeDigits) return; // Guard against calling before create()
        
        for (let i in code) {
            if (code[i] >= "A" && code[i] <= "Z") {
                let frameNum = code.charCodeAt(i) - "A".charCodeAt(0);
                this.rmCodeDigits.list[i].setFrame(
                    "lobby_rmCodeText" + String(frameNum).padStart(4, "0")
                );
            } else {
                let frameNum = code.charCodeAt(i) - "0".charCodeAt(0);
                this.rmCodeDigits.list[i].setFrame(
                    "lobby_rmCodeText" + String(frameNum + 26).padStart(4, "0")
                );
            }
        }
    }

	preload() {
		this.load.image("lobby_table", "assets/lobby_table.png");
		this.load.atlas(
			"lobby_rmCodeText",
			"assets/lobby_rmCodeText.png",
			"assets/lobby_rmCodeText.json"
		);
		this.load.image("lobby_rmCodeSign", "assets/lobby_rmCodeSign.png");

		this.load.image("lobby_exitBtn", "assets/lobby_exitBtn.png");
		this.load.atlas(
			"lobby_exitText",
			"assets/lobby_exitText.png",
			"assets/lobby_exitText.json"
		);

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
		this.bg = this.add
			.image(-244, -197, "lobby_bg")
			.setOrigin(0, 0)
			.setName("bg");
		this.table = this.add
			.sprite(760, 884, "lobby_table")
			.setOrigin(0, 0)
			.setName("tbl")
			.setDepth(100);
		this.exitBtn = this.add
			.image(141, 1151, "lobby_exitBtn")
			.setOrigin(0, 0)
			.setAlpha(0)
			.setName("exitBtn");

		/*animated sprirtes*/
		this.exitText = this.add
			.sprite(145, 1022, "lobby_exitText")
			.setOrigin(0)
			.setName("exitText")
			.setVisible(false);
		this.p1 = this.add.sprite(0, 1184, "lobby_player").setName("p1");
		this.p2 = this.add.sprite(0, 1184, "lobby_player").setName("p2");
		this.lol = 0;

		/*sign text*/
		this.rmCodeSign = this.add
			.sprite(1166, 569, "lobby_rmCodeSign")
			.setName("rmCodeSign")
			.setOrigin(0)
			.setDepth(998);
		this.rmCodeDigits = this.add.container(0, 0).setDepth(999);
		for (let i = 0; i < 4; i++) {
			this.rmCodeDigits.add(
				this.add
					.sprite(1200 + i * 200, 634, "lobby_rmCodeText")
					.setName("rmCodeDigits" + i)
					.setOrigin(0)
					.setFrame("lobby_rmCodeText000" + i)
					.setTint(0x1f58b5)
			);
		}
		this.rmCodeDigits.list[0].setPosition(1204, 635);
		this.rmCodeDigits.list[1].setPosition(1247, 648);
		this.rmCodeDigits.list[2].setPosition(1293, 648);
		this.rmCodeDigits.list[3].setPosition(1338, 663);



		// PIVOTS
		// AUTOMATE THIS use the largest anim for the stuff
		this.p1.setOrigin(291 / this.p1.width, 800 / this.p1.height);
		this.p2.setOrigin(291 / this.p2.width, 800 / this.p2.height);

		loadAnims(ANIMS, this);

		this.p1.play("lobby_player_enter", true);
		this.p2.play("lobby_player_enter", true);

		this.p1.setPosition(-this.p1.width, 1184);

		if (this.p2Enter) {
			this.p2.setPosition(1922, 1184);
			this.p2.play("lobby_player_idle");
		} else {
			this.p2.setPosition(SCENE_W + this.p2.width, 1184);
		}

		this.p1.scale = this.p2.scale = 1;
		this.p2.scaleX = -1; // don't use flipX

		/******handle inputs */
		// p1 enter and ready afterwards
		this.tweens.add({
			targets: this.p1,
			x: 627,
			ease: "Linear",
			duration: 1500,
			repeat: 0,
			yoyo: false,
			onComplete: () => {
				console.log("idle");
				this.p1.play("lobby_player_idle");
				this.p1Enter = true;

				//add exit button?
				this.tweens.add({
					targets: this.exitBtn,
					alpha: 0.8,
					ease: "Linear",
					duration: 500,
					onComplete: () => {
						this.exitBtn
							.setInteractive({ cursor: "pointer" })
							.on("pointerdown", () => {
								alert("quit it");
							})
							.on("pointerover", () => {
								{
									this.exitBtn.setAlpha(1);
									this.exitText.setVisible(true);
								}
							})
							.on("pointerout", () => {
								this.lol++;
								this.exitBtn.setAlpha(0.7);
								this.exitText.setVisible(false);
							});
						// p1 ready
						//fixing hit area

						this.p1
							.setInteractive({ cursor: "pointer" })
							.on("pointerover", () => {
								if (!this.p1Ready) {
									if (this.lol > 15 && this.lol % 16 == 0) {
										this.p1.play("lobby_player_annoyed");
									} else {
										this.p1.play("lobby_player_notice");
									}
								}
							})
							.on("pointerout", () => {
								if (!this.p1Ready) {
									this.lol++;
									this.p1.play("lobby_player_idle");
								}
							})
							.on("pointerdown", (pointer) => {
								this.lol = 0;
								if (this.p1Enter && !this.p1Ready) {
									console.log("Player 1 ready");
									this.p1Ready = true;
									this.p1.play("lobby_player_ready");
								} else if (this.p1Ready) {
									console.log("Player 1 unready");
									this.p1Ready = false;
									this.p1.play("lobby_player_idle");
								}
								var isReady = this.p1Ready === true;
								var message = JSON.stringify({
									player_name: playerName,
									room_id: RMCODE,
									action: 'ready',
									value: isReady
								});
								socket.emit('message_from_client', message);
							});
						/*
						//aaaaaaaaaaaaaaaaarrrrrgghh wip
						this.p1.input.hitArea = new Phaser.Geom.Rectangle(
							-81,
							-603,
							163,
							628
						);
						console.warn(this.p1.input.hitArea);

						//hmm
						const graphics = this.add.graphics();

						graphics.lineStyle(1, 0xff0000, 1);
						graphics.fillStyle(0x00ff00, 1);
						//graphics.strokeRect(0, 0, 100, 100);

						graphics.fillRect(
							this.p1.input.hitArea.x + 1000,
							this.p1.input.hitArea.y + 1000,
							this.p1.input.hitArea.width,
							this.p1.input.hitArea.height
						);

						graphics.strokeRect(
							this.p1.input.hitArea.x + this.p1.x,
							this.p1.input.hitArea.y + this.p1.y,
							this.p1.input.hitArea.width,
							this.p1.input.hitArea.height
						);
						graphics.strokeCircle(this.p1.x, this.p1.y, 10);*/
					},
				});
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
							this.p2.play("lobby_player_idle");
							this.p2Enter = true;
						},
					});
				}
			}
		});

		//Fire when p2 readies
		this.input.keyboard.on("keydown", (e) => {
			if (e.key === "e" && !e.repeat) {
				if (!this.p2Enter) {
					return;
				}
				//console.log("p2 RED");
				if (this.p2Ready) {
					this.p2.play("lobby_player_idle");
				} else {
					this.p2.play("lobby_player_ready");
				}
				this.p2Ready = !this.p2Ready;
			}
		});
	}


	update() {
		socket.on('game_state_refresh', function(gameState) {
			this.p2Enter = gameState.opponent_name ? true : false;
			this.p2Ready = gameState.opponent_ready ? true : false;
		});
		// Check if both players are ready to start the game
		if (this.p1Ready && this.p2Ready) {
			if (!this.startingGame) {
				this.startingGame = true;
				console.log("both ready, start in 2 sec");
				this.time.delayedCall(2000, () => {
					this.scene.stop("Lobby");
					this.scene.start("Match");
				});
			}
		}
	}
}
