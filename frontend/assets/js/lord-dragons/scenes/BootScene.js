import { ENEMY_TYPES, ITEMS } from "../content.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.setPath("/");
  }

  create() {
    this.createPixelTextures();
    this.scene.start("WorldScene");
  }

  createPixelTextures() {
    const make = (key, draw, width = 48, height = 48) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      draw(graphics);
      graphics.generateTexture(key, width, height);
      graphics.destroy();
    };

    [
      ["tile-grass", drawGrassTile],
      ["tile-dirt", drawDirtTile],
      ["tile-stone", drawStoneTile],
      ["tile-water", drawWaterTile],
      ["tile-wood", drawWoodTile],
      ["tile-wall", drawWallTile],
      ["tile-roof", drawRoofTile],
      ["tile-tree", drawTreeTile],
      ["tile-bush", drawBushTile],
      ["tile-rock", drawRockTile],
      ["tile-sign", drawSignTile],
      ["tile-pot", drawPotTile],
      ["tile-door", drawDoorTile],
      ["tile-flower", drawFlowerTile]
    ].forEach(([key, draw]) => make(key, draw, 32, 32));

    const rydenStates = ["idle", "walk", "run", "attack", "hurt", "dodge", "cast"];
    const directions = ["front", "back", "left", "right"];
    rydenStates.forEach((state) => {
      directions.forEach((direction) => {
        make(`ryden-${state}-${direction}`, (g) => drawRyden(g, state, direction, 0));
        make(`ryden-${state}-${direction}-0`, (g) => drawRyden(g, state, direction, 0));
        make(`ryden-${state}-${direction}-1`, (g) => drawRyden(g, state, direction, 1));
      });
    });
    make("ryden", (g) => drawRyden(g, "idle", "front"));
    make("ryden-idle", (g) => drawRyden(g, "idle", "front"));
    make("ryden-walk", (g) => drawRyden(g, "walk", "front"));
    make("ryden-run", (g) => drawRyden(g, "run", "front"));
    make("ryden-attack", (g) => drawRyden(g, "attack", "front"));
    make("ryden-hurt", (g) => drawRyden(g, "hurt", "front"));
    make("ryden-dodge", (g) => drawRyden(g, "dodge", "front"));
    make("ryden-cast", (g) => drawRyden(g, "cast", "front"));

    directions.forEach((direction) => make(`altheron-idle-${direction}`, (g) => drawAltheron(g, direction)));
    make("altheron", (g) => drawAltheron(g, "front"));
    make("npc", (g) => drawVillager(g, "front"));

    make("sword", (g) => {
      g.fillStyle(0x8a5626).fillRect(21, 34, 8, 4);
      g.fillStyle(0x5a321d).fillRect(23, 37, 4, 8);
      g.fillStyle(0xb8c7d1).fillRect(23, 7, 3, 27);
      g.fillStyle(0xf8ffff).fillRect(26, 8, 2, 24);
      g.fillStyle(0x6d8493).fillRect(21, 11, 2, 20);
      g.fillStyle(0xe8d28b).fillRect(19, 32, 12, 3);
    }, 48, 48);

    make("slash", (g) => {
      g.fillStyle(0xfff0bc).fillTriangle(4, 27, 43, 8, 36, 21);
      g.fillStyle(0xef6a35).fillTriangle(9, 35, 43, 10, 37, 29);
      g.fillStyle(0xffffff).fillTriangle(13, 24, 36, 12, 31, 18);
    }, 48, 48);

    make("spark", (g) => {
      g.fillStyle(0xffe08a).fillRect(22, 4, 4, 40).fillRect(4, 22, 40, 4);
      g.fillStyle(0xef6a35).fillRect(16, 16, 16, 16);
      g.fillStyle(0xffffff).fillRect(21, 21, 6, 6);
    }, 48, 48);

    make("chest", (g) => {
      g.fillStyle(0x2d1a12).fillRect(8, 23, 32, 17);
      g.fillStyle(0x6e3f20).fillRect(10, 21, 28, 17);
      g.fillStyle(0xd0a54d).fillRect(9, 17, 30, 7).fillRect(22, 24, 5, 9);
      g.fillStyle(0x3d2415).fillRect(12, 30, 9, 4).fillRect(29, 30, 7, 4);
    });

    make("drop", (g) => {
      g.fillStyle(0xe2c56a).fillRect(18, 12, 13, 21);
      g.fillStyle(0xffffff).fillRect(22, 15, 4, 4);
      g.fillStyle(0x8a6b27).fillRect(20, 33, 10, 4);
    });

    make("discovery", (g) => {
      g.fillStyle(0x2b1a11).fillRect(19, 20, 10, 18);
      g.fillStyle(0xf2c86b).fillRect(15, 10, 18, 11);
      g.fillStyle(0xfff0bc).fillRect(20, 13, 8, 4);
      g.fillStyle(0xef6a35).fillRect(23, 3, 3, 8).fillRect(23, 36, 3, 8);
    });

    Object.entries(ENEMY_TYPES).forEach(([key, enemy]) => {
      make(`enemy-${key}`, (g) => drawEnemy(g, enemy), 40, 40);
    });

    Object.entries(ITEMS).forEach(([key]) => {
      make(`item-${key}`, (g) => {
        g.fillStyle(0x141a21).fillRect(10, 10, 28, 28);
        g.fillStyle(0x2b3440).fillRect(12, 12, 24, 24);
        g.fillStyle(0xf0c35b).fillRect(18, 18, 12, 12);
        g.fillStyle(0xffffff).fillRect(21, 20, 4, 4);
      });
    });
  }
}

function drawGrassTile(g) {
  g.fillStyle(0x172d24).fillRect(0, 0, 32, 32);
  g.fillStyle(0x263f33).fillRect(2, 5, 3, 4).fillRect(14, 22, 3, 4).fillRect(25, 11, 3, 4);
  g.fillStyle(0x0b1613).fillRect(8, 17, 5, 2).fillRect(20, 26, 6, 2);
}

function drawDirtTile(g) {
  g.fillStyle(0x3a281d).fillRect(0, 0, 32, 32);
  g.fillStyle(0x5b4631).fillRect(4, 8, 7, 3).fillRect(18, 20, 9, 3);
  g.fillStyle(0x150f0c).fillRect(2, 25, 5, 2).fillRect(21, 6, 6, 2);
}

function drawStoneTile(g) {
  g.fillStyle(0x272622).fillRect(0, 0, 32, 32);
  g.fillStyle(0x48433c).fillRect(2, 2, 12, 10).fillRect(17, 3, 12, 8).fillRect(7, 17, 14, 10);
  g.fillStyle(0x0e0c0b).fillRect(0, 13, 32, 2).fillRect(15, 0, 2, 32).fillRect(0, 28, 32, 2);
}

function drawWaterTile(g) {
  g.fillStyle(0x0b2730).fillRect(0, 0, 32, 32);
  g.fillStyle(0x2b5961).fillRect(3, 8, 12, 2).fillRect(17, 18, 10, 2).fillRect(8, 26, 15, 2);
  g.fillStyle(0x06141a).fillRect(0, 30, 32, 2);
}

function drawWoodTile(g) {
  g.fillStyle(0x3d2517).fillRect(0, 0, 32, 32);
  for (let y = 5; y < 32; y += 8) g.fillStyle(0x6b4428).fillRect(0, y, 32, 2);
  g.fillStyle(0x22130d).fillRect(8, 0, 2, 32).fillRect(23, 0, 2, 32);
}

function drawWallTile(g) {
  g.fillStyle(0x2a1a12).fillRect(0, 0, 32, 32);
  g.fillStyle(0x5b3822).fillRect(2, 3, 28, 25);
  g.fillStyle(0x21120b).fillRect(0, 28, 32, 4).fillRect(0, 0, 32, 3);
}

function drawRoofTile(g) {
  g.fillStyle(0x1a0b18).fillRect(0, 0, 32, 32);
  g.fillStyle(0x3d1d39).fillTriangle(16, 2, 2, 27, 30, 27);
  g.fillStyle(0x150914).fillRect(0, 27, 32, 5);
}

function drawTreeTile(g) {
  g.fillStyle(0x000000, 0.44).fillEllipse(16, 26, 22, 7);
  g.fillStyle(0x2d1c12).fillRect(13, 15, 6, 13);
  g.fillStyle(0x0f2d24).fillTriangle(16, 2, 3, 18, 29, 18);
  g.fillStyle(0x1f4b3b).fillTriangle(16, 0, 7, 12, 25, 12);
}

function drawBushTile(g) {
  g.fillStyle(0x08140f).fillRect(4, 16, 24, 10);
  g.fillStyle(0x193b2b).fillCircle(10, 15, 7).fillCircle(20, 15, 8).fillCircle(16, 10, 7);
}

function drawRockTile(g) {
  g.fillStyle(0x000000, 0.24).fillEllipse(16, 24, 22, 7);
  g.fillStyle(0x6d6d66).fillRect(8, 11, 17, 12);
  g.fillStyle(0x94948a).fillRect(10, 9, 9, 5);
  g.fillStyle(0x3a3a35).fillRect(20, 17, 5, 5);
}

function drawSignTile(g) {
  g.fillStyle(0x4a2b18).fillRect(14, 16, 4, 14);
  g.fillStyle(0x7a4b28).fillRect(5, 7, 22, 12);
  g.fillStyle(0xe7c75f).fillRect(8, 10, 16, 2).fillRect(8, 14, 10, 2);
}

function drawPotTile(g) {
  g.fillStyle(0x000000, 0.22).fillEllipse(16, 25, 18, 6);
  g.fillStyle(0x9a5a2e).fillRect(10, 10, 12, 14);
  g.fillStyle(0xd18a46).fillRect(8, 8, 16, 5);
  g.fillStyle(0x5b2e19).fillRect(11, 20, 10, 4);
}

function drawDoorTile(g) {
  g.fillStyle(0x1a0e08).fillRect(4, 0, 24, 32);
  g.fillStyle(0x6e3f20).fillRect(7, 5, 18, 27);
  g.fillStyle(0xe4b65a).fillRect(21, 18, 3, 3);
}

function drawFlowerTile(g) {
  g.fillStyle(0x172d24).fillRect(0, 0, 32, 32);
  g.fillStyle(0x9d8248).fillRect(9, 10, 3, 3).fillRect(20, 20, 3, 3);
  g.fillStyle(0x7b2638).fillRect(12, 13, 3, 3).fillRect(23, 11, 3, 3);
}

function drawRyden(g, state, direction, phase = 0) {
  const skin = state === "hurt" ? 0x8b4d3e : 0x9b5f3d;
  const tunic = state === "hurt" ? 0x4d2225 : 0x142f3c;
  const trim = 0xd7b46a;
  const boot = 0x241b1a;
  const hair = 0xd44825;
  const gold = 0xf1c84f;
  const stepDirection = phase === 0 ? 1 : -1;
  const step = state === "walk" ? 2 * stepDirection : state === "run" ? 4 * stepDirection : 0;
  const attackArm = state === "attack" ? (phase === 0 ? -5 : -8) : 0;
  const castGlow = state === "cast";

  g.fillStyle(0x000000, 0.24).fillEllipse(24, 42, 30, 8);

  if (direction === "back") {
    g.fillStyle(boot).fillRect(15, 35 - step, 6, 8 + step).fillRect(27, 35 + step, 6, 8);
    g.fillStyle(tunic).fillRect(14, 19, 20, 18);
    g.fillStyle(trim).fillRect(16, 20, 16, 2).fillRect(23, 22, 3, 14);
    g.fillStyle(skin).fillRect(10, 20, 5, 14).fillRect(33, 20, 5, 14);
    g.fillStyle(hair).fillRect(13, 7, 22, 15).fillRect(16, 4, 17, 7);
    g.fillStyle(0x6b2b18).fillRect(18, 18, 12, 4);
    drawBackScabbard(g);
    return;
  }

  if (direction === "left" || direction === "right") {
    const faceX = direction === "left" ? 15 : 18;
    const armFrontX = direction === "left" ? 9 : 34;
    const armBackX = direction === "left" ? 32 : 9;
    g.fillStyle(boot).fillRect(17, 35 - step, 6, 8 + step).fillRect(26, 35 + step, 6, 8);
    g.fillStyle(tunic).fillRect(15, 19, 18, 18);
    g.fillStyle(trim).fillRect(16, 21, 15, 2).fillRect(22, 22, 3, 13);
    g.fillStyle(skin).fillRect(armBackX, 21, 5, 12).fillRect(armFrontX, 21 + attackArm, 5, 14);
    g.fillStyle(skin).fillRect(faceX, 8, 15, 12);
    g.fillStyle(hair).fillRect(faceX - 2, 5, 17, 7).fillRect(faceX - 1, 10, 9, 5);
    g.fillStyle(gold).fillRect(direction === "left" ? 17 : 27, 13, 3, 3);
    drawBackScabbard(g, direction);
    if (castGlow) g.fillStyle(0xef6a35).fillRect(armFrontX - 1, 19, 7, 7);
    return;
  }

  g.fillStyle(boot).fillRect(14, 35 - step, 7, 8 + step).fillRect(27, 35 + step, 7, 8);
  g.fillStyle(tunic).fillRect(13, 19, 22, 18);
  g.fillStyle(trim).fillRect(15, 21, 18, 2).fillRect(23, 23, 3, 12);
  g.fillStyle(skin).fillRect(8, 21 + attackArm, 6, 13).fillRect(34, 21 + attackArm, 6, 13);
  g.fillStyle(skin).fillRect(15, 8, 18, 13);
  g.fillStyle(hair).fillRect(13, 4, 22, 8).fillRect(12, 10, 8, 6).fillRect(29, 10, 7, 5);
  g.fillStyle(gold).fillRect(18, 13, 3, 3).fillRect(27, 13, 3, 3);
  g.fillStyle(0x3a2220).fillRect(21, 18, 7, 2);
  drawBackScabbard(g);
  if (state === "dodge") g.fillStyle(0xb7d9ff, 0.8).fillRect(6, 7, 4, 30);
  if (castGlow) g.fillStyle(0xef6a35).fillRect(7, 18, 8, 8).fillRect(33, 18, 8, 8);
}

function drawBackScabbard(g, direction = "front") {
  const left = direction === "left";
  const right = direction === "right";
  const x = left ? 29 : right ? 13 : 31;
  g.fillStyle(0x4b2c1e).fillRect(x, 10, 4, 25);
  g.fillStyle(0xc7d7dc).fillRect(x + 1, 8, 2, 20);
  g.fillStyle(0xd7b46a).fillRect(x - 2, 27, 8, 3);
}

function drawAltheron(g, direction) {
  const robe = 0x1e3b68;
  const robeDark = 0x081423;
  const skin = 0xb88c67;
  const beard = 0xf3f0df;
  g.fillStyle(0x000000, 0.24).fillEllipse(24, 42, 30, 8);
  g.fillStyle(robeDark).fillRect(13, 34, 22, 8);
  g.fillStyle(robe).fillRect(12, 17, 24, 22);
  g.fillStyle(0x8ca8d8).fillRect(15, 20, 18, 2).fillRect(23, 22, 3, 14);
  g.fillStyle(skin).fillRect(16, 7, 16, 12);
  g.fillStyle(0xf3f0df).fillRect(14, 4, 20, 6);
  if (direction !== "back") {
    g.fillStyle(beard).fillRect(17, 17, 14, 13).fillRect(20, 29, 8, 5);
    g.fillStyle(0xdce8ff).fillRect(19, 12, 3, 2).fillRect(27, 12, 3, 2);
  } else {
    g.fillStyle(beard).fillRect(15, 15, 18, 7);
  }
  const staffX = direction === "left" ? 8 : 37;
  g.fillStyle(0x6c4328).fillRect(staffX, 8, 3, 34);
  g.fillStyle(0x73d7ff).fillRect(staffX - 2, 5, 7, 7);
}

function drawVillager(g) {
  g.fillStyle(0x000000, 0.22).fillEllipse(24, 42, 28, 8);
  g.fillStyle(0xbd8c61).fillRect(16, 8, 16, 13);
  g.fillStyle(0x6e5ab8).fillRect(13, 21, 22, 17);
  g.fillStyle(0x39231a).fillRect(15, 5, 18, 6);
  g.fillStyle(0xf4e7b5).fillRect(19, 13, 3, 3).fillRect(27, 13, 3, 3);
  g.fillStyle(0x231819).fillRect(14, 38, 7, 5).fillRect(28, 38, 7, 5);
}

function drawEnemy(g, enemy) {
  g.fillStyle(0x000000, 0.42).fillEllipse(20, 34, enemy.boss ? 34 : 27, 9);
  g.fillStyle(0x11090a).fillRect(7, enemy.boss ? 4 : 9, enemy.boss ? 27 : 23, enemy.boss ? 29 : 22);
  g.fillStyle(enemy.color).fillRect(9, enemy.boss ? 6 : 11, enemy.boss ? 23 : 19, enemy.boss ? 25 : 18);
  g.fillStyle(0xff3a2d).fillRect(13, 16, 3, 3).fillRect(24, 16, 3, 3);
  g.fillStyle(0x050202).fillRect(15, 25, 10, 3);
  g.fillStyle(0xe8e0c9).fillTriangle(16, 28, 19, 32, 21, 28).fillTriangle(22, 28, 25, 32, 27, 28);
  if (enemy.boss) {
    g.fillStyle(0xb08a4a).fillTriangle(8, 6, 14, 0, 18, 9).fillTriangle(31, 6, 25, 0, 21, 9);
    g.fillStyle(0x6b1119).fillRect(11, 29, 19, 4);
  }
}
