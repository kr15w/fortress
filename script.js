import { Sprite } from "./sprite.js";
import { InputHandler } from "./InputHandler.js";

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
let toLoadSprites = /*[
  {
    name: "lobby_player",
    isAnim: true,
    offsetX: 2052 / RATIO,
    offsetY: 572 / RATIO,
    isFlip: true,
  },
]; */ [
  {
    name: "lobby_bg",
    isAnim: false,
    offsetX: -244 / RATIO,
    offsetY: -197 / RATIO,
    isFlip: false,
  },
  {
    name: "lobby_player",
    isAnim: true,
    offsetX: 487 / RATIO,
    offsetY: 572 / RATIO,
    isFlip: false,
  },
  {
    name: "lobby_player",
    isAnim: true,
    offsetX: 2052 / RATIO,
    offsetY: 572 / RATIO,
    isFlip: true,
  },

  {
    name: "lobby_table",
    isAnim: false,
    offsetX: 720 / RATIO,
    offsetY: 886 / RATIO,
    isFlip: false,
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
        config.offsetX,
        config.offsetY,
        config.isFlip
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
