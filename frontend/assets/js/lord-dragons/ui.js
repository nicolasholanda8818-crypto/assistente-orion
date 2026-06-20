import { CAMPAIGN_ARC, CHAPTERS, CHRONICLES, DISCOVERIES, ENEMY_TYPES, ITEMS, PLAYABLE_CHARACTERS, QUESTS, RECIPES, SKILL_TREES, STORY_PANELS, TRANSFORMATIONS, WORLD_MAPS } from "./content.js";

export class Hud {
  constructor(gameState) {
    this.gameState = gameState;
    this.dialog = document.querySelector("#game-dialog");
    this.title = document.querySelector("#dialog-title");
    this.body = document.querySelector("#dialog-body");
    this.actions = document.querySelector("#dialog-actions");
  }

  update() {
    const { hero, messages } = this.gameState.data;
    const quest = this.gameState.getQuest();
    const period = ["Manha", "Tarde", "Noite"][Math.floor(this.gameState.data.dayTick / 1800) % 3];

    setText("hud-health-text", `${hero.hp}/${hero.maxHp}`);
    setText("hud-power-text", `${hero.power}/${hero.maxPower}`);
    setText("hud-level", hero.level);
    setText("hud-xp", `${hero.xp}/${hero.nextXp}`);
    setText("hud-gold", hero.gold);
    setText("hud-daytime", period);
    setText("hud-quest", quest.text);
    setText("hud-hint", this.gameState.getNextHint());
    setText("hud-health-mini", `${hero.hp}/${hero.maxHp}`);
    setText("hud-power-mini", `${hero.power}/${hero.maxPower}`);
    setText("hud-level-mini", hero.level);
    setText("hud-gold-mini", hero.gold);
    setText("hud-quest-mini", quest.text);
    setMeter("hud-health", hero.hp, hero.maxHp);
    setMeter("hud-power", hero.power, hero.maxPower);

    document.querySelector("#hud-log").innerHTML = messages.map((message) => `<p>${escapeHtml(message)}</p>`).join("");
  }

  showDialog(title, lines, buttons = []) {
    this.dialog.classList.remove("cinematic-event");
    this.title.textContent = title;
    this.body.innerHTML = lines.map((line) => line.startsWith("<") ? line : `<p>${escapeHtml(line)}</p>`).join("");
    this.actions.innerHTML = "";
    buttons.concat([{ label: "Fechar", value: "close" }]).forEach((button) => {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = button.label;
      element.addEventListener("click", () => {
        button.action?.();
        if (button.close !== false) this.dialog.close();
      });
      this.actions.appendChild(element);
    });
    this.dialog.showModal();
  }

  showStoryPanel(panelId) {
    const panel = STORY_PANELS[panelId];
    if (!panel) return;
    window.lordDragonsRuntime?.musicDirector?.playStoryCue(panelId === "boostAwakening" ? "revelation" : "mystery");
    this.showCinematicEvent({
      title: panel.title,
      speaker: panel.speaker,
      art: panel.art,
      mood: panelId === "boostAwakening" ? "revelation" : "mystery",
      lines: panel.lines
    });
  }

  showCinematicEvent({ title, speaker, art, mood = "mystery", lines = [] }) {
    let index = 0;
    const render = () => {
      const currentLine = lines[index] ?? "";
      this.dialog.classList.add("cinematic-event");
      this.title.textContent = title;
      this.body.innerHTML = `
        <article class="cinematic-art cinematic-${escapeHtml(mood)}">
          <span class="cinematic-illustration" aria-hidden="true"></span>
          <b>${escapeHtml(speaker)}</b>
          <small>${escapeHtml(art)}</small>
        </article>
        <p class="cinematic-line">${escapeHtml(currentLine)}</p>
      `;
      this.actions.innerHTML = "";
      const next = document.createElement("button");
      next.type = "button";
      next.textContent = index < lines.length - 1 ? "Avancar" : "Fechar";
      next.addEventListener("click", () => {
        if (index < lines.length - 1) {
          index += 1;
          render();
        } else {
          this.dialog.close();
          this.dialog.classList.remove("cinematic-event");
        }
      });
      this.actions.appendChild(next);
    };
    render();
    this.dialog.showModal();
  }

  showInventory() {
    const inventory = this.gameState.data.inventory;
    const entries = Object.entries(inventory);
    const lines = [cards(entries.length
      ? entries.map(([id, amount]) => iconCard(itemIcon(id), ITEMS[id].name, `${amount} unidade(s)`, itemDetail(ITEMS[id])))
      : [iconCard(".", "Bolsa vazia", "Nenhum item encontrado.", "Explore baus, monstros e lojas.")])];
    const buttons = entries
      .filter(([id]) => ["consumable", "weapon", "armor"].includes(ITEMS[id].type))
      .map(([id]) => ({
        label: ITEMS[id].type === "consumable" ? `Usar ${ITEMS[id].name}` : `Equipar ${ITEMS[id].name}`,
        action: () => {
          if (ITEMS[id].type === "consumable") this.gameState.useItem(id);
          else this.gameState.equip(id);
          this.update();
        }
      }));
    this.showDialog("Bolsa de Ryden", lines, buttons);
  }

  showShop(npc) {
    const lines = [cards(npc.shop.map((id) => iconCard(itemIcon(id), ITEMS[id].name, `${ITEMS[id].price} ouro`, itemDetail(ITEMS[id]))))];
    const buttons = npc.shop.map((id) => ({
      label: `Comprar ${ITEMS[id].name}`,
      close: false,
      action: () => {
        const hero = this.gameState.data.hero;
        if (hero.gold < ITEMS[id].price) {
          this.gameState.log("Ouro insuficiente.");
        } else {
          hero.gold -= ITEMS[id].price;
          this.gameState.addItem(id);
          this.gameState.log(`${ITEMS[id].name} comprado.`);
          this.gameState.save();
        }
        this.update();
      }
    }));
    this.showDialog(npc.name, lines, buttons);
  }

  showCraft(npc) {
    const lines = [cards(npc.craft.map((recipeId) => {
      const recipe = RECIPES[recipeId];
      return iconCard("F", ITEMS[recipe.item].name, recipeText(recipeId), recipe.requires ? "Requer uma chama ainda incompreendida." : "Receita disponivel.");
    }))];
    const buttons = npc.craft.map((recipeId) => ({
      label: `Criar ${ITEMS[RECIPES[recipeId].item].name}`,
      close: false,
      action: () => {
        craft(recipeId, this.gameState);
        this.update();
      }
    }));
    this.showDialog(npc.name, lines, buttons);
  }

  showEquipment() {
    const hero = this.gameState.data.hero;
    const weapon = hero.weapon ? ITEMS[hero.weapon].name : "Espada nas costas";
    const armor = hero.armor ? ITEMS[hero.armor].name : "Roupa de aventureiro medieval";
    this.showDialog("Equipamentos", [cards([
      iconCard("A", "Arma", weapon, `Ataque ${hero.attack}`),
      iconCard("D", "Armadura", armor, `Defesa ${hero.defense}`),
      iconCard("*", "Forma", transformationName(hero.transformation), "Aparencia atual de Ryden."),
      iconCard("O", "Olhos Dourados", "Incomuns", "Altheron evita explicar.")
    ])]);
  }

  showStatus() {
    const hero = this.gameState.data.hero;
    this.showDialog("Status de Ryden", [cards([
      iconCard("HP", "Vida", `${hero.hp}/${hero.maxHp}`, "Resistencia em combate."),
      iconCard("MP", "Poder", `${hero.power}/${hero.maxPower}`, "Energia para habilidades."),
      iconCard("LV", "Nivel", hero.level, `${hero.xp}/${hero.nextXp} XP`),
      iconCard("AT", "Ataque", hero.attack, "Forca ofensiva total."),
      iconCard("DF", "Defesa", hero.defense, "Reducao de dano."),
      iconCard("?", "Origem", "Desconhecida", "Criado por Altheron.")
    ])]);
  }

  showSkills() {
    const hero = this.gameState.data.hero;
    const knownBranches = new Set(["fire", "warrior"]);
    if (hero.transformation === "dragonFlames" || hero.transformation === "lordDragons") knownBranches.add("dragon");
    const treeCards = Object.entries(SKILL_TREES).flatMap(([branch, skills]) => skills.map((skill) => {
      const unlocked = hero.abilities.includes(skill.id)
        || (skill.id === "spinSlash")
        || (skill.id === "burningHands" && hero.abilities.includes("dragonFlames"));
      if (!knownBranches.has(branch)) return iconCard("?", "???", "Ramo bloqueado", "Ryden ainda nao compreende esta forca.");
      return iconCard(unlocked ? "*" : "-", skill.name, unlocked ? "Desbloqueada" : skill.requirement, skill.effect);
    }));
    this.showDialog("Habilidades e Formas", [
      cards(TRANSFORMATIONS.map((form) => {
      const unlocked = form.id === "human"
        || hero.transformation === form.id
        || hero.abilities.includes(form.id)
        || (form.id === "awakening" && hero.level >= 2);
      if (!unlocked && ["dragonFlames", "draconic", "lordDragons"].includes(form.id)) {
        return iconCard("?", "???", "Bloqueada", "Ryden ainda nao compreende esta parte de si.");
      }
      return iconCard(unlocked ? "*" : "-", form.name, unlocked ? "Desbloqueada" : form.requirement, form.detail);
      })),
      cards(treeCards)
    ]);
  }

  showQuests() {
    const current = this.gameState.data.questIndex;
    const chapter = currentChapter(this.gameState);
    const currentChapterIndex = Math.max(0, CHAPTERS.findIndex((entry) => entry.id === chapter.id));
    const campaignCards = CHAPTERS.map((entry, index) => {
      const visible = index <= currentChapterIndex;
      return iconCard(visible ? "C" : "?", visible ? entry.title : "Capitulo futuro", visible ? entry.summary : "Continue a campanha para revelar.", visible ? entry.goals.join(" | ") : "Bloqueado por historia.");
    });
    this.showDialog("Missoes", [
      iconCard("I", chapter.title, chapter.summary, "Capitulo ativo."),
      cards(campaignCards),
      cards(QUESTS.map((quest, index) => {
        const state = index < current ? "Concluida" : index === current ? "Atual" : "Bloqueada";
        const text = index <= current ? quest.text : "Missao futura";
        const detail = index <= current ? quest.id : "Continue explorando para revelar.";
        return iconCard(index < current ? "OK" : index === current ? "!" : "-", text, state, detail);
      }))
    ]);
  }

  showWorldMap() {
    const hero = this.gameState.data.hero;
    const realmTitles = {
      valoria: "Reino Humano",
      sylvandor: "Reino Elfico",
      "kar-dur": "Reino dos Anoes",
      drakhar: "Antigo Reino",
      umbraxis: "Imperio Demoniaco"
    };
    const pins = WORLD_MAPS.map((place) => `<span class="map-pin" style="left:${place.x}%;top:${place.y}%"><b>${escapeHtml(place.name)}</b><small>${escapeHtml(realmTitles[place.id] ?? place.tone)}</small></span>`).join("");
    const cardsHtml = cards(WORLD_MAPS.map((place, index) => {
      const drakharKnown = this.gameState.data.questIndex >= QUESTS.findIndex((quest) => quest.step === "talk_elandor");
      const status = index === 0
        ? "Descoberta"
        : place.id === "drakhar" && drakharKnown
          ? "Rota encontrada"
          : index === 1 && hero.x > 440 ? "Rota encontrada" : "Bloqueada";
      return iconCard("X", place.name, status, `${place.tone}. Missao atual: ${this.gameState.getQuest().text}`);
    }));
    this.showDialog("Mapa Mundial", [`<div class="world-map">${pins}</div>`, cardsHtml]);
  }

  showDiscoveries() {
    const found = this.gameState.data.discoveries;
    this.showDialog("Descobertas", [cards(DISCOVERIES.map((entry) => {
      const unlocked = found.includes(entry.id);
      return iconCard(unlocked ? "OK" : "?", unlocked ? entry.name : "???", unlocked ? entry.type : entry.hint, unlocked ? entry.text : "Investigue o mundo para revelar esta historia.");
    }))]);
  }

  showChronicles() {
    const seen = this.gameState.data.monstersSeen;
    const bosses = this.gameState.data.bossesDefeated;
    const monsterCards = Object.entries(ENEMY_TYPES).map(([id, enemy]) => {
      const known = seen.includes(id) || bosses.includes(id);
      return iconCard(known ? "M" : "?", known ? enemy.name : "???", known ? "Encontrado" : "Nao registrado", known ? `XP ${enemy.xp}, ouro ${enemy.gold}` : "Encontre a criatura no mundo.");
    });
    const bossCards = Object.entries(ENEMY_TYPES)
      .filter(([, enemy]) => enemy.boss)
      .map(([id, enemy]) => iconCard(bosses.includes(id) ? "B" : "?", bosses.includes(id) ? enemy.name : "Chefe desconhecido", bosses.includes(id) ? "Derrotado" : "Nao derrotado", "Chefes registram grandes viradas da historia."));
    const realmCards = CHRONICLES.realms.map((entry) => iconCard("R", entry.title, "Reino", entry.text));
    const playableCards = PLAYABLE_CHARACTERS.map((entry) => {
      const active = this.gameState.data.party.active.includes(entry.id);
      const ally = this.gameState.data.party.allies.includes(entry.id);
      return iconCard(active ? "P1" : ally ? "AL" : "NPC", entry.name, entry.role, active ? "Jogavel agora." : ally ? "Aliado desbloqueado." : "Existe como NPC ate ser escolhido.");
    });
    const campaignCards = CAMPAIGN_ARC.map((entry) => iconCard("A", entry.title, `${entry.act}: ${entry.place}`, entry.outcome));
    const discoveries = this.gameState.data.discoveries;
    const loreCards = [...CHRONICLES.dragons, ...CHRONICLES.demons].map((entry) => {
      const unlocked = discoveries.includes("old-waystone") || discoveries.includes("mordrake-echo");
      return iconCard("L", unlocked ? entry.title : "Registro Bloqueado", unlocked ? "Historia" : "Misterio", unlocked ? entry.text : "Encontre sonhos, reliquias e ruinas para revelar esta cronica.");
    });
    this.showDialog("Cronicas do Reino", [
      cards(playableCards),
      cards(campaignCards),
      cards([...realmCards, ...loreCards]),
      cards([...monsterCards, ...bossCards])
    ]);
  }
}

function craft(recipeId, gameState) {
  const recipe = RECIPES[recipeId];
  const hero = gameState.data.hero;
  if (recipe.requires && !hero.abilities.includes(recipe.requires)) {
    gameState.log("Ryden ainda nao compreende essa chama.");
    return false;
  }
  if (hero.gold < recipe.gold) {
    gameState.log("Ouro insuficiente para criar.");
    return false;
  }
  const hasMaterials = Object.entries(recipe.cost).every(([id, amount]) => (gameState.data.inventory[id] ?? 0) >= amount);
  if (!hasMaterials) {
    gameState.log("Materiais insuficientes.");
    return false;
  }
  Object.entries(recipe.cost).forEach(([id, amount]) => gameState.removeItem(id, amount));
  hero.gold -= recipe.gold;
  gameState.addItem(recipe.item);
  gameState.log(`${ITEMS[recipe.item].name} criado.`);
  if (recipe.item === "flameSword") gameState.completeStep("craft_flame_sword");
  gameState.save();
  return true;
}

function recipeText(recipeId) {
  const recipe = RECIPES[recipeId];
  const materials = Object.entries(recipe.cost).map(([id, amount]) => `${amount} ${ITEMS[id].name}`).join(", ");
  return `${ITEMS[recipe.item].name}: ${materials}, ${recipe.gold} ouro`;
}

function currentChapter(gameState) {
  const quest = gameState.getQuest();
  return CHAPTERS.find((chapter) => chapter.id === quest.chapter)
    ?? CHAPTERS.find((chapter) => chapter.id === gameState.data.chapter.id)
    ?? CHAPTERS[0];
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function setMeter(id, value, max) {
  const meter = document.querySelector(`#${id}`);
  meter.max = max;
  meter.value = value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function cards(items) {
  return `<div class="menu-grid">${items.join("")}</div>`;
}

function iconCard(icon, title, subtitle, detail) {
  return `<article class="menu-card icon-row"><span class="pixel-icon">${escapeHtml(icon)}</span><span><b>${escapeHtml(title)}</b><small>${escapeHtml(subtitle)}</small><small>${escapeHtml(detail)}</small></span></article>`;
}

function itemIcon(id) {
  if (id.includes("sword")) return "A";
  if (id === "armor") return "D";
  if (id === "potion") return "+";
  if (id === "ether") return "*";
  if (id === "scale") return "S";
  if (id === "iron") return "I";
  if (id === "herb") return "H";
  return ".";
}

function itemDetail(item) {
  if (item.attack) return `Ataque +${item.attack}`;
  if (item.defense) return `Defesa +${item.defense}`;
  if (item.heal) return `Cura ${item.heal}`;
  if (item.power) return `Poder ${item.power}`;
  return item.type;
}

function transformationName(id) {
  return TRANSFORMATIONS.find((form) => form.id === id)?.name ?? "Forma Humana";
}
