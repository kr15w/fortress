/*BEWARE OF BOM ENCODING IN SPRITESHEETSSSS*/

export class Sprite {
  constructor(name, isAnim, offX, offY, isFlip = false) {
    this.name = name;
    this.image = new Image();
    this.image.src = `./assets/${this.name}.png`;
    this.atlas = {};
    this.fps = isAnim ? 24 : 1;
    this.anims = {};
    this.curAnim = {};
    this.isVisible = true;
    this.isFlip = isFlip;
    this.offsetX = offX;
    this.offsetY = offY;
    this.isAtlasLoaded = false;

    if (isAnim) {
      this.fetchAtlas(`./assets/${this.name}.json`)
        .then((a) => {
          this.atlas = a;
          console.log(`load atlas of ${this.name}`, this.atlas);

          this.anims = this.loadAnimData(a.frames);
          console.log(`load anims of ${this.name}`, this.anims);

          //ready to draw
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
        throw new Error(`fetch atlas fail, status ${res.status}`);
      }
      const d = await res.json();
      return d;
    } catch (e) {
      console.error(e);
    }
  }

  setAnim(animName) {
    this.curAnim = { name: animName, count: this.anims[`${animName}`] };
    console.log("set animation to", animName);
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
      ctx.translate(this.offsetX, this.offsetY); // Move the origin to the sprite's position
      ctx.scale(0.859, 1); // Scale horizontally by 86%
      ctx.translate(-this.offsetX, -this.offsetY); // Move the origin back
    }

    if (this.isFlip) {
      ctx.scale(-1, 1);
    }

    if (this.fps > 1 && this.atlas.frames) {
      let frameT = Math.floor((timer / 60) * this.fps) % this.curAnim.count;
      const frameKey =
        this.name + this.curAnim.name + String(frameT).padStart(4, "0");
      const frame = this.atlas.frames[frameKey];

      if (frame) {
        ctx.drawImage(
          this.image,
          frame.frame.x,
          frame.frame.y,
          frame.frame.w,
          frame.frame.h,
          this.offsetX * (this.isFlip ? -1 : 1),
          this.offsetY,
          frame.frame.w / ratio,
          frame.frame.h / ratio
        );
      }
    } else {
      console.log("sdfljksdfjkl");
      ctx.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        this.isFlip ? this.offsetX - this.image.width / ratio : this.offsetX,
        this.offsetY,
        this.image.width / ratio,
        this.image.height / ratio
      );
    }

    ctx.restore(); // Restore the state
  }
}
