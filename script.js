import { Sprite } from "./sprite.js";
import "./InputHandler.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const DEVSIZE_X = 2560;
const DEVSIZE_Y = 1440;

const CANVAS_WIDTH = (canvas.width = 1920);
const CANVAS_HEIGHT = (canvas.height = 1080);

const RATIO = DEVSIZE_X / CANVAS_WIDTH;
//expect mons to be fhd but my mon is qhd so in case thinking of rescaling start from here idk

let state = 0;
/** 0: p1 enter game => 1: p2 enter game => 2: 0/1/2 players ready => 3: gamestart (switch scene) */
// back to front!!!!!
let toLoadSprites =
  /*[
  {
    name: "lobby_player",
    isAnim: true,
    x: 2052 / RATIO,
    y: 572 / RATIO,
    isFlip: true,
  },
]; */
  // manually enter these from flash
  [
    {
      name: "lobby_bg",
      isAnim: false,
      x: -244 / RATIO,
      y: -197 / RATIO,
      aOffsets: null,
      isFlip: false,
      clickable: false,
    },
    {
      name: "lobby_player",
      isAnim: true,
      x: -500 / RATIO,
      y: 427 / RATIO,
      aOffsets: {
        Enter: { x: 0, y: 115 / RATIO },
        Idle: { x: 0, y: 150 / RATIO },
        Ready: { x: 0, y: 0 },
      },
      isFlip: false,
      clickable: true,
    },
    {
      name: "lobby_player",
      isAnim: true,
      x: 2100 / RATIO,
      y: 427 / RATIO,
      aOffsets: {
        Enter: { x: 0, y: -116 / RATIO },
        Idle: { x: 0, y: 150 / RATIO },
        Ready: { x: 0, y: 0 },
      },
      isFlip: true,
      clickable: true,
    },

    {
      name: "lobby_table",
      isAnim: false,
      x: 720 / RATIO,
      y: 886 / RATIO,
      aOffsets: null,
      isFlip: false,
      clickable: false,
    },
  ];

let loadedSprites = [];

function loadSprites(spriteConfigs) {
  const loadPromises = spriteConfigs.map((config) => {
    //console.log("loading", config.name);
    return new Promise((resolve) => {
      const playerSprite = new Sprite(
        config.name,
        config.isAnim,
        config.x,
        config.y,
        config.aOffsets,
        config.isFlip,
        config.clickable
      );

      const checkAtlasLoaded = setInterval(() => {
        if (playerSprite.atlas) {
          clearInterval(checkAtlasLoaded);
          loadedSprites.push(playerSprite);
          resolve();
        }
      }, 100);
    });
  });

  return Promise.all(loadPromises);
}

async function start() {
  await loadSprites(toLoadSprites);

  console.log("loaded", loadedSprites);
  update();
}

// update loop
let timer = 0;
function update() {
  //state manage
  /*switch (state) {
    case 0:
      //p1 enter
      loadedSprites[1].setAnim("Enter");
      break;
    case 1:
      //Enter finish
      loadedSprites[1].setAnim("Idle");
      break;
    case 2:
      //p2 enter
      loadedSprites[1].setAnim("Enter");
      break;
    case 3:
      //0/1/2 players ready

      break;
    case 4:
      //gamestart
      break;
  }*/

  //draw

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  /*const test = new Image();
  test.src = `./assets/test.png`;
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(test, 0, 0, 100, 100, 0 - 200, 0, test.width * -1, test.height);
  ctx.restore();*/
  for (let s of loadedSprites) {
    s.draw(ctx, timer, RATIO);
  }
  timer++;
  requestAnimationFrame(update);
}

start();

//input handling

// player enters empty room
document.addEventListener("keydown", (e) => {
  if (e.key == "e" && !e.repeat) {
    console.log("Player enters game");
    const player = loadedSprites[1];
    player.setAnim("Enter");
    player.x = -200 / RATIO;

    const targetX = 487 / RATIO;
    const speed = 10;

    function animate() {
      if (player.x < targetX) {
        player.x += speed;
        requestAnimationFrame(animate);
      } else {
        player.x = targetX;
        player.setAnim("Idle");
      }
    }

    animate();
  }
});
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let s of loadedSprites) {
    if (s.isPointInside(x, y, RATIO)) {
      s.handleClick();
    }
  }
});
