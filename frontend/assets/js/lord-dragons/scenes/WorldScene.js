import { CHESTS, DISCOVERIES, ENEMIES, ENEMY_TYPES, INTERACTIVE_OBJECTS, NPCS, REGIONS, TOWN_FOLK, WORLD_HEIGHT, WORLD_WIDTH } from "../content.js";
import { DynamicMusicDirector } from "../audio.js";

const PLAYER_SPEED = 185;
const RUN_SPEED = 245;
const INTERACT_DISTANCE = 96;
const TILE_SIZE = 32;
const IMPORTANT_DISCOVERIES = new Set(["dragon-mark", "mordrake-echo", "old-waystone", "drakhar-rune", "sealed-mural"]);

export class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
    this.touchVector = new Phaser.Math.Vector2(0, 0);
    this.facingVector = new Phaser.Math.Vector2(1, 0);
    this.attackLocked = false;
    this.invulnerableUntil = 0;
  }

  init(data) {
    this.gameState = data.gameState ?? this.registry.get("gameState") ?? window.lordDragonsRuntime.gameState;
    this.hud = data.hud ?? this.registry.get("hud") ?? window.lordDragonsRuntime.hud;
  }

  create() {
    this.playerAura = null;
    this.backSword = null;
    this.heldSword = null;
    this.playerShadow = null;
    this.cinematicSeen = new Set();
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.solidObjects = this.physics.add.staticGroup();
    this.drawMap();
    this.createActors();
    this.createInteractiveObjects();
    this.createDiscoveries();
    this.createAtmosphere();
    this.createDynamicMusic();
    this.bindInput();
    this.hud.update();
  }

  update(_time, delta) {
    this.gameState.data.dayTick = (this.gameState.data.dayTick + delta / 16.67) % 5400;
    if (this.isGameplayPaused()) {
      this.player?.setVelocity(0, 0);
      this.updateAtmosphere();
      this.updateMiniMap();
      this.hud.update();
      return;
    }
    if (this.attackLockedUntil && this.time.now > this.attackLockedUntil) {
      this.attackLocked = false;
      this.attackLockedUntil = 0;
      if (this.player?.texture.key.includes("ryden-attack")) this.setPlayerTexture("idle");
      this.restoreBackSword();
    }
    this.movePlayer();
    this.updateEnemies(delta);
    this.updateAtmosphere();
    this.updateDynamicMusic();
    this.updateMiniMap();
    this.updateLevelUpFlash();
    this.hud.update();
  }

  drawMap() {
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0x030505);
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH - 42, WORLD_HEIGHT - 42, 0x101a16, 0.58).setStrokeStyle(5, 0x060303);
    this.drawTileGround();
    REGIONS.forEach((region) => {
      this.drawRegion(region);
    });
    this.drawDragonValleySetpieces();
    this.addBlocker(WORLD_WIDTH / 2, -8, WORLD_WIDTH, 16);
    this.addBlocker(WORLD_WIDTH / 2, WORLD_HEIGHT + 8, WORLD_WIDTH, 16);
    this.addBlocker(-8, WORLD_HEIGHT / 2, 16, WORLD_HEIGHT);
    this.addBlocker(WORLD_WIDTH + 8, WORLD_HEIGHT / 2, 16, WORLD_HEIGHT);
    this.drawDragonRuins(1330, 650);
    this.drawRuinedCastle(2060, 150);
  }

  drawDragonValleySetpieces() {
    this.add.rectangle(250, 50, 270, 34, 0x0b0705, 0.82).setStrokeStyle(2, 0xa97838).setDepth(24);
    this.add.text(128, 37, "Vale dos Dragoes", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#f3d186",
      stroke: "#120704",
      strokeThickness: 3
    }).setDepth(25);

    this.drawValleyVillage(118, 410);
    this.drawValleyCave(786, 646);
    this.drawRuinedCastle(938, 72);
  }

  drawValleyVillage(x, y) {
    this.add.rectangle(x + 72, y + 36, 180, 116, 0x1c1510, 0.52).setStrokeStyle(2, 0x5b3c28).setDepth(4);
    [
      { dx: 0, dy: 0, roof: 0x6e3324 },
      { dx: 92, dy: 26, roof: 0x4b254f },
      { dx: 166, dy: -8, roof: 0x5b3f21 }
    ].forEach((house) => {
      const hx = x + house.dx;
      const hy = y + house.dy;
      this.add.ellipse(hx + 28, hy + 54, 74, 20, 0x040303, 0.32).setDepth(3);
      this.add.rectangle(hx + 28, hy + 38, 58, 44, 0x3b2418).setStrokeStyle(2, 0x140905).setDepth(7);
      this.add.triangle(hx + 28, hy + 2, hx - 10, hy + 26, hx + 66, hy + 26, house.roof).setStrokeStyle(2, 0x1d0d08).setDepth(8);
      this.add.rectangle(hx + 13, hy + 45, 10, 16, 0xf0b95c, 0.78).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      this.add.rectangle(hx + 40, hy + 47, 12, 20, 0x100807).setDepth(9);
      this.addBlocker(hx + 28, hy + 42, 68, 54);
    });
    this.add.circle(x + 94, y + 104, 22, 0x284c51, 0.8).setStrokeStyle(3, 0x8f6734).setDepth(8);
    this.add.circle(x + 94, y + 104, 38, 0x6ca4b5, 0.08).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
  }

  drawValleyCave(x, y) {
    this.add.ellipse(x, y + 42, 190, 92, 0x050303, 0.48).setDepth(4);
    this.add.ellipse(x, y, 178, 134, 0x171211, 0.92).setStrokeStyle(5, 0x524030).setDepth(6);
    this.add.ellipse(x, y + 24, 96, 72, 0x020102, 0.96).setDepth(8);
    this.add.arc(x, y + 26, 112, 190, 350, false, 0x2d2119, 0.7).setStrokeStyle(8, 0x6a4a32, 0.86).setDepth(9);
    for (let index = 0; index < 7; index += 1) {
      this.add.triangle(x - 62 + index * 20, y - 32, x - 72 + index * 20, y + 20, x - 52 + index * 20, y + 20, 0x0a0808, 0.9).setDepth(10);
    }
    this.add.text(x - 56, y + 82, "Caverna Antiga", { fontSize: "13px", color: "#f0d7a0", backgroundColor: "#0b0705" }).setDepth(25);
    this.addBlocker(x, y + 18, 116, 82);
  }

  drawTileGround() {
    for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
      for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
        const key = (x + y) % 224 === 0 ? "tile-flower" : "tile-grass";
        this.add.image(x, y, key).setOrigin(0).setDepth(0);
      }
    }
    this.drawTilePatch(880, 360, 10, 5, "tile-stone", 2);
    this.drawTilePatch(1540, 140, 16, 16, "tile-stone", 2);
    this.drawTilePatch(2040, 250, 10, 10, "tile-stone", 2);
    this.drawTilePatch(1052, 868, 22, 13, "tile-stone", 2);
    this.drawTilePatch(2020, 760, 10, 9, "tile-dirt", 1);
    this.drawTilePatch(94, 120, 10, 7, "tile-wood", 3);
    this.drawTilePatch(460, 126, 12, 14, "tile-grass", 1);
    this.drawTilePatch(1210, 345, 9, 5, "tile-dirt", 1);
    this.drawWaterRibbon();
  }

  drawTilePatch(x, y, columns, rows, key, depth) {
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        this.add.image(x + column * TILE_SIZE, y + row * TILE_SIZE, key).setOrigin(0).setDepth(depth);
      }
    }
  }

  drawWaterRibbon() {
    for (let index = 0; index < 22; index += 1) {
      const x = 1180 + index * TILE_SIZE;
      const y = 555 + Math.sin(index * 0.7) * 28;
      this.add.image(x, y, "tile-water").setOrigin(0).setDepth(1);
      this.add.image(x, y + TILE_SIZE, "tile-water").setOrigin(0).setDepth(1);
      this.addBlocker(x + TILE_SIZE, y + TILE_SIZE, TILE_SIZE * 2, TILE_SIZE * 2);
    }
  }

  drawRoad() {
    const points = [
      [185, 235],
      [440, 276],
      [650, 330],
      [880, 392],
      [1110, 430],
      [1350, 430],
      [1700, 420],
      [2140, 430]
    ];
    for (let index = 0; index < points.length - 1; index += 1) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[index + 1];
      const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
      const steps = Math.max(1, Math.floor(distance / 28));
      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        const x = Phaser.Math.Linear(x1, x2, t);
        const y = Phaser.Math.Linear(y1, y2, t) + Math.sin((index + step) * 0.65) * 5;
        this.add.image(x - 16, y - 16, "tile-dirt").setOrigin(0).setDepth(2).setAlpha(0.68);
        if (step % 3 === 0) this.add.image(x + 3, y - 10, "tile-stone").setOrigin(0).setScale(0.55).setDepth(3).setAlpha(0.54);
      }
    }
  }

  drawRegion(region) {
    const darkColor = darkenColor(region.color, region.id === "valoria" || region.id === "academy" ? 0.48 : 0.36);
    this.add.rectangle(region.x + region.w / 2, region.y + region.h / 2, region.w, region.h, 0x030202, 0.62).setDepth(1);
    this.add.rectangle(region.x + region.w / 2, region.y + region.h / 2, region.w - 8, region.h - 8, darkColor, 0.78).setStrokeStyle(4, 0x090404).setDepth(2);
    this.add.rectangle(region.x + 86, region.y + 21, 144, 25, 0x120a07, 0.9).setStrokeStyle(1, 0xb58142).setDepth(22);
    this.add.text(region.x + 14, region.y + 12, region.name, { fontFamily: "Georgia", fontSize: "18px", color: "#f6d78e", backgroundColor: "transparent", stroke: "#120704", strokeThickness: 3 }).setDepth(23);

    if (region.id === "forest") this.drawForest(region);
    if (region.id === "valoria") this.drawCity(region, 0xb26b36, 0xe5b760);
    if (region.id === "academy") this.drawCity(region, 0x6b3146, 0xd6b36d);
    if (region.id === "camp") this.drawCamp(region);
    if (region.id === "underworld-gate") this.drawDemonic(region);
    if (region.id === "wizard-house") this.drawWizardHouse(region);
    if (region.id === "bridge") this.drawDragonRuins(region.x + 70, region.y + 86);
    if (region.id === "drakhar-ruins") this.drawDrakharDungeon(region);
  }

  drawForest(region) {
    this.add.ellipse(region.x + 240, region.y + 310, 500, 92, 0x07120f, 0.62).setDepth(3).setRotation(-0.18);
    for (let index = 0; index < 70; index += 1) {
      const x = region.x + 28 + (index * 73) % (region.w - 46);
      const y = region.y + 62 + (index * 47) % (region.h - 86);
      this.add.ellipse(x + 5, y + 16, 30, 12, 0x06100d, 0.38).setDepth(1);
      this.add.image(x - 16, y - 26, "tile-tree").setOrigin(0).setScale(1.35).setDepth(5).setTint(0x5f7564);
      if (index % 2 === 0) this.addBlocker(x, y + 4, 28, 32);
    }
    this.add.circle(region.x + 286, region.y + 142, 18, 0x8aa6b4, 0.26).setDepth(6);
    this.add.circle(region.x + 286, region.y + 142, 42, 0x8aa6b4, 0.08).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
    this.drawDarkCanopy(region);
  }

  drawCity(region, wallColor, roofColor) {
    this.add.rectangle(region.x + region.w / 2, region.y + region.h / 2, region.w - 46, region.h - 52, 0x3a332b, 0.34).setDepth(3);
    for (let sx = region.x + 70; sx < region.x + region.w - 50; sx += 42) {
      for (let sy = region.y + 88; sy < region.y + region.h - 46; sy += 38) {
        if ((sx + sy) % 3 === 0) this.add.rectangle(sx, sy, 18, 12, 0x5c5145, 0.38).setDepth(4).setRotation((sx % 5) * 0.04);
      }
    }
    for (let index = 0; index < 14; index += 1) {
      const x = region.x + 58 + (index * 92) % (region.w - 96);
      const y = region.y + 92 + Math.floor(index / 4) * 118;
      this.add.ellipse(x + 18, y + 42, 78, 18, 0x070606, 0.32).setDepth(2);
      this.add.rectangle(x, y + 26, 62, 50, wallColor).setStrokeStyle(3, 0x2d1a12).setDepth(6);
      this.add.triangle(x, y - 20, x - 42, y + 12, x + 42, y + 12, roofColor).setStrokeStyle(2, 0x4a2416).setDepth(7);
      this.add.rectangle(x - 14, y + 32, 10, 16, 0xffd77b, 0.78).setDepth(8);
      this.add.rectangle(x + 15, y + 32, 10, 16, 0xffd77b, 0.78).setDepth(8);
      this.addBlocker(x, y + 24, 70, 62);
    }
    if (region.id === "valoria") this.drawValoriaFountain(region.x + 210, region.y + 185);
  }

  drawValoriaFountain(x, y) {
    this.add.circle(x, y + 18, 48, 0x1a1210, 0.38).setDepth(7);
    this.add.circle(x, y, 36, 0x314e5a).setStrokeStyle(4, 0xb58b51).setDepth(9);
    this.add.circle(x, y, 21, 0x61a8bf, 0.72).setDepth(10);
    this.add.rectangle(x - 4, y - 32, 8, 38, 0xd8c08a).setDepth(11);
    this.add.circle(x, y - 36, 9, 0x87d8ee, 0.82).setDepth(12);
    this.add.circle(x, y - 36, 30, 0x87d8ee, 0.12).setDepth(8).setBlendMode(Phaser.BlendModes.ADD);
  }

  drawCamp(region) {
    for (let index = 0; index < 6; index += 1) {
      const x = region.x + 70 + index * 48;
      const y = region.y + 170 + (index % 2) * 44;
      this.add.triangle(x, y - 28, x - 28, y + 24, x + 28, y + 24, 0x8a573a).setStrokeStyle(2, 0x2a1a12).setDepth(4);
    }
    this.add.circle(region.x + 185, region.y + 142, 18, 0xf17c35, 0.88).setDepth(5);
  }

  drawDemonic(region) {
    this.add.circle(region.x + region.w / 2, region.y + region.h / 2, 94, 0x8b1d2b, 0.38).setDepth(2);
    for (let index = 0; index < 10; index += 1) {
      const x = region.x + 34 + index * 28;
      this.add.triangle(x, region.y + region.h - 20, x - 18, region.y + region.h + 44, x + 18, region.y + region.h + 44, 0x080608).setDepth(4);
    }
    this.drawCaveDepths(region);
  }

  drawDarkCanopy(region) {
    for (let index = 0; index < 18; index += 1) {
      const x = region.x + 12 + (index * 67) % region.w;
      const y = region.y + 34 + (index * 53) % region.h;
      this.add.circle(x, y, 54, 0x020706, 0.3).setDepth(7);
    }
  }

  drawDragonRuins(x, y) {
    for (let index = 0; index < 7; index += 1) {
      const px = x + index * 34;
      const height = 36 + (index % 3) * 16;
      this.add.rectangle(px, y - height / 2, 18, height, 0x171313, 0.92).setStrokeStyle(2, 0x40352a).setDepth(6);
      this.add.rectangle(px + 3, y - height + 8, 8, 5, 0x8c1d23, 0.55).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
    }
    this.add.arc(x + 118, y - 34, 74, 190, 338, false, 0x251b17, 0.7).setStrokeStyle(8, 0x524030, 0.86).setDepth(6);
    this.add.circle(x + 110, y - 36, 26, 0x7a1b23, 0.12).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
  }

  drawRuinedCastle(x, y) {
    this.add.rectangle(x + 80, y + 72, 210, 118, 0x1a1718, 0.88).setStrokeStyle(4, 0x403427).setDepth(5);
    [0, 58, 132, 190].forEach((offset, index) => {
      this.add.rectangle(x + offset, y + 46 - index * 5, 32, 120 + index * 12, 0x161315, 0.92).setStrokeStyle(3, 0x4a3b2e).setDepth(6);
      this.add.triangle(x + offset, y - 28 - index * 5, x + offset - 23, y + 16, x + offset + 23, y + 16, 0x211114).setDepth(7);
    });
    this.add.rectangle(x + 80, y + 104, 48, 74, 0x050303, 0.95).setDepth(8);
    this.add.circle(x + 80, y + 88, 24, 0x050303, 0.95).setDepth(8);
  }

  drawCaveDepths(region) {
    this.add.ellipse(region.x + region.w / 2, region.y + region.h / 2 + 30, 190, 122, 0x020102, 0.92).setDepth(5);
    this.add.ellipse(region.x + region.w / 2, region.y + region.h / 2 + 30, 126, 74, 0x0b0508, 0.96).setDepth(6);
    for (let index = 0; index < 8; index += 1) {
      const x = region.x + 52 + index * 32;
      this.add.triangle(x, region.y + 60, x - 12, region.y + 128, x + 12, region.y + 128, 0x070506, 0.9).setDepth(7);
    }
  }

  drawDrakharDungeon(region) {
    this.add.rectangle(region.x + region.w / 2, region.y + region.h / 2, region.w - 68, region.h - 72, 0x12100f, 0.9).setStrokeStyle(6, 0x4e3128).setDepth(4);
    this.add.rectangle(region.x + 180, region.y + 236, 260, 88, 0x211916, 0.86).setStrokeStyle(3, 0x6d4b33).setDepth(5);
    this.add.rectangle(region.x + 470, region.y + 236, 280, 88, 0x211916, 0.86).setStrokeStyle(3, 0x6d4b33).setDepth(5);
    this.add.rectangle(region.x + 375, region.y + 118, 112, 250, 0x191313, 0.88).setStrokeStyle(3, 0x6d4b33).setDepth(5);
    for (let index = 0; index < 18; index += 1) {
      const x = region.x + 80 + (index * 71) % (region.w - 130);
      const y = region.y + 92 + (index * 53) % (region.h - 116);
      this.add.rectangle(x, y, 18, 26, 0x2a201c, 0.82).setStrokeStyle(2, 0x594231).setDepth(7);
      if (index % 3 === 0) this.add.rectangle(x + 3, y - 8, 8, 5, 0x8c1d23, 0.58).setDepth(8).setBlendMode(Phaser.BlendModes.ADD);
    }
    [1160, 1215, 1270].forEach((x, index) => {
      this.add.triangle(x, region.y + 242, x - 14, region.y + 284, x + 14, region.y + 284, 0x807462, 0.9).setDepth(9);
      this.add.circle(x, region.y + 268, 18 + index * 6, 0x5d171c, 0.08).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    });
    [1340, 1405, 1470].forEach((x, index) => {
      this.add.circle(x, region.y + 280, 22, index === 1 ? 0xa97838 : 0x3d2a22, 0.92).setStrokeStyle(2, 0x9c7443).setDepth(9);
      this.add.text(x - 7, region.y + 269, String(index + 1), { fontSize: "16px", color: "#f3d28a", stroke: "#130705", strokeThickness: 3 }).setDepth(10);
    });
    this.add.arc(region.x + 606, region.y + 318, 92, 190, 350, false, 0x1f1614, 0.72).setStrokeStyle(10, 0x6a4a32, 0.82).setDepth(8);
    this.add.circle(region.x + 610, region.y + 310, 42, 0x8c1d23, 0.12).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.addBlocker(region.x + 34, region.y + region.h / 2, 32, region.h - 88);
    this.addBlocker(region.x + region.w - 34, region.y + region.h / 2, 32, region.h - 88);
    this.addBlocker(region.x + region.w / 2, region.y + 42, region.w - 80, 32);
    this.addBlocker(region.x + region.w / 2, region.y + region.h - 42, region.w - 80, 32);
    this.addBlocker(region.x + 375, region.y + 236, 70, 132);
  }

  drawWizardHouse(region) {
    const left = region.x + 22;
    const top = region.y + 42;
    const width = region.w - 44;
    const height = region.h - 66;
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    this.add.ellipse(centerX + 18, top + height + 12, width - 18, 26, 0x050303, 0.35).setDepth(2);
    this.add.rectangle(centerX, centerY, width, height, 0x2c1d14).setStrokeStyle(4, 0x130b08).setDepth(4);
    this.add.rectangle(centerX, top + 18, width + 18, 34, 0x51321f).setStrokeStyle(3, 0x1d1009).setDepth(5);
    this.add.triangle(centerX, top - 32, left - 16, top + 30, left + width + 16, top + 30, 0x4b254f).setDepth(6);
    this.add.triangle(centerX, top - 22, left + 18, top + 20, left + width - 18, top + 20, 0x6b3c67).setDepth(7);

    for (let plank = 0; plank < 8; plank += 1) {
      const y = top + 40 + plank * 24;
      this.add.rectangle(centerX, y, width - 24, 2, 0x5c3d25, 0.72).setDepth(6);
    }
    for (let beam = 0; beam < 5; beam += 1) {
      const x = left + 40 + beam * 62;
      this.add.rectangle(x, top + height / 2 + 18, 3, height - 58, 0x1d1009, 0.34).setDepth(6);
    }

    this.drawWizardBed(left + 34, top + 55);
    this.drawWizardDesk(left + 132, top + 132);
    this.drawWizardBookshelf(left + 235, top + 54);
    this.drawWizardBookshelf(left + 282, top + 54);
    this.drawAlchemyTable(left + 238, top + 152);
    this.drawWarmLamp(left + 185, top + 176);
    this.drawScrollPile(left + 94, top + 172);
    this.drawHearth(left + width - 44, top + height - 56);
    this.add.rectangle(left + width - 62, top + height - 8, 40, 10, 0x1a0e08).setDepth(9);
    this.addBlocker(centerX, top + 18, width + 28, 42);
    this.addBlocker(left + 28, centerY, 18, height - 46);
    this.addBlocker(left + width - 28, centerY, 18, height - 46);
    this.addBlocker(centerX, top + height - 10, width - 24, 20);
    this.addBlocker(left + 272, top + 100, 92, 96);
    this.addBlocker(left + 52, top + 92, 82, 72);
  }

  drawWizardBed(x, y) {
    this.add.rectangle(x + 38, y + 38, 76, 58, 0x22140e).setDepth(8);
    this.add.rectangle(x + 40, y + 36, 70, 50, 0x6e3e2a).setDepth(9);
    this.add.rectangle(x + 40, y + 18, 70, 20, 0x2f5f73).setDepth(10);
    this.add.rectangle(x + 18, y + 54, 28, 24, 0xd7b46a).setDepth(10);
    this.add.rectangle(x + 62, y + 55, 28, 23, 0x1a3144).setDepth(10);
  }

  drawWizardDesk(x, y) {
    this.add.rectangle(x + 46, y + 38, 92, 64, 0x2a180d).setDepth(8);
    this.add.rectangle(x + 46, y + 34, 84, 52, 0x704222).setStrokeStyle(2, 0x1b0d07).setDepth(9);
    this.add.rectangle(x + 21, y + 29, 24, 14, 0xe6d9a8).setDepth(10);
    this.add.rectangle(x + 19, y + 30, 3, 12, 0xa35e32).setDepth(11);
    this.add.rectangle(x + 54, y + 31, 20, 15, 0x202737).setDepth(10);
    this.add.rectangle(x + 59, y + 28, 12, 4, 0xd7b46a).setDepth(11);
    this.add.circle(x + 74, y + 52, 7, 0x66c7d8, 0.88).setDepth(10);
    this.add.circle(x + 74, y + 52, 18, 0x66c7d8, 0.12).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
  }

  drawWizardBookshelf(x, y) {
    this.add.rectangle(x + 20, y + 56, 40, 92, 0x1a0e08).setDepth(8);
    this.add.rectangle(x + 20, y + 52, 34, 84, 0x5a321d).setStrokeStyle(2, 0x1b0d07).setDepth(9);
    [0, 22, 44].forEach((row) => {
      this.add.rectangle(x + 20, y + 22 + row, 30, 4, 0x2b160b).setDepth(10);
      [0xe7c75f, 0x6e5ab8, 0x2f8a69, 0x9d3c35].forEach((color, index) => {
        this.add.rectangle(x + 8 + index * 7, y + 11 + row, 5, 13, color).setDepth(11);
      });
    });
  }

  drawAlchemyTable(x, y) {
    this.add.rectangle(x + 42, y + 32, 84, 42, 0x24130b).setDepth(8);
    this.add.rectangle(x + 42, y + 27, 78, 30, 0x684021).setStrokeStyle(2, 0x1b0d07).setDepth(9);
    this.add.circle(x + 16, y + 23, 6, 0x8ef0b2, 0.9).setDepth(10);
    this.add.circle(x + 36, y + 21, 5, 0xf08a35, 0.9).setDepth(10);
    this.add.circle(x + 57, y + 23, 6, 0xa97cff, 0.9).setDepth(10);
    this.add.rectangle(x + 69, y + 17, 12, 18, 0x73d7ff, 0.75).setDepth(10);
    this.add.circle(x + 16, y + 23, 17, 0x8ef0b2, 0.1).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
    this.add.circle(x + 57, y + 23, 17, 0xa97cff, 0.1).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
  }

  drawWarmLamp(x, y) {
    this.add.circle(x, y, 58, 0xffc46b, 0.14).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
    this.add.circle(x, y, 28, 0xffd27a, 0.22).setDepth(8).setBlendMode(Phaser.BlendModes.ADD);
    this.add.rectangle(x - 3, y - 13, 6, 28, 0x7c4b25).setDepth(10);
    this.add.circle(x, y - 18, 9, 0xffd27a, 0.88).setDepth(11);
  }

  drawScrollPile(x, y) {
    this.add.rectangle(x, y, 32, 9, 0xe6d9a8).setDepth(10).setRotation(-0.18);
    this.add.rectangle(x + 18, y + 17, 34, 9, 0xd0bd87).setDepth(10).setRotation(0.14);
    this.add.rectangle(x - 12, y + 17, 18, 14, 0x8a5626).setDepth(9);
    this.add.rectangle(x - 10, y + 12, 14, 4, 0xd7b46a).setDepth(10);
  }

  drawHearth(x, y) {
    this.add.rectangle(x, y + 20, 54, 42, 0x1a0e08).setDepth(8);
    this.add.rectangle(x, y + 18, 44, 30, 0x5a321d).setStrokeStyle(2, 0x100806).setDepth(9);
    this.add.circle(x, y + 20, 32, 0xf08a35, 0.13).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
    this.add.circle(x, y + 20, 15, 0xffb35a, 0.78).setDepth(10);
    this.add.triangle(x, y + 6, x - 9, y + 27, x + 9, y + 27, 0xf05a28).setDepth(11);
    this.add.triangle(x + 4, y + 11, x - 3, y + 27, x + 12, y + 27, 0xffdf7a).setDepth(12);
  }

  createActors() {
    const hero = this.gameState.data.hero;
    this.playerShadow = this.add.ellipse(hero.x, hero.y + 25, 46, 16, 0x000000, 0.36).setDepth(18);
    this.player = this.physics.add.sprite(hero.x, hero.y, "ryden-idle-front").setScale(1.35).setDepth(20).setCollideWorldBounds(true);
    this.player.body.setSize(18, 22).setOffset(15, 20);
    this.physics.add.collider(this.player, this.solidObjects);
    this.setPlayerTexture("idle");
    this.backSword = this.add.sprite(hero.x + 16, hero.y + 2, "sword").setScale(1.05).setDepth(19).setRotation(-0.72);
    this.heldSword = this.add.sprite(hero.x, hero.y, "sword").setScale(1.35).setDepth(45).setVisible(false);
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1);

    this.npcs = NPCS.map((npc) => {
      const texture = npc.id === "altheron" ? "altheron" : "npc";
      const sprite = this.physics.add.staticSprite(npc.x, npc.y, texture).setScale(npc.id === "altheron" ? 1.35 : 1.25).setDepth(12);
      sprite.npc = npc;
      this.physics.add.collider(this.player, sprite);
      this.add.text(npc.x - 34, npc.y - 42, npc.name, { fontSize: "13px", color: "#f4e7b5", backgroundColor: "#11191f" }).setDepth(30);
      return sprite;
    });

    this.townFolk = TOWN_FOLK.map((npc, index) => {
      const sprite = this.physics.add.sprite(npc.x, npc.y, "npc").setScale(1.12).setDepth(12);
      sprite.npc = { ...npc, lines: [`${npc.name}: Valoria anda inquieta. Dizem que sombras antigas voltaram a se mover.`] };
      sprite.patrol = { originX: npc.x, originY: npc.y, offset: index * 600 };
      this.physics.add.collider(this.player, sprite);
      this.add.text(npc.x - 26, npc.y - 36, npc.role, { fontSize: "11px", color: "#ffe2a0", backgroundColor: "#120d0b" }).setDepth(30);
      return sprite;
    });

    this.chests = CHESTS.filter((chest) => !this.gameState.data.openedChests.includes(chest.id)).map((chest) => {
      const sprite = this.physics.add.staticSprite(chest.x, chest.y, "chest").setScale(1.5).setDepth(10);
      sprite.chest = chest;
      return sprite;
    });

    this.enemies = ENEMIES.filter((enemy) => !this.gameState.data.defeatedEnemies.includes(enemyKey(enemy))).map((enemy) => {
      const type = ENEMY_TYPES[enemy.type];
      const sprite = this.physics.add.sprite(enemy.x, enemy.y, `enemy-${enemy.type}`).setScale(type.boss ? (enemy.type === "azgorath" ? 3.3 : 2.5) : 1.6).setDepth(15);
      sprite.enemy = { ...enemy, ...type, id: enemyKey(enemy), hp: type.hp, homeX: enemy.x, homeY: enemy.y, cooldown: 0 };
      sprite.hpBack = this.add.rectangle(enemy.x, enemy.y - 38, type.boss ? 104 : 48, 8, 0x160909).setDepth(35);
      sprite.hpFill = this.add.rectangle(enemy.x, enemy.y - 38, type.boss ? 100 : 44, 4, 0xd9394e).setDepth(36);
      this.physics.add.collider(sprite, this.solidObjects);
      return sprite;
    });
  }

  createInteractiveObjects() {
    this.interactiveObjects = INTERACTIVE_OBJECTS.filter((entry) => !this.gameState.data.usedObjects.includes(entry.id)).map((entry) => {
      const texture = {
        sign: "tile-sign",
        pot: "tile-pot",
        bush: "tile-bush",
        rock: "tile-rock",
        door: "tile-door",
        trap: "tile-rock",
        puzzle: "discovery",
        relic: "discovery"
      }[entry.type] ?? "tile-sign";
      const sprite = this.physics.add.staticSprite(entry.x, entry.y, texture).setScale(entry.type === "door" ? 1.35 : 1.15).setDepth(13);
      sprite.objectData = entry;
      if (["rock", "door", "sign", "trap", "puzzle", "relic"].includes(entry.type)) this.physics.add.collider(this.player, sprite);
      return sprite;
    });
  }

  createDiscoveries() {
    this.discoverySprites = DISCOVERIES.map((discovery) => {
      const found = this.gameState.data.discoveries.includes(discovery.id);
      const glow = this.add.circle(discovery.x, discovery.y, 30, 0xf2c86b, found ? 0.08 : 0.2).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      const sprite = this.physics.add.staticSprite(discovery.x, discovery.y, "discovery").setScale(1.35).setDepth(13).setAlpha(found ? 0.45 : 1);
      sprite.discovery = discovery;
      sprite.glow = glow;
      this.add.text(discovery.x - 42, discovery.y - 42, found ? "Lido" : "Investigar", { fontSize: "11px", color: "#ffe2a0", backgroundColor: "#120d0b" }).setDepth(30).setAlpha(found ? 0.55 : 1);
      return sprite;
    });
  }

  createAtmosphere() {
    this.playerLight = this.add.circle(this.player.x, this.player.y, 112, 0xe6a85a, 0.08).setDepth(17).setBlendMode(Phaser.BlendModes.ADD);
    this.waterReflection = this.add.rectangle(1510, 610, 720, 70, 0x6ca4b5, 0.08).setDepth(4).setBlendMode(Phaser.BlendModes.ADD).setRotation(-0.08);
    this.dayOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x07101c, 0).setOrigin(0).setScrollFactor(0).setDepth(100);
    this.vignette = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.18).setOrigin(0).setScrollFactor(0).setDepth(101);
    this.fireParticles = this.add.particles(0, 0, "drop", {
      x: { min: 0, max: WORLD_WIDTH },
      y: { min: 0, max: WORLD_HEIGHT },
      lifespan: 1600,
      speedY: { min: -18, max: -42 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.32, end: 0 },
      alpha: { start: 0.36, end: 0 },
      tint: [0xf08a35, 0xffcf6b],
      frequency: 180
    }).setDepth(8);
    this.mistParticles = this.add.particles(0, 0, "drop", {
      x: { min: 0, max: WORLD_WIDTH },
      y: { min: 80, max: WORLD_HEIGHT - 80 },
      lifespan: 3600,
      speedY: { min: -4, max: 6 },
      speedX: { min: -18, max: 18 },
      scale: { start: 0.22, end: 0.65 },
      alpha: { start: 0.08, end: 0 },
      tint: [0x91a0a3, 0x3f4c52],
      frequency: 420
    }).setDepth(14);
  }

  createDynamicMusic() {
    this.musicDirector = window.lordDragonsRuntime.musicDirector ?? new DynamicMusicDirector(this.gameState);
    window.lordDragonsRuntime.musicDirector = this.musicDirector;
    this.input.once("pointerdown", () => this.musicDirector.resume());
    this.input.keyboard?.once("keydown", () => this.musicDirector.resume());
    this.updateDynamicMusic();
  }

  bindInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,SHIFT,SPACE,E,Q,F,I,R");
    document.querySelector("#btn-attack").addEventListener("click", () => this.basicAttack());
    document.querySelector("#btn-heavy-attack").addEventListener("click", () => this.heavyAttack());
    document.querySelector("#btn-dodge").addEventListener("click", () => this.dodge());
    document.querySelector("#btn-special").addEventListener("click", () => this.specialAttack());
    document.querySelector("#btn-interact").addEventListener("click", () => this.interact());
    document.querySelector("#btn-inventory").addEventListener("click", () => this.hud.showInventory());
    document.querySelector("#btn-save").addEventListener("click", () => this.manualSave());
    this.bindControlButtons();
    this.bindMobileControls();

    document.querySelectorAll(".touch-pad [data-dir]").forEach((button) => {
      const dir = button.dataset.dir;
      const press = () => this.setTouchDirection(dir);
      const release = () => this.touchVector.set(0, 0);
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    });
  }

  movePlayer() {
    const vector = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.keys.A.isDown) vector.x -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) vector.x += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) vector.y -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) vector.y += 1;
    vector.add(this.touchVector);
    const moving = vector.lengthSq() > 0;
    if (moving) {
      vector.normalize();
      this.facingVector.copy(vector);
    }
    const speed = this.keys.SHIFT.isDown ? RUN_SPEED : PLAYER_SPEED;
    const velocity = vector.clone().scale(speed);
    this.player.setVelocity(this.attackLocked ? 0 : velocity.x, this.attackLocked ? 0 : velocity.y);
    this.updatePlayerAnimation(moving, speed);
    this.gameState.data.hero.x = Math.round(this.player.x);
    this.gameState.data.hero.y = Math.round(this.player.y);

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.basicAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.dodge();
    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) this.specialAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.spinAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) this.hud.showInventory();

    if (this.gameState.getQuest().step === "tutorial_move" && this.player.x > 430) {
      this.gameState.completeTutorialMove();
    }
    if (this.player.x > 2040 && this.player.y > 250) this.gameState.completeStep("reach_academy");
    const region = this.getCurrentRegion();
    if (region?.id === "drakhar-ruins") {
      if (this.gameState.completeStep("enter_drakhar")) {
        this.hud.showStoryPanel("drakharGate");
      }
    }
    this.playerShadow.setPosition(this.player.x, this.player.y + 26);
    this.updateEquippedSword();
    this.updatePlayerAura();
  }

  updateEnemies(delta) {
    this.detectedThreat = null;
    this.enemies.forEach((enemySprite) => {
      const enemy = enemySprite.enemy;
      enemy.cooldown = Math.max(0, enemy.cooldown - delta);
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemySprite.x, enemySprite.y);
      if (distance < 280) {
        this.physics.moveToObject(enemySprite, this.player, enemy.boss ? 82 : 60);
        this.registerThreat(enemy, distance);
      } else {
        this.physics.moveTo(enemySprite, enemy.homeX, enemy.homeY, 35);
      }
      if (distance < 38 && enemy.cooldown <= 0) {
        if (this.time.now >= this.invulnerableUntil) this.takeDamage(Math.max(1, enemy.attack - this.gameState.data.hero.defense));
        enemy.cooldown = 950;
      }
      this.updateEnemyBar(enemySprite);
    });
    this.townFolk?.forEach((folk, index) => {
      const t = this.time.now / 1000 + index;
      folk.setVelocity(Math.cos(t) * 28, Math.sin(t * 0.7) * 18);
    });
  }

  registerThreat(enemy, distance) {
    const baseHp = ENEMY_TYPES[enemy.type].hp;
    const strength = Phaser.Math.Clamp((baseHp + enemy.attack * 8) / 360, 0.18, 1);
    const proximity = Phaser.Math.Clamp(1 - distance / 280, 0.1, 1);
    const intensity = enemy.boss ? 1 : Phaser.Math.Clamp((strength + proximity) / 2, 0.2, 0.86);
    if (!this.detectedThreat || intensity > this.detectedThreat.intensity) {
      this.detectedThreat = {
        enemyType: enemy.type,
        bossType: enemy.boss ? enemy.type : null,
        intensity
      };
    }
    if (enemy.boss) this.showBossCinematic(enemy);
  }

  showBossCinematic(enemy) {
    const key = `boss-${enemy.type}`;
    if (this.cinematicSeen.has(key) || this.gameState.data.bossesDefeated.includes(enemy.type)) return;
    this.cinematicSeen.add(key);
    const bossText = enemy.type === "boost"
      ? {
          title: "Boost",
          speaker: "Lyra",
          art: "Um monstro enorme surge entre as pedras quebradas da Ponte Antiga.",
          lines: [
            "O chao treme antes do rugido.",
            "Boost bloqueia a passagem, coberto por cicatrizes e brasas negras.",
            "Ryden sente as maos aquecerem, mas ainda nao entende por que."
          ]
        }
      : enemy.type === "drakharGuardian"
        ? {
            title: "Guardiao de Drakhar",
            speaker: "Duran",
            art: "Uma armadura vazia ergue uma lamina partida diante do salao das runas.",
            lines: [
              "Nao e uma estatua.",
              "O Guardiao acordou porque alguem mexeu nas runas certas.",
              "Escudo alto. Espada firme. E nao olhe demais para o fogo nos olhos dele."
            ]
          }
        : {
          title: "Azgorath",
          speaker: "Narrador",
          art: "Uma sombra antiga abre os olhos no Portao do Submundo.",
          lines: [
            "O ar fica pesado como ferro queimado.",
            "Azgorath observa Ryden como se reconhecesse uma promessa quebrada.",
            "Nenhum nome antigo e revelado. Apenas o perigo respira diante dele."
          ]
        };
    window.lordDragonsRuntime?.musicDirector?.playStoryCue("mystery");
    this.hud.showCinematicEvent({ ...bossText, mood: enemy.type === "azgorath" ? "azgorath" : "boss" });
  }

  updateEnemyBar(enemySprite) {
    const enemy = enemySprite.enemy;
    if (!enemySprite.hpBack || !enemySprite.hpFill) return;
    const width = enemy.boss ? 100 : 44;
    enemySprite.hpBack.setPosition(enemySprite.x, enemySprite.y - (enemy.boss ? 72 : 38));
    enemySprite.hpFill.setPosition(enemySprite.x, enemySprite.y - (enemy.boss ? 72 : 38));
    enemySprite.hpFill.setScale(Math.max(0, enemy.hp / ENEMY_TYPES[enemy.type].hp), 1);
  }

  updateAtmosphere() {
    if (!this.dayOverlay) return;
    const periodIndex = Math.floor(this.gameState.data.dayTick / 1800) % 3;
    this.dayOverlay.setSize(this.scale.width, this.scale.height);
    this.vignette.setSize(this.scale.width, this.scale.height);
    this.dayOverlay.setAlpha([0.04, 0.16, 0.42][periodIndex]);
    this.playerLight?.setPosition(this.player.x, this.player.y).setAlpha([0.08, 0.12, 0.2][periodIndex]);
    this.waterReflection?.setAlpha(0.06 + Math.sin(this.time.now / 420) * 0.025);
    this.discoverySprites?.forEach((sprite, index) => {
      const pulse = 0.14 + Math.sin(this.time.now / 360 + index) * 0.06;
      sprite.glow.setAlpha(this.gameState.data.discoveries.includes(sprite.discovery.id) ? 0.06 : pulse);
    });
  }

  updateMiniMap() {
    const marker = document.querySelector("#mini-map-player");
    if (!marker || !this.player) return;
    marker.style.left = `${Phaser.Math.Clamp(this.player.x / WORLD_WIDTH * 100, 2, 98)}%`;
    marker.style.top = `${Phaser.Math.Clamp(this.player.y / WORLD_HEIGHT * 100, 2, 98)}%`;
  }

  updateDynamicMusic() {
    if (!this.musicDirector || !this.player) return;
    const region = this.getCurrentRegion();
    this.musicDirector.update({
      regionId: region?.id ?? "wilds",
      location: this.isNearTavern() ? "tavern" : null,
      threat: this.detectedThreat,
      storyMood: null
    });
  }

  updateLevelUpFlash() {
    const flash = this.gameState.data.levelUpFlash;
    if (!flash || flash.at === this.lastLevelUpFlash) return;
    this.lastLevelUpFlash = flash.at;
    const label = this.add.text(this.player.x - 64, this.player.y - 82, `Nivel ${flash.level}!`, {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#ffe08a",
      stroke: "#3d1111",
      strokeThickness: 4
    }).setDepth(70);
    const ring = this.add.circle(this.player.x, this.player.y, 34, 0xf0c66b, 0.24).setDepth(21).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: label, y: label.y - 44, alpha: 0, duration: 1300, onComplete: () => label.destroy() });
    this.tweens.add({ targets: ring, scale: 2.8, alpha: 0, duration: 900, onComplete: () => ring.destroy() });
  }

  getCurrentRegion() {
    return REGIONS.find((region) =>
      this.player.x >= region.x
      && this.player.x <= region.x + region.w
      && this.player.y >= region.y
      && this.player.y <= region.y + region.h
    );
  }

  isNearTavern() {
    const tavern = [...(this.npcs ?? []), ...(this.townFolk ?? [])].find((entry) => entry.npc?.inn || entry.npc?.role === "Taverneiro");
    return Boolean(tavern && Phaser.Math.Distance.Between(this.player.x, this.player.y, tavern.x, tavern.y) < 170);
  }

  updatePlayerAura() {
    const form = this.gameState.data.hero.transformation;
    if (!this.playerAura || !this.playerAura.scene || !this.playerAura.geom) {
      this.playerAura = this.add.circle(this.player.x, this.player.y, 42, 0xef6a35, 0).setDepth(19).setBlendMode(Phaser.BlendModes.ADD);
    }
    const alpha = { human: 0, awakening: 0.16, dragonFlames: 0.3, draconic: 0.38, lordDragons: 0.55 }[form] ?? 0;
    this.playerAura.setPosition(this.player.x, this.player.y).setAlpha(alpha).setRadius(form === "lordDragons" ? 72 : 48);
  }

  isGameplayPaused() {
    return Boolean(this.hud?.dialog?.open && this.hud.dialog.classList.contains("cinematic-event"));
  }

  basicAttack() {
    if (this.attackLocked) return;
    this.playSwordAttack({ damage: this.gameState.data.hero.attack, range: 72, label: "Ataque leve cortou", duration: 210, arc: 72 });
  }

  heavyAttack() {
    const hero = this.gameState.data.hero;
    if (this.attackLocked) return;
    if (hero.power < 18) {
      this.gameState.log("Poder insuficiente para Golpe Forte.");
      return;
    }
    hero.power -= 18;
    this.playSwordAttack({ damage: Math.floor(hero.attack * 1.8), range: 86, label: "Golpe Forte atingiu", duration: 430, arc: 96, heavy: true });
  }

  spinAttack() {
    const hero = this.gameState.data.hero;
    if (this.attackLocked) return;
    if (hero.power < 22) {
      this.gameState.log("Poder insuficiente para Ataque Giratorio.");
      return;
    }
    hero.power -= 22;
    this.attackLocked = true;
    this.setPlayerTexture("attack");
    this.playSwordSwing(this.vectorAngle(), 340, true);
    this.playSwingEffect(0, 110, true);
    this.enemies
      .filter((enemySprite) => Phaser.Math.Distance.Between(this.player.x, this.player.y, enemySprite.x, enemySprite.y) <= 116)
      .forEach((enemySprite) => this.damageEnemy(enemySprite, Math.floor(hero.attack * 1.35), "Ataque Giratorio atingiu"));
    this.playHitSound(520, 0.06);
    this.time.delayedCall(360, () => {
      this.attackLocked = false;
      this.setPlayerTexture("idle");
      this.restoreBackSword();
    });
  }

  specialAttack() {
    const hero = this.gameState.data.hero;
    if (!hero.abilities.includes("dragonFlames")) {
      this.gameState.log("Nenhuma habilidade especial desperta ainda.");
      return;
    }
    if (hero.power < 25) {
      this.gameState.log("Poder insuficiente.");
      return;
    }
    hero.power -= 25;
    this.setPlayerTexture("cast");
    const burst = this.add.circle(this.player.x, this.player.y, 90, 0xf07b39, 0.22).setDepth(11).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: burst, scale: 1.6, alpha: 0, duration: 460, onComplete: () => burst.destroy() });
    this.playSwingEffect(0, 120, true, 0xef6a35);
    this.hitNearestEnemy(hero.attack + 28, 112, "Chamas misteriosas queimaram");
    this.time.delayedCall(280, () => this.setPlayerTexture("idle"));
  }

  dodge() {
    const pointer = new Phaser.Math.Vector2(this.player.body.velocity.x, this.player.body.velocity.y);
    if (pointer.length() === 0) pointer.set(1, 0);
    pointer.normalize().scale(92);
    this.invulnerableUntil = this.time.now + 420;
    this.setPlayerTexture("dodge");
    this.player.x = Phaser.Math.Clamp(this.player.x + pointer.x, 0, WORLD_WIDTH);
    this.player.y = Phaser.Math.Clamp(this.player.y + pointer.y, 0, WORLD_HEIGHT);
    this.gameState.data.hero.power = Math.min(this.gameState.data.hero.maxPower, this.gameState.data.hero.power + 6);
    this.gameState.log("Ryden esquivou.");
    this.time.delayedCall(260, () => this.setPlayerTexture("idle"));
  }

  playSwordAttack({ damage, range, label, duration, arc, heavy = false }) {
    this.attackLocked = true;
    this.attackLockedUntil = this.time.now + duration + 80;
    this.setPlayerTexture("attack");
    this.playSwordSwing(this.vectorAngle(), duration, false);
    this.playSwingEffect(this.vectorAngle(), arc, false);
    this.playHitSound(heavy ? 220 : 420, heavy ? 0.08 : 0.045);
    this.time.delayedCall(Math.floor(duration * 0.45), () => this.hitNearestEnemy(damage, range, label));
    this.time.delayedCall(duration, () => {
      this.attackLocked = false;
      this.setPlayerTexture("idle");
      this.restoreBackSword();
    });
  }

  playSwingEffect(angle, range, spin = false, tint = 0xfff0bc) {
    const offset = this.facingVector.clone().normalize().scale(spin ? 0 : 36);
    const x = this.player.x + offset.x;
    const y = this.player.y + offset.y;
    const slash = this.add.sprite(x, y, "slash").setDepth(43).setScale(spin ? 3.4 : 2.4).setAlpha(0.9).setTint(tint).setBlendMode(Phaser.BlendModes.ADD);
    slash.setRotation(angle);
    this.tweens.add({ targets: slash, rotation: slash.rotation + (spin ? Math.PI * 2 : 0.8), scale: slash.scale + 0.6, alpha: 0, duration: spin ? 340 : 260, onComplete: () => slash.destroy() });
  }

  playSwordSwing(angle, duration, spin = false) {
    const offset = this.facingVector.clone().normalize().scale(spin ? 8 : 38);
    this.backSword.setVisible(false);
    this.heldSword
      .setVisible(true)
      .setAlpha(1)
      .setPosition(this.player.x + offset.x, this.player.y + offset.y)
      .setRotation(angle + Math.PI / 2)
      .setScale(spin ? 2.2 : 1.8);
    this.tweens.killTweensOf(this.heldSword);
    this.tweens.add({
      targets: this.heldSword,
      rotation: this.heldSword.rotation + (spin ? Math.PI * 2 : Math.PI * 0.9),
      duration,
      ease: "Quad.easeOut",
      onUpdate: () => {
        const liveOffset = this.facingVector.clone().normalize().scale(spin ? 8 : 38);
        this.heldSword.setPosition(this.player.x + liveOffset.x, this.player.y + liveOffset.y);
      },
      onComplete: () => this.restoreBackSword()
    });
  }

  damageEnemy(target, damage, label) {
    target.enemy.hp -= damage;
    target.setTint(0xffffff);
    this.time.delayedCall(90, () => target.clearTint());
    const floating = this.add.text(target.x - 14, target.y - 42, `-${damage}`, { fontSize: target.enemy.boss ? "28px" : "18px", color: "#ffe08a", stroke: "#3d1111", strokeThickness: 3 }).setDepth(50).setAlpha(1);
    this.tweens.add({ targets: floating, y: floating.y - 42, alpha: 0, duration: 820, onComplete: () => floating.destroy() });
    const impact = this.add.sprite(target.x, target.y, "spark").setDepth(45).setScale(target.enemy.boss ? 2.2 : 1.3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: impact, scale: impact.scale + 1, alpha: 0, duration: 260, onComplete: () => impact.destroy() });
    this.gameState.log(`${label} ${target.enemy.name}.`);
    if (target.enemy.hp <= 0) this.defeatEnemy(target);
  }

  hitNearestEnemy(damage, range, label) {
    const target = nearest(this.player, this.enemies, range);
    if (!target) {
      this.gameState.log("Nenhum inimigo ao alcance.");
      return;
    }
    this.damageEnemy(target, damage, label);
  }

  defeatEnemy(enemySprite) {
    const enemy = enemySprite.enemy;
    this.gameState.data.defeatedEnemies.push(enemy.id);
    this.gameState.recordEnemyDefeat(enemy);
    this.gameState.addRewards(enemy);
    if (enemy.boss) {
      this.musicDirector?.playCue("victory", this.getCurrentRegion()?.id === "underworld-gate" ? "cave" : "exploration");
      if (enemy.id.startsWith("boost")) {
        if (!this.gameState.data.hero.abilities.includes("dragonFlames")) this.gameState.data.hero.abilities.push("dragonFlames");
        this.gameState.log("Boost caiu. Uma chama misteriosa despertou, mas Ryden nao entende sua origem.");
        this.hud.showStoryPanel("boostAwakening");
        this.gameState.completeStep("defeat_boost");
      }
      if (enemy.id.startsWith("drakharGuardian")) {
        this.gameState.log("O Guardiao de Drakhar caiu. Um sonho estranho espera Ryden quando a noite chegar.");
        this.gameState.completeStep("defeat_drakhar_guardian");
      }
      if (enemy.id.startsWith("azgorath")) {
        this.gameState.log("Azgorath foi derrotado. Um selo antigo se rompe no Submundo.");
        this.gameState.completeStep("defeat_azgorath");
      }
    }
    enemySprite.destroy();
    enemySprite.hpBack?.destroy();
    enemySprite.hpFill?.destroy();
    this.enemies = this.enemies.filter((entry) => entry !== enemySprite);
    this.gameState.save();
  }

  takeDamage(amount) {
    const hero = this.gameState.data.hero;
    hero.hp = Math.max(0, hero.hp - amount);
    if (!this.attackLocked) {
      this.setPlayerTexture("hurt");
      this.time.delayedCall(180, () => {
        if (!this.attackLocked) this.setPlayerTexture("idle");
      });
    }
    if (hero.hp <= 0) {
      this.musicDirector?.playDefeat();
      this.hud.showDialog("Derrota", [
        "Ryden cai de joelhos enquanto a trilha se apaga.",
        "Uma melodia triste acompanha o resgate de Altheron.",
        "A jornada ainda nao acabou."
      ]);
      hero.hp = hero.maxHp;
      hero.power = hero.maxPower;
      this.player.setPosition(170, 220);
      this.gameState.log("Ryden foi resgatado por Altheron e voltou para casa.");
    }
  }

  interact() {
    const objectSprite = nearest(this.player, this.interactiveObjects ?? [], INTERACT_DISTANCE);
    if (objectSprite) {
      this.openInteractiveObject(objectSprite);
      return;
    }
    const discoverySprite = nearest(this.player, this.discoverySprites ?? [], INTERACT_DISTANCE);
    if (discoverySprite) {
      this.openDiscovery(discoverySprite);
      return;
    }
    if (this.gameState.getQuest().step === "open_first_chest") {
      const requiredChest = nearest(this.player, this.chests, INTERACT_DISTANCE);
      if (requiredChest) {
        this.openChest(requiredChest);
        return;
      }
    }
    const npcSprite = nearest(this.player, [...this.npcs, ...(this.townFolk ?? [])], INTERACT_DISTANCE);
    if (npcSprite) {
      this.openNpc(npcSprite.npc);
      return;
    }
    const chestSprite = nearest(this.player, this.chests, INTERACT_DISTANCE);
    if (chestSprite) {
      this.openChest(chestSprite);
      return;
    }
    this.gameState.log("Nada para interagir por perto.");
  }

  openInteractiveObject(objectSprite) {
    const object = objectSprite.objectData;
    if (object.reward) {
      if (object.reward.item) this.gameState.addItem(object.reward.item);
      if (object.reward.gold) this.gameState.data.hero.gold += object.reward.gold;
      this.gameState.data.usedObjects.push(object.id);
      this.gameState.log(`${object.title}: recompensa encontrada.`);
      objectSprite.destroy();
      this.interactiveObjects = this.interactiveObjects.filter((entry) => entry !== objectSprite);
      this.gameState.save();
    }
    if (object.damage) {
      this.takeDamage(object.damage);
      this.gameState.log(`${object.title}: Ryden sofreu ${object.damage} de dano.`);
    }
    if (object.questStep === "survive_drakhar_trap") this.gameState.log("Armadilha de Drakhar sobrevivida.");
    if (object.questStep === "solve_drakhar_puzzle") this.gameState.log("Puzzle das runas de Drakhar resolvido.");
    if (object.questStep) this.gameState.completeStep(object.questStep);
    if (object.id === "valoria-sign") this.gameState.completeStep("explore_valoria");
    if (object.id === "academy-door") this.gameState.completeStep("reach_academy");
    this.hud.showDialog(object.title, object.lines);
  }

  openDiscovery(discoverySprite) {
    const discovery = discoverySprite.discovery;
    const isNew = this.gameState.discover(discovery.id);
    discoverySprite.setAlpha(0.45);
    discoverySprite.glow.setAlpha(0.06);
    if (isNew && IMPORTANT_DISCOVERIES.has(discovery.id)) {
      window.lordDragonsRuntime?.musicDirector?.playStoryCue(discovery.id === "mordrake-echo" ? "revelation" : "mystery");
      this.hud.showCinematicEvent({
        title: discovery.name,
        speaker: "Ryden",
        art: discovery.text,
        mood: discovery.id === "mordrake-echo" ? "mordrake" : "mystery",
        lines: [
          discovery.text,
          "O mundo parece escurecer ao redor por um instante.",
          "Ryden guarda a sensacao sem conseguir explicar."
        ]
      });
      return;
    }
    this.hud.showDialog(discovery.name, [
      discovery.text,
      isNew ? "Ryden recebeu uma pequena recompensa por explorar." : "Ryden ja registrou esta descoberta."
    ]);
  }

  openNpc(npc) {
    if (npc.questStep) this.gameState.completeStep(npc.questStep);
    if (npc.shop) {
      this.hud.showShop(npc);
    } else if (npc.craft) {
      this.hud.showCraft(npc);
    } else if (npc.inn) {
      this.hud.showDialog(npc.name, npc.lines, [{
        label: "Descansar por 10 ouro",
        action: () => {
          const hero = this.gameState.data.hero;
          if (hero.gold >= 10) {
            hero.gold -= 10;
            hero.hp = hero.maxHp;
            hero.power = hero.maxPower;
            this.gameState.log("Ryden descansou na estalagem.");
            this.gameState.save();
          }
        }
      }]);
    } else {
      this.hud.showDialog(npc.name, npc.lines);
    }
  }

  openChest(chestSprite) {
    const chest = chestSprite.chest;
    this.gameState.data.openedChests.push(chest.id);
    this.gameState.data.hero.gold += chest.gold;
    chest.items.forEach((item) => this.gameState.addItem(item));
    this.gameState.log(`Bau aberto: ${chest.gold} ouro e ${chest.items.length} item(ns).`);
    if (chest.questStep) this.gameState.completeStep(chest.questStep);
    chestSprite.destroy();
    this.chests = this.chests.filter((entry) => entry !== chestSprite);
    this.gameState.save();
  }

  manualSave() {
    this.gameState.save();
    this.gameState.log("Jogo salvo manualmente.");
    this.hud.update();
  }

  setTouchDirection(dir) {
    this.touchVector.set(0, 0);
    if (dir === "left") this.touchVector.x = -1;
    if (dir === "right") this.touchVector.x = 1;
    if (dir === "up") this.touchVector.y = -1;
    if (dir === "down") this.touchVector.y = 1;
  }

  bindMobileControls() {
    const joystick = document.querySelector("#virtual-joystick");
    const knob = document.querySelector("#joystick-knob");
    if (joystick && knob) {
      const release = () => {
        this.touchVector.set(0, 0);
        knob.style.transform = "translate(-50%, -50%)";
      };
      const update = (event) => {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const max = rect.width * 0.34;
        const vector = new Phaser.Math.Vector2(dx, dy);
        if (vector.length() > max) vector.setLength(max);
        this.touchVector.set(vector.x / max, vector.y / max);
        knob.style.transform = `translate(calc(-50% + ${vector.x}px), calc(-50% + ${vector.y}px))`;
      };
      joystick.addEventListener("pointerdown", (event) => {
        joystick.setPointerCapture(event.pointerId);
        update(event);
      });
      joystick.addEventListener("pointermove", (event) => {
        if (event.buttons) update(event);
      });
      joystick.addEventListener("pointerup", release);
      joystick.addEventListener("pointercancel", release);
      joystick.addEventListener("lostpointercapture", release);
    }
  }

  bindControlButtons() {
    document.querySelectorAll("[data-control-action]").forEach((button) => {
      if (button.dataset.controlBound === "true") return;
      button.dataset.controlBound = "true";
      button.addEventListener("click", () => {
        this.runControlAction(button.dataset.controlAction);
      });
    });
  }

  runControlAction(action) {
    this.lastControlAction = action;
    if (action === "attack") this.basicAttack();
    if (action === "heavy") this.heavyAttack();
    if (action === "dodge") this.dodge();
    if (action === "spin") this.spinAttack();
    if (action === "special") this.specialAttack();
    if (action === "interact") this.interact();
    if (action === "inventory") this.hud.showInventory();
    if (action === "map") this.hud.showWorldMap();
    if (action === "save") this.manualSave();
  }

  updatePlayerAnimation(moving, speed) {
    if (this.attackLocked || this.time.now < this.invulnerableUntil) return;
    if (!moving) {
      this.setPlayerTexture("idle");
      return;
    }
    this.setPlayerTexture(speed > PLAYER_SPEED ? "run" : "walk");
  }

  setPlayerTexture(state) {
    if (!this.player) return;
    const direction = this.getFacingDirection();
    const animatedStates = ["walk", "run", "attack", "dodge", "cast"];
    const frame = animatedStates.includes(state) ? Math.floor(this.time.now / (state === "run" ? 110 : 160)) % 2 : 0;
    const animatedKey = `ryden-${state}-${direction}-${frame}`;
    const key = this.textures.exists(animatedKey) ? animatedKey : `ryden-${state}-${direction}`;
    if (this.player.texture.key !== key && this.textures.exists(key)) this.player.setTexture(key);
  }

  getFacingDirection() {
    if (Math.abs(this.facingVector.x) > Math.abs(this.facingVector.y)) {
      return this.facingVector.x < 0 ? "left" : "right";
    }
    return this.facingVector.y < 0 ? "back" : "front";
  }

  updateEquippedSword() {
    if (!this.backSword || !this.heldSword || this.heldSword.visible) return;
    const leftFacing = this.facingVector.x < -0.2;
    const offsetX = leftFacing ? -16 : 16;
    const rotation = leftFacing ? 0.56 : -0.72;
    this.backSword
      .setVisible(true)
      .setPosition(this.player.x + offsetX, this.player.y + 3)
      .setRotation(rotation)
      .setDepth(19);
  }

  restoreBackSword() {
    if (!this.heldSword || !this.backSword) return;
    this.heldSword.setVisible(false).setAlpha(1);
    this.backSword.setVisible(true);
    this.updateEquippedSword();
  }

  vectorAngle() {
    return Math.atan2(this.facingVector.y, this.facingVector.x);
  }

  playHitSound(frequency, duration) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioContext) this.audioContext = new AudioContextClass();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.035;
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch {
      // Audio feedback is optional; gameplay must continue if the browser blocks sound.
    }
  }

  addBlocker(x, y, width, height) {
    if (!this.solidObjects) return;
    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    this.solidObjects.add(zone);
  }
}

function nearest(origin, targets, maxDistance) {
  let selected = null;
  let selectedDistance = maxDistance;
  targets.forEach((target) => {
    const distance = Phaser.Math.Distance.Between(origin.x, origin.y, target.x, target.y);
    if (distance <= selectedDistance) {
      selected = target;
      selectedDistance = distance;
    }
  });
  return selected;
}

function enemyKey(enemy) {
  return `${enemy.type}-${enemy.x}-${enemy.y}`;
}

function darkenColor(color, factor) {
  const red = Math.floor(((color >> 16) & 0xff) * factor);
  const green = Math.floor(((color >> 8) & 0xff) * factor);
  const blue = Math.floor((color & 0xff) * factor);
  return (red << 16) | (green << 8) | blue;
}
