import { bgImage, playerSprite } from "./assets.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 1920);
const CANVAS_HEIGHT = (canvas.height = 1080);

let timer = 0;
let frameT = 0;
function animate() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.drawImage(bgImage, -244, -197);
  ctx.drawImage(
    playerSprite,
    playerSprite.atlas.frames[
      `${playerSprite.name + playerSprite.curAnim + frameT}`
    ].frame.x,
    playerSprite.atlas.frames[
      `${playerSprite.name + playerSprite.curAnim + frameT}`
    ].frame.y,
    playerSprite.atlas.frames[
      `${playerSprite.name + playerSprite.curAnim + frameT}`
    ].frame.w,
    playerSprite.atlas.frames[
      `${playerSprite.name + playerSprite.curAnim + frameT}`
    ].frame.h,
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
  timer++;
  frameT = Math.floor((timer / 60) * playerSprite.fps) % 8;
  //console.log("frame timer:", frameT);
  requestAnimationFrame(animate);
}
animate();
