import { Sprite } from "./assets.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 1920);
const CANVAS_HEIGHT = (canvas.height = 1080);

// back to front!!!!!
let toLoadSprites = [
  {
    name: "lobby_bg",
    isAnim: false,
    offsetX: -244 / 2,
    offsetY: -197 / 2,
  },
  {
    name: "lobby_player",
    isAnim: true,
    offsetX: 487 / 2,
    offsetY: 572 / 2,
  },
  {
    name: "lobby_table",
    isAnim: false,
    offsetX: 760 / 2,
    offsetY: 886 / 2,
  },
]; //this is super cursed

let loadedSprites = [];
/*const playerSprite = new Sprite("lobby_player", true);
const lobbyBgSprite = new Sprite("lobby_bg", false);
*/

function loadSprites(spriteConfigs) {
  const loadPromises = spriteConfigs.map((config) => {
    //console.log("loading", config.name);
    return new Promise((resolve) => {
      const playerSprite = new Sprite(
        config.name,
        config.isAnim,
        config.offsetX,
        config.offsetY
      );

      const checkAtlasLoaded = setInterval(() => {
        if (playerSprite.atlas) {
          clearInterval(checkAtlasLoaded);
          loadedSprites.push(playerSprite); // Store the loaded sprite
          resolve(); // Resolve the promise when the atlas is loaded
        }
      }, 100); // Check every 100ms
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
let frameT = 0;
function update() {
  //console.log(loadedSprites);
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let s of loadedSprites) {
    //console.log("drawing", s.offsetX, s.offsetY);
    if (s.fps > 1 && s.atlas.frames) {
      frameT = Math.floor((timer / 60) * s.fps) % s.curAnim.count;
      //???console.log(frameT);
      const frameKey = `${s.name}${s.curAnim.name}${String(frameT).padStart(
        4,
        "0"
      )}`;
      const frameData = s.atlas.frames[frameKey];

      if (frameData) {
        ctx.drawImage(
          s.image,
          frameData.frame.x,
          frameData.frame.y,
          frameData.frame.w,
          frameData.frame.h,
          s.offsetX,
          s.offsetY,
          frameData.frame.w / 2,
          frameData.frame.h / 2
        );
      } else {
        console.error(`Frame key ${frameKey} not found in atlas for ${s.name}`);
      }
    } else {
      ctx.drawImage(
        s.image,
        s.offsetX,
        s.offsetY,
        s.image.width / 2,
        s.image.height / 2
      ); // update thissss
    }
  }

  // Step 3: Draw a filled rectangle
  ctx.fillStyle = "blue"; // Set the fill color
  ctx.fillRect(0, 0, 1920, 100);
  timer++;

  requestAnimationFrame(update);
}

start();
