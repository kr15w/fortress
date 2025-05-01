import Phaser from "phaser";
export function loadAnims(anims, deez) {
  /**
   * @param anims The object of arrays of objects lol
   * @param deez just put "this" in here
   */
  for (let s in anims) {
    //console.log("loading anims of " + s);
    for (let a in anims[s]) {
      //console.log(anims[s][a]);
      console.log("anim key:" + s + "_" + anims[s][a].key);
      deez.anims.create({
        key: s + "_" + anims[s][a].key,
        frames: deez.anims.generateFrameNames(s, {
          prefix: s,
          start: anims[s][a].start,
          end: anims[s][a].end,
          zeroPad: 4,
        }),
        repeat: anims[s][a].repeat,
      });
    }
  }
}
