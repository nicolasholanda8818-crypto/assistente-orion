import { DISCOVERIES, HERO, ITEMS, QUESTS } from "./content.js";

export const STORAGE_KEY = "lord-dragons-save-v1";

export function createDefaultState() {
  return {
    hero: {
      ...HERO,
      x: HERO.start.x,
      y: HERO.start.y,
      hp: 100,
      maxHp: 100,
      power: 100,
      maxPower: 100,
      mana: 100,
      maxMana: 100,
      stamina: 100,
      maxStamina: 100,
      level: 1,
      xp: 0,
      nextXp: 100,
      gold: 25,
      attack: 12,
      defense: 2,
      weapon: null,
      armor: null,
      abilities: [],
      transformation: "human"
    },
    character: {
      name: "Ryden",
      sex: "masculino",
      appearance: "aventureiro-sombrio",
      hair: "ruivo",
      eyes: "dourados",
      classId: "guerreiro"
    },
    party: {
      active: ["ryden"],
      allies: [],
      maxPlayers: 4
    },
    inventory: { potion: 2, herb: 1 },
    openedChests: [],
    usedObjects: [],
    defeatedEnemies: [],
    discoveries: [],
    monstersSeen: [],
    bossesDefeated: [],
    levelUpFlash: null,
    chapter: {
      id: "chapter-1",
      firstMonstersDefeated: 0,
      tutorialMoveDone: false,
      introSeen: false,
      lastDream: null
    },
    questIndex: 0,
    dayTick: 0,
    messages: ["Ryden desperta na Casa do Mago."]
  };
}

export class GameState {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const defaults = createDefaultState();
      const saved = JSON.parse(raw);
      return {
        ...defaults,
        ...saved,
        hero: { ...defaults.hero, ...(saved.hero ?? {}) },
        character: { ...defaults.character, ...(saved.character ?? {}) },
        party: { ...defaults.party, ...(saved.party ?? {}) },
        chapter: { ...defaults.chapter, ...(saved.chapter ?? {}) },
        inventory: { ...defaults.inventory, ...(saved.inventory ?? {}) },
        usedObjects: saved.usedObjects ?? defaults.usedObjects,
        discoveries: saved.discoveries ?? defaults.discoveries,
        monstersSeen: saved.monstersSeen ?? defaults.monstersSeen,
        bossesDefeated: saved.bossesDefeated ?? defaults.bossesDefeated,
        levelUpFlash: saved.levelUpFlash ?? defaults.levelUpFlash
      };
    } catch {
      return createDefaultState();
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  log(message) {
    this.data.messages.unshift(message);
    this.data.messages = this.data.messages.slice(0, 12);
  }

  getQuest() {
    return QUESTS[this.data.questIndex] ?? QUESTS[QUESTS.length - 1];
  }

  completeStep(step) {
    const quest = this.getQuest();
    if (quest.step !== step) return false;
    this.data.questIndex = Math.min(this.data.questIndex + 1, QUESTS.length - 1);
    const nextQuest = this.getQuest();
    if (nextQuest.chapter) this.data.chapter.id = nextQuest.chapter;
    this.updateTransformation(step);
    this.updateParty(step);
    this.log(`Missao atualizada: ${this.getQuest().text}`);
    this.save();
    return true;
  }

  completeTutorialMove() {
    if (this.data.chapter.tutorialMoveDone) return false;
    this.data.chapter.tutorialMoveDone = true;
    return this.completeStep("tutorial_move");
  }

  recordEnemyDefeat(enemy) {
    if (!this.data.monstersSeen.includes(enemy.type)) this.data.monstersSeen.push(enemy.type);
    if (enemy.boss && !this.data.bossesDefeated.includes(enemy.type)) this.data.bossesDefeated.push(enemy.type);
    if (enemy.type === "spark" && !enemy.id.includes("counted")) {
      this.data.chapter.firstMonstersDefeated += 1;
      this.log(`Tutorial de combate: ${this.data.chapter.firstMonstersDefeated}/2 Fagulhas Selvagens derrotadas.`);
      if (this.data.chapter.firstMonstersDefeated >= 2) this.completeStep("defeat_first_monsters");
    }
    if (enemy.type === "drakharGuardian") this.completeStep("defeat_drakhar_guardian");
    if (enemy.type === "demonGeneral") this.completeStep("defeat_demon_general");
  }

  discover(discoveryId) {
    if (this.data.discoveries.includes(discoveryId)) return false;
    const discovery = DISCOVERIES.find((entry) => entry.id === discoveryId);
    if (!discovery) return false;
    this.data.discoveries.push(discoveryId);
    this.addRewards({
      xp: discovery.reward.xp,
      gold: discovery.reward.gold,
      drops: discovery.reward.items
    });
    this.log(`Descoberta: ${discovery.name}.`);
    if (discovery.questStep) this.completeStep(discovery.questStep);
    this.save();
    return true;
  }

  getNextHint() {
    const quest = this.getQuest();
    const questDiscovery = DISCOVERIES.find((entry) => entry.questStep === quest.step && !this.data.discoveries.includes(entry.id));
    if (questDiscovery) return questDiscovery.hint;
    if (quest.hint) return quest.hint;
    const nextDiscovery = DISCOVERIES.find((entry) => !this.data.discoveries.includes(entry.id));
    return nextDiscovery?.hint ?? "O mundo guarda novas rotas alem de Valoria.";
  }

  addItem(itemId, amount = 1) {
    this.data.inventory[itemId] = (this.data.inventory[itemId] ?? 0) + amount;
  }

  removeItem(itemId, amount = 1) {
    if ((this.data.inventory[itemId] ?? 0) < amount) return false;
    this.data.inventory[itemId] -= amount;
    if (this.data.inventory[itemId] <= 0) delete this.data.inventory[itemId];
    return true;
  }

  addRewards({ xp = 0, gold = 0, drops = [] }) {
    const hero = this.data.hero;
    hero.xp += xp;
    hero.gold += gold;
    drops.forEach((itemId) => this.addItem(itemId));
    this.log(`Ryden recebeu ${xp} XP, ${gold} ouro${drops.length ? ` e ${drops.map((id) => ITEMS[id].name).join(", ")}` : ""}.`);

    while (hero.xp >= hero.nextXp) {
      hero.xp -= hero.nextXp;
      hero.level += 1;
      hero.nextXp = Math.floor(hero.nextXp * 1.35);
      hero.maxHp += 18;
      hero.maxPower += 10;
      hero.maxMana = (hero.maxMana ?? hero.maxPower) + 10;
      hero.maxStamina = (hero.maxStamina ?? 100) + 6;
      hero.attack += 4;
      hero.defense += 2;
      hero.hp = hero.maxHp;
      hero.power = hero.maxPower;
      hero.mana = hero.maxMana;
      hero.stamina = hero.maxStamina;
      this.data.levelUpFlash = { level: hero.level, at: Date.now() };
      this.log(`Ryden alcancou o nivel ${hero.level}.`);
    }
  }

  equip(itemId) {
    const item = ITEMS[itemId];
    if (!item || !this.removeItem(itemId)) return false;

    if (item.type === "weapon") {
      if (this.data.hero.weapon) this.addItem(this.data.hero.weapon);
      this.data.hero.weapon = itemId;
    }

    if (item.type === "armor") {
      if (this.data.hero.armor) this.addItem(this.data.hero.armor);
      this.data.hero.armor = itemId;
    }

    this.recalculateStats();
    this.log(`${item.name} equipado.`);
    this.save();
    return true;
  }

  useItem(itemId) {
    const item = ITEMS[itemId];
    const hero = this.data.hero;
    if (!item || item.type !== "consumable" || !this.removeItem(itemId)) return false;
    if (item.heal) hero.hp = Math.min(hero.maxHp, hero.hp + item.heal);
    if (item.power) hero.power = Math.min(hero.maxPower, hero.power + item.power);
    this.log(`${item.name} usado.`);
    this.save();
    return true;
  }

  recalculateStats() {
    const hero = this.data.hero;
    const weapon = hero.weapon ? ITEMS[hero.weapon] : null;
    const armor = hero.armor ? ITEMS[hero.armor] : null;
    hero.attack = 12 + (hero.level - 1) * 4 + (weapon?.attack ?? 0);
    hero.defense = 2 + (hero.level - 1) * 2 + (armor?.defense ?? 0);
  }

  updateTransformation(step) {
    const hero = this.data.hero;
    if (hero.level >= 2 && hero.transformation === "human") hero.transformation = "awakening";
    if (step === "defeat_boost") {
      hero.transformation = "awakening";
      if (!hero.abilities.includes("burningHands")) hero.abilities.push("burningHands");
      if (!hero.abilities.includes("dragonFlames")) hero.abilities.push("dragonFlames");
    }
    if (step === "craft_flame_sword" && !hero.abilities.includes("flameSword")) hero.abilities.push("flameSword");
    if (step === "defeat_drakhar_guardian" && !hero.abilities.includes("doubleCut")) hero.abilities.push("doubleCut");
    if (step === "defeat_drakhar_guardian") this.data.chapter.lastDream = "dream_mysterious_warrior";
    if (step === "defeat_demon_general") hero.transformation = "dragonFlames";
    if (step === "defeat_azgorath") hero.transformation = "lordDragons";
  }

  updateParty(step) {
    const alliesByStep = {
      meet_lyra: "lyra",
      talk_elandor: "elandor",
      meet_duran: "duran"
    };
    const ally = alliesByStep[step];
    if (!ally) return;
    if (!this.data.party.allies.includes(ally)) this.data.party.allies.push(ally);
  }
}
