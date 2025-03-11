const offsets = [
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
export default offsets;
