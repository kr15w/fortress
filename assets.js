/*BEWARE OF BOM ENCODING IN SPRITESHEETSSSS*/

class Sprite {
  constructor(name, imgSrc, anims) {
    this.name = name;
    this.image = new Image();
    this.image.src = imgSrc;
    this.atlas = {};
    this.fps = 24;
    this.anims = {};
    this.curAnim = 0;
    this.isVisible = true;

    this.fetchAtlas(`./assets/${this.name}.json`)
      .then((a) => {
        this.atlas = a;
        console.log(`load atlas of ${this.name}`, this.atlas);

        this.anims = this.loadAnimData(a.frames);
        console.log(`load anims of ${this.name}`, this.anims);
      })
      .catch((e) => console.error(e));
  }

  loadAnimData(frames) {
    const anims = {};

    for (const frameKey in frames) {
      const strippedKey = frameKey.replace(new RegExp(`^${this.name}`), "");
      const [animName] = strippedKey.split(/(?=\d)/);

      if (!anims[animName]) {
        anims[animName] = 0;
      }
      anims[animName]++;
    }

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

export const playerSprite = new Sprite(
  "lobby_player",
  "./assets/lobby_player.png"
);

export const bgImage = new Image();
bgImage.src = "./assets/lobby_bg.png";
