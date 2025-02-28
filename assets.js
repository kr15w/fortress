/*BEWARE OF BOM ENCODING IN SPRITESHEETSSSS*/

export class Sprite {
  constructor(name, isAnim, offX, offY) {
    this.name = name;
    this.image = new Image();
    this.image.src = `./assets/${this.name}.png`;
    this.atlas = {};
    this.fps = isAnim ? 24 : 1;
    this.anims = {};
    this.curAnim = {};
    this.isVisible = true;
    this.offsetX = offX;
    this.offsetY = offY;

    if (isAnim) {
      this.fetchAtlas(`./assets/${this.name}.json`)
        .then((a) => {
          this.atlas = a;
          console.log(`load atlas of ${this.name}`, this.atlas);

          this.anims = this.loadAnimData(a.frames);
          console.log(`load anims of ${this.name}`, this.anims);
        })
        .catch((e) => console.error(e));
    }
  }

  loadAnimData(frames) {
    const anims = {};
    let isFirst = true;
    let firstA;
    for (let frameKey in frames) {
      const strippedKey = frameKey.replace(new RegExp(`^${this.name}`), "");
      const [animName] = strippedKey.split(/(?=\d)/);

      if (!anims[animName]) {
        anims[animName] = 0;
      }
      anims[animName]++;

      // default anim
      if (isFirst) {
        firstA = animName;
        isFirst = false;
      }
    }
    this.curAnim = { name: firstA, count: anims[`${firstA}`] };
    return anims;
  }
  async fetchAtlas(atlasSrc) {
    try {
      const res = await fetch(atlasSrc);
      if (!res.ok) {
        throw new Error(`fetch atlas fail, status ${response.status}`);
      }
      const d = await res.json();
      return d;
    } catch (e) {
      console.error(e);
    }
  }
  setAnim(animName) {
    console.log("set animation to", animName);
  }
  set setVisible(isV) {
    this.isVisible = isV;
  }
}
