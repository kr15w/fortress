export class InputHandler {
  constructor() {
    this.lastKey = "";

    document.addEventListener("keydown", (event) => {
      if (event.key === "z") {
        this.lastKey = "z";
      }
    });
  }
}
