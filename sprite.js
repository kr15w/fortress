/*BEWARE OF BOM ENCODING IN SPRITESHEETSSSS*/

export class Sprite {
  constructor(name, isAnim, x, y, aOffsets, isFlip = false, clickable = true) {
    this.name = name;
    this.image = new Image();
    this.image.src = `./assets/${this.name}.png`;
    this.atlas = {};
    this.fps = isAnim ? 24 : 1;
    this.anims = {}; // {{name: "name", count: 123, offset:{x: 121, y:42322}},...}
    this.animOffsets = aOffsets; // {Enter: { x: 0, y: -116 / RATIO }, Idle: { x: 0, y: 150 / RATIO },Ready: { x: 0, y: 0 }}
    this.curAnim = {}; // {name: "name", count: 123, offset:{x: 121, y:42322}}
    this.isVisible = true;
    this.isFlip = isFlip;
    this.x = x; // position on the canvas
    this.y = y;
    this.isAtlasLoaded = false;
    this.clickable = clickable;

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
    this.isAtlasLoaded = true;
  }

  loadAnimData(frames) {
    const anims = {};
    let isFirst = true;
    let firstA;
    for (let frameKey in frames) {
      const strippedKey = frameKey.replace(new RegExp(`^${this.name}`), "");
      const [animName] = strippedKey.split(/(?=\d)/);

      //console.log("anim:", anims);

      // new anim
      if (!anims[animName]) {
        anims[animName] = {
          count: 0,
          offset: this.animOffsets[animName] || { x: 0, y: 0 },
        };
      }
      anims[animName].count++;

      // default anim
      if (isFirst) {
        firstA = animName;
        isFirst = false;
      }
    }
    this.curAnim = {
      name: firstA,
      count: anims[`${firstA}`].count,
      offset: anims[`${firstA}`].offset,
    };
    return anims;
  }

  async fetchAtlas(atlasSrc) {
    try {
      const res = await fetch(atlasSrc);
      if (!res.ok) {
        throw new Error(`fetch atlas fail, status ${res.status}`);
      }
      const d = await res.json();
      return d;
    } catch (e) {
      console.error(e);
    }
  }

  setAnim(animName) {
    this.curAnim = {
      name: animName,
      count: this.anims[`${animName}`].count,
      offset: this.anims[`${animName}`].offset,
    };
    console.log("set animation to", this.curAnim);
  }

  set setVisible(isV) {
    this.isVisible = isV;
  }

  set setFlip(isF) {
    this.isFlip = isF;
  }

  draw(ctx, timer, ratio) {
    if (!this.isAtlasLoaded) {
      console.warn(`atlas for ${this.name} not loaded yet`);
      return;
    }

    if (this.isVisible === false) {
      console.log(`sprite ${this.name} is not visible`);
      return;
    }

    ctx.save(); // Save the current state

    if (this.name === "lobby_table") {
      ctx.translate(this.x, this.y);
      ctx.scale(0.859, 1);
      ctx.translate(-this.x, -this.y);
    }

    if (this.isFlip) {
      ctx.scale(-1, 1);
    }

    if (this.fps > 1 && this.atlas.frames) {
      let frameT = Math.floor((timer / 60) * this.fps) % this.curAnim.count;
      const frameKey =
        this.name + this.curAnim.name + String(frameT).padStart(4, "0");
      const frame = this.atlas.frames[frameKey];
      ///////////**************/ */
      //console.log("offset of", this.name, this.curAnim, this.curAnim);
      //console.log(frame.spriteSourceSize);
      if (frame) {
        //console.log(frame.frame.x, this.curAnim.offset.x);
        //for animated sprites
        ctx.drawImage(
          this.image,
          frame.frame.x,
          frame.frame.y,
          frame.frame.w,
          frame.frame.h,
          (this.x + this.curAnim.offset.x) * (this.isFlip ? -1 : 1),
          this.y + this.curAnim.offset.y,
          frame.frame.w / ratio,
          frame.frame.h / ratio
        );
      }
    } else {
      //console.log("sdfljksdfjkl");
      ctx.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        this.isFlip ? this.x - this.image.width / ratio : this.x,
        this.y,
        this.image.width / ratio,
        this.image.height / ratio
      );
    }

    ctx.restore();
  }

  isPointInside(x, y, ratio) {
    const width = this.image.width / ratio;
    const height = this.image.height / ratio;
    const spriteX = this.isFlip ? this.x - width : this.x;
    return (
      x >= spriteX &&
      x <= spriteX + width &&
      y >= this.y &&
      y <= this.y + height
    );
  }

  handleClick() {
    if (this.clickable) {
      //console.log(`sprite ${this.name} clicked`);
      this.setAnim("Ready");
    }
  }
}
