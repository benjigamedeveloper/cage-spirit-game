/*
  Cage Spirit - beginner-friendly vanilla JavaScript prototype.
  The game stays canvas + plain HTML/CSS so index.html opens directly.
  Edit STATS, ATTACKS, and COLORS to rebalance or reskin the fight.
*/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  titleScreen: document.getElementById("titleScreen"),
  characterSelect: document.getElementById("characterSelect"),
  fighterCards: document.getElementById("fighterCards"),
  startButton: document.getElementById("startButton"),
  endOverlay: document.getElementById("endOverlay"),
  restartButton: document.getElementById("restartButton"),
  endTitle: document.getElementById("endTitle"),
  endMessage: document.getElementById("endMessage"),
  roundStatus: document.getElementById("roundStatus"),
  comboText: document.getElementById("comboText"),
  playerName: document.getElementById("playerName"),
  enemyName: document.getElementById("enemyName"),
  playerHealth: document.getElementById("playerHealth"),
  playerStamina: document.getElementById("playerStamina"),
  playerSpecial: document.getElementById("playerSpecial"),
  playerHealthText: document.getElementById("playerHealthText"),
  playerStaminaText: document.getElementById("playerStaminaText"),
  playerSpecialText: document.getElementById("playerSpecialText"),
  enemyHealth: document.getElementById("enemyHealth"),
  enemyStamina: document.getElementById("enemyStamina"),
  enemySpecial: document.getElementById("enemySpecial"),
  enemyHealthText: document.getElementById("enemyHealthText"),
  enemyStaminaText: document.getElementById("enemyStaminaText"),
  enemySpecialText: document.getElementById("enemySpecialText")
};

// Easy balancing knobs for beginners.
const STATS = {
  maxHealth: 100,
  maxStamina: 100,
  staminaRegen: 8.5, // slower than before so stamina choices matter
  walkSpeed: 235,
  dashSpeed: 780,
  dashDuration: 0.18,
  dashCooldown: 0.52,
  dashCost: 24,
  hopCost: 13,
  blockDrainPerSecond: 15,
  blockDamageReduction: 0.66,
  guardBreakLimit: 8,
  arenaPadding: 55,
  groundY: 410
};

const ATTACKS = {
  punch: { damage: 7, stamina: 8, range: 76, windup: 0.06, active: 0.13, recovery: 0.16, knockback: 125, specialGain: 10 },
  kick: { damage: 14, stamina: 18, range: 95, windup: 0.14, active: 0.15, recovery: 0.3, knockback: 205, specialGain: 16 },
  combo: { damage: 19, stamina: 12, range: 105, windup: 0.04, active: 0.16, recovery: 0.26, knockback: 285, specialGain: 22 },
  // Special is split into four cinematic hits below. Total damage is 33.
  special: { damage: 33, stamina: 28, range: 170, windup: 0.42, active: 0.92, recovery: 0.5, knockback: 420, specialGain: 0 }
};

// Five original anime MMA fighters.  The cards, stats, colors, AI, and specials all read from this data.
const FIGHTERS = [
  {
    id: "spirit-brawler",
    name: "Spirit Brawler",
    style: "Balanced all-rounder",
    description: "A clean fundamentals fighter with steady footwork, crisp boxing, and blue-white spirit pressure.",
    specialName: "Spirit Rush",
    ability: "Dashes forward with a fast anime MMA combo for balanced multi-hit damage and knockback.",
    specialType: "rush",
    stats: { health: 100, stamina: 100, speed: 235, staminaRegen: 8.5, punchDamage: 7, kickDamage: 14, punchCost: 8, kickCost: 18, blockReduction: 0.66 },
    colors: { suit: "#68f7ff", skin: "#ffd2a6", shorts: "#17203f", trim: "#f5fbff", hair: "#111a33", glove: "#f8fcff", shoe: "#87f6ff", aura: "rgba(104, 247, 255, 0.38)", detail: "#ffffff" }
  },
  {
    id: "storm-boxer",
    name: "Storm Boxer",
    style: "Fast striker",
    description: "A lightning-fast boxer who darts through angles with bright yellow afterimages and rapid hands.",
    specialName: "Lightning Step",
    ability: "Dashes through or behind the opponent, then lands rapid punches. Lower damage, but very hard to dodge.",
    specialType: "lightning",
    stats: { health: 88, stamina: 96, speed: 292, staminaRegen: 9.3, punchDamage: 8, kickDamage: 9, punchCost: 7, kickCost: 17, blockReduction: 0.58 },
    colors: { suit: "#ffd84a", skin: "#f0bd8c", shorts: "#2c2308", trim: "#fff6a5", hair: "#fff26a", glove: "#fff7c2", shoe: "#ffef62", aura: "rgba(255, 216, 74, 0.36)", detail: "#ffffff" }
  },
  {
    id: "iron-wrestler",
    name: "Iron Wrestler",
    style: "Slow powerhouse grappler",
    description: "A steel-clad clinch specialist with crushing pressure, heavy strikes, and a stubborn guard.",
    specialName: "Titan Clinch",
    ability: "If close, grabs and performs a heavy non-graphic slam impact with huge knockback. Too far becomes a weaker lunge.",
    specialType: "clinch",
    stats: { health: 118, stamina: 108, speed: 178, staminaRegen: 7.1, punchDamage: 10, kickDamage: 17, punchCost: 11, kickCost: 23, blockReduction: 0.72 },
    colors: { suit: "#9aa3ad", skin: "#d7aa84", shorts: "#242a31", trim: "#dce4ec", hair: "#252a31", glove: "#c6ced7", shoe: "#676f78", aura: "rgba(154, 163, 173, 0.38)", detail: "#f2f6f8" }
  },
  {
    id: "flame-kicker",
    name: "Flame Kicker",
    style: "Kick-focused pressure fighter",
    description: "A fiery roundhouse artist who controls mid range with orange-red kicks and burning pressure.",
    specialName: "Inferno Roundhouse",
    ability: "Unleashes a flaming roundhouse with a short-range shockwave for good damage and strong visual impact.",
    specialType: "roundhouse",
    stats: { health: 98, stamina: 102, speed: 230, staminaRegen: 8.2, punchDamage: 5, kickDamage: 18, punchCost: 7, kickCost: 19, blockReduction: 0.62 },
    colors: { suit: "#ff6b2b", skin: "#ffc195", shorts: "#38120c", trim: "#ffd0a0", hair: "#b61e0d", glove: "#ff9356", shoe: "#ff3f22", aura: "rgba(255, 107, 43, 0.36)", detail: "#ffe08f" }
  },
  {
    id: "shadow-counter",
    name: "Shadow Counter",
    style: "Defensive counter fighter",
    description: "A patient shadow stylist with evasive blocks, purple-black aura, and timing-based punishment.",
    specialName: "Phantom Reversal",
    ability: "Counters hard if the opponent is attacking. If mistimed, only a weaker shadow hit comes out.",
    specialType: "reversal",
    stats: { health: 96, stamina: 112, speed: 218, staminaRegen: 9.0, punchDamage: 6, kickDamage: 11, punchCost: 7, kickCost: 16, blockReduction: 0.78 },
    colors: { suit: "#8b5cff", skin: "#e3b18d", shorts: "#120a1f", trim: "#c9b7ff", hair: "#08050e", glove: "#5b35a6", shoe: "#20102f", aura: "rgba(139, 92, 255, 0.34)", detail: "#2b173f" }
  }
];

const COLORS = {
  player: FIGHTERS[0].colors,
  enemy: FIGHTERS[3].colors
};

const keys = new Set();
let player;
let enemy;
let gameState = "title";
let lastTime = 0;
let hitPause = 0;
let shake = 0;
let screenFlash = 0;
let comboSequence = [];
let comboTimer = 0;
let comboMessageTimer = 0;
const effects = [];

function createFighter(fighterData, x, facing, controlledByPlayer) {
  const stats = fighterData.stats;
  return {
    name: fighterData.name,
    fighterData,
    x,
    y: STATS.groundY,
    width: 52,
    height: 134,
    vx: 0,
    vy: 0,
    facing,
    moveIntent: facing,
    colors: fighterData.colors,
    maxHealth: stats.health,
    maxStamina: stats.stamina,
    health: stats.health,
    stamina: stats.stamina,
    special: 0,
    state: "idle",
    stateTimer: 0,
    attack: null,
    hitStepsDone: [],
    blocking: false,
    guardBroken: false,
    guardBreakTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    specialCooldown: 0,
    aiDecisionCooldown: 0.1,
    aiBlockTimer: 0,
    aiStrafeTimer: 0,
    aiStrafeDirection: 0,
    aiSpecialPatience: 0.65 + Math.random() * 0.8,
    knockbackTimer: 0,
    hitReactTimer: 0,
    lowStaminaTimer: 0,
    comboQueued: false,
    controlledByPlayer
  };
}
function renderCharacterCards() {
  ui.fighterCards.innerHTML = "";
  for (const fighter of FIGHTERS) {
    const card = document.createElement("button");
    card.className = "fighter-card";
    card.type = "button";
    card.style.setProperty("--card-accent", fighter.colors.suit);
    card.style.setProperty("--card-dark", fighter.colors.shorts);
    card.innerHTML = `
      <div class="fighter-portrait" aria-hidden="true"></div>
      <h3>${fighter.name}</h3>
      <p class="fighter-style">${fighter.style}</p>
      <p class="fighter-desc">${fighter.description}</p>
      <div class="stat-grid">
        <span class="stat-pill"><strong>Health</strong> ${fighter.stats.health}</span>
        <span class="stat-pill"><strong>Speed</strong> ${fighter.stats.speed}</span>
        <span class="stat-pill"><strong>Stamina</strong> ${fighter.stats.stamina}</span>
        <span class="stat-pill"><strong>Punch</strong> ${fighter.stats.punchDamage}</span>
        <span class="stat-pill"><strong>Kick</strong> ${fighter.stats.kickDamage}</span>
        <span class="stat-pill"><strong>Block</strong> ${Math.round(fighter.stats.blockReduction * 100)}%</span>
      </div>
      <p class="fighter-special">Special: ${fighter.specialName}</p>
      <p class="ability-desc">${fighter.ability}</p>
      <span class="choose-label">Select Fighter</span>
    `;
    card.addEventListener("click", () => resetGame(fighter.id));
    ui.fighterCards.appendChild(card);
  }
}

function showCharacterSelect() {
  gameState = "select";
  ui.titleScreen.classList.add("hidden");
  ui.endOverlay.classList.add("hidden");
  ui.characterSelect.classList.remove("hidden");
  ui.roundStatus.textContent = "Choose Fighter";
  ui.comboText.textContent = "";
}

function resetGame(selectedFighterId) {
  const playerData = FIGHTERS.find((fighter) => fighter.id === selectedFighterId) || FIGHTERS[0];
  const rivals = FIGHTERS.filter((fighter) => fighter.id !== playerData.id);
  const enemyData = rivals[Math.floor(Math.random() * rivals.length)] || FIGHTERS[1];

  player = createFighter(playerData, 260, 1, true);
  enemy = createFighter(enemyData, 700, -1, false);
  effects.length = 0;
  comboSequence = [];
  comboTimer = 0;
  comboMessageTimer = 0;
  hitPause = 0;
  shake = 0;
  screenFlash = 0;
  gameState = "playing";
  ui.endOverlay.classList.add("hidden");
  ui.titleScreen.classList.add("hidden");
  ui.characterSelect.classList.add("hidden");
  ui.roundStatus.textContent = `${player.name} vs ${enemy.name}`;
  addFloatingText(`${playerData.specialName} ready at 100%`, canvas.width / 2, 92, player.colors.suit, 22, 1.2);
  updateUI();
}
function showLowStamina(fighter, action) {
  if (fighter.lowStaminaTimer > 0) return;
  fighter.lowStaminaTimer = 0.55;
  const label = action ? `LOW STAMINA: ${action}` : "LOW STAMINA";
  addFloatingText(label, fighter.x, fighter.y - 158, "#65ff8f", 20);
  if (fighter.controlledByPlayer) {
    ui.roundStatus.textContent = "Stamina low!";
  }
}

function startAttack(fighter, type, target = null) {
  if (gameState !== "playing" || fighter.state === "attack" || fighter.guardBroken || fighter.specialCooldown > 0) return;
  const data = buildAttackData(fighter, type, target);
  if (type === "special" && fighter.special < 100) {
    if (fighter.controlledByPlayer) addFloatingText("SPECIAL NOT READY", fighter.x, fighter.y - 170, "#f7d84a", 19);
    return;
  }
  if (fighter.stamina < data.stamina) {
    showLowStamina(fighter, type.toUpperCase());
    return;
  }

  fighter.stamina -= data.stamina;
  fighter.attack = { type, ...data, elapsed: 0 };
  fighter.hitStepsDone = [];
  fighter.state = "attack";
  fighter.stateTimer = data.windup + data.active + data.recovery;
  fighter.blocking = false;

  if (type === "special") {
    fighter.special = 0;
    fighter.specialCooldown = 1.05;
    ui.comboText.textContent = `${fighter.fighterData.specialName}!`;
    comboMessageTimer = 1.5;
    screenFlash = 0.35;
    shake = Math.max(shake, 16);
    addAuraBurst(fighter.x, fighter.y - 82, fighter.colors.suit, 22);
    addSpeedLines(fighter.x, fighter.y - 76, fighter.facing, 28, fighter.colors.suit);
    addFloatingText(fighter.fighterData.specialName.toUpperCase(), canvas.width / 2, 132, fighter.colors.suit, 34, 1.1);
  }
}

function buildAttackData(fighter, type, target) {
  const stats = fighter.fighterData.stats;
  if (type === "punch") {
    const speedBonus = fighter.fighterData.specialType === "lightning" ? 0.75 : 1;
    return { ...ATTACKS.punch, damage: stats.punchDamage, stamina: stats.punchCost, windup: ATTACKS.punch.windup * speedBonus, recovery: ATTACKS.punch.recovery * speedBonus };
  }
  if (type === "kick") {
    const kickRange = fighter.fighterData.specialType === "roundhouse" ? 108 : ATTACKS.kick.range;
    return { ...ATTACKS.kick, damage: stats.kickDamage, stamina: stats.kickCost, range: kickRange };
  }
  if (type === "combo") {
    return { ...ATTACKS.combo, damage: Math.round(stats.punchDamage + stats.kickDamage * 0.78), stamina: 12, range: 112 };
  }

  const specialType = fighter.fighterData.specialType;
  const countered = specialType === "reversal" && target?.state === "attack";
  const specialRange = specialType === "lightning" ? 240 : specialType === "roundhouse" ? 155 : specialType === "clinch" ? 138 : 175;
  return { ...ATTACKS.special, stamina: 28, range: specialRange, specialType, countered };
}
function getDashSpeed(fighter) {
  return STATS.dashSpeed * (fighter.fighterData.stats.speed / STATS.walkSpeed);
}

function dash(fighter) {
  if (gameState !== "playing" || fighter.guardBroken || fighter.state === "attack") return;
  if (fighter.dashCooldown > 0) return;
  if (fighter.stamina < STATS.dashCost) {
    showLowStamina(fighter, "DASH");
    return;
  }

  // Dash follows the currently pressed direction if there is one, otherwise facing.
  const direction = fighter.moveIntent || fighter.facing;
  fighter.stamina -= STATS.dashCost;
  fighter.dashTimer = STATS.dashDuration;
  fighter.dashCooldown = STATS.dashCooldown;
  fighter.vx = direction * getDashSpeed(fighter);
  fighter.facing = direction;
  fighter.blocking = false;
  addDashDust(fighter.x - direction * 18, fighter.y - 10, -direction, fighter.colors.suit);
  addAfterImage(fighter);
  addSpeedLines(fighter.x, fighter.y - 65, direction, 14, fighter.colors.suit);
}

function hop(fighter) {
  if (fighter.stamina < STATS.hopCost || fighter.y < STATS.groundY || fighter.guardBroken) {
    if (fighter.y >= STATS.groundY) showLowStamina(fighter, "HOP");
    return;
  }
  fighter.stamina -= STATS.hopCost;
  fighter.vy = -420;
  fighter.blocking = false;
  addDashDust(fighter.x, fighter.y, -fighter.facing, fighter.colors.suit);
}

function update(dt) {
  if (gameState !== "playing") return;

  if (hitPause > 0) {
    hitPause -= dt;
    updateEffects(dt);
    draw();
    return;
  }

  comboTimer -= dt;
  comboMessageTimer -= dt;
  if (comboTimer <= 0) comboSequence = [];
  if (comboMessageTimer <= 0) ui.comboText.textContent = "";

  handlePlayerInput(dt);
  updateAI(dt);
  updateFighter(player, enemy, dt);
  updateFighter(enemy, player, dt);
  updateEffects(dt);
  checkWinner();
  updateUI();
}

function handlePlayerInput(dt) {
  if (player.knockbackTimer <= 0 && player.state !== "attack") {
    let input = 0;
    if (keys.has("a")) input -= 1;
    if (keys.has("d")) input += 1;
    if (input !== 0) {
      player.moveIntent = input;
      player.facing = input;
    }
    if (player.dashTimer <= 0) player.vx = input * player.fighterData.stats.speed;
  }

  player.blocking = keys.has("l") && !player.guardBroken && player.stamina > 0 && player.state !== "attack" && player.knockbackTimer <= 0;
  if (player.blocking) player.stamina -= STATS.blockDrainPerSecond * dt;
}

function updateAI(dt) {
  const distance = player.x - enemy.x;
  const absDistance = Math.abs(distance);
  const directionToPlayer = Math.sign(distance) || enemy.facing;

  enemy.facing = directionToPlayer;
  enemy.moveIntent = directionToPlayer;
  enemy.aiDecisionCooldown -= dt;
  enemy.aiSpecialPatience -= dt;
  enemy.aiBlockTimer -= dt;
  enemy.aiStrafeTimer -= dt;
  if (enemy.knockbackTimer <= 0 && enemy.state !== "attack" && enemy.dashTimer <= 0) enemy.vx = 0;

  if (enemy.guardBroken || enemy.state === "attack" || enemy.knockbackTimer > 0) return;

  enemy.blocking = enemy.aiBlockTimer > 0 && enemy.stamina > STATS.guardBreakLimit + 4;

  // Always keep the AI moving toward a usable fighting range so it does not freeze.
  if (!enemy.blocking && enemy.dashTimer <= 0) {
    if (absDistance > 150) enemy.vx = directionToPlayer * enemy.fighterData.stats.speed * 0.86;
    else if (absDistance < 72) enemy.vx = -directionToPlayer * enemy.fighterData.stats.speed * 0.62;
    else if (enemy.aiStrafeTimer > 0) enemy.vx = enemy.aiStrafeDirection * enemy.fighterData.stats.speed * 0.32;
  }

  if (enemy.aiDecisionCooldown <= 0) {
    enemy.aiDecisionCooldown = 0.24 + Math.random() * 0.36;
    const playerAttackingNearby = player.state === "attack" && absDistance < 135;

    if (enemy.aiStrafeTimer <= 0) {
      enemy.aiStrafeTimer = 0.35 + Math.random() * 0.45;
      enemy.aiStrafeDirection = Math.random() < 0.5 ? directionToPlayer : -directionToPlayer;
    }

    if (playerAttackingNearby && enemy.stamina > 18 && Math.random() < 0.62) {
      enemy.blocking = true;
      enemy.aiBlockTimer = 0.34 + Math.random() * 0.24;
      return;
    }

    if (absDistance > 170 && enemy.stamina > STATS.dashCost + 8 && Math.random() < 0.42) {
      enemy.moveIntent = directionToPlayer;
      dash(enemy);
      return;
    }

    if (absDistance > 95 && absDistance < 165 && enemy.stamina > STATS.dashCost + 18 && Math.random() < 0.22) {
      enemy.moveIntent = directionToPlayer;
      dash(enemy);
      return;
    }

    const wantsCounter = enemy.fighterData.specialType === "reversal" && player.state === "attack" && absDistance < 160;
    if (enemy.special >= 100 && enemy.stamina > 32 && enemy.aiSpecialPatience <= 0 && (wantsCounter || (absDistance < 155 && Math.random() < 0.34))) {
      enemy.aiSpecialPatience = 1.8 + Math.random() * 2.2;
      startAttack(enemy, "special", player);
      return;
    }

    if (absDistance < 125 && enemy.stamina > 12 && Math.random() < 0.76) {
      startAttack(enemy, Math.random() < 0.66 ? "punch" : "kick", player);
    }
  }

  if (enemy.blocking) enemy.stamina -= STATS.blockDrainPerSecond * dt;
}

function updateFighter(fighter, target, dt) {
  // Keep facing locked during dash/attack so Shift dash does not flip unexpectedly.
  if (fighter.state !== "attack" && fighter.dashTimer <= 0 && fighter.knockbackTimer <= 0) {
    fighter.facing = target.x > fighter.x ? 1 : -1;
  }

  if (fighter.dashTimer > 0) {
    fighter.dashTimer -= dt;
    if (Math.random() < 0.45) addAfterImage(fighter);
    if (fighter.dashTimer <= 0) fighter.vx *= 0.28;
  }
  if (fighter.dashCooldown > 0) fighter.dashCooldown -= dt;
  if (fighter.specialCooldown > 0) fighter.specialCooldown -= dt;
  if (fighter.knockbackTimer > 0) fighter.knockbackTimer -= dt;
  if (fighter.hitReactTimer > 0) fighter.hitReactTimer -= dt;
  if (fighter.lowStaminaTimer > 0) fighter.lowStaminaTimer -= dt;

  fighter.x += fighter.vx * dt;
  fighter.vy += 1300 * dt;
  fighter.y += fighter.vy * dt;
  if (fighter.y > STATS.groundY) {
    fighter.y = STATS.groundY;
    fighter.vy = 0;
  }

  fighter.x = Math.max(STATS.arenaPadding, Math.min(canvas.width - STATS.arenaPadding, fighter.x));
  fighter.stamina = Math.min(fighter.maxStamina, fighter.stamina + fighter.fighterData.stats.staminaRegen * dt);

  if (fighter.blocking && fighter.stamina <= STATS.guardBreakLimit) guardBreak(fighter);
  if (fighter.guardBreakTimer > 0) {
    fighter.guardBreakTimer -= dt;
    if (fighter.guardBreakTimer <= 0) fighter.guardBroken = false;
  }

  if (fighter.state === "attack" && fighter.attack) {
    fighter.attack.elapsed += dt;
    fighter.stateTimer -= dt;
    if (fighter.attack.type === "special") updateSpecialHits(fighter, target);
    else updateNormalHit(fighter, target);

    if (fighter.stateTimer <= 0) {
      fighter.state = "idle";
      fighter.attack = null;
      fighter.hitStepsDone = [];
      if (fighter.comboQueued) {
        fighter.comboQueued = false;
        startAttack(fighter, "combo", target);
      }
    }
  }
}

function updateNormalHit(attacker, defender) {
  const attack = attacker.attack;
  const activeStart = attack.windup;
  const activeEnd = attack.windup + attack.active;
  if (!attacker.hitStepsDone.includes("main") && attack.elapsed >= activeStart && attack.elapsed <= activeEnd) {
    attacker.hitStepsDone.push("main");
    tryHit(attacker, defender, attack.damage, attack.knockback, attack.type, attack.specialGain);
  }
}

function updateSpecialHits(attacker, defender) {
  const special = attacker.attack.specialType;
  let hits;

  // Each special stays in the 20-35 damage range, then resets the meter to 0 in startAttack().
  if (special === "lightning") {
    if (!attacker.hitStepsDone.includes("blink") && attacker.attack.elapsed >= 0.18) {
      attacker.hitStepsDone.push("blink");
      attacker.x = Math.max(STATS.arenaPadding, Math.min(canvas.width - STATS.arenaPadding, defender.x + attacker.facing * 52));
      attacker.facing *= -1;
      attacker.moveIntent = attacker.facing;
      addAfterImage(attacker);
      addSpeedLines(attacker.x, attacker.y - 78, attacker.facing, 30, attacker.colors.suit);
    }
    hits = [
      { time: 0.28, damage: 7, knockback: 72, name: "punch" },
      { time: 0.42, damage: 7, knockback: 82, name: "punch" },
      { time: 0.58, damage: 8, knockback: 245, name: "special" }
    ];
  } else if (special === "clinch") {
    const close = Math.abs(attacker.x - defender.x) <= 92;
    hits = [{ time: 0.52, damage: close ? 35 : 18, knockback: close ? 520 : 250, name: "special", range: close ? 98 : 138, final: close }];
  } else if (special === "roundhouse") {
    hits = [
      { time: 0.54, damage: 25, knockback: 315, name: "kick", range: 132 },
      { time: 0.68, damage: 7, knockback: 210, name: "special", range: 158, final: true }
    ];
  } else if (special === "reversal") {
    hits = [{ time: 0.36, damage: attacker.attack.countered ? 32 : 20, knockback: attacker.attack.countered ? 410 : 220, name: "special", range: attacker.attack.countered ? 178 : 126, final: true }];
  } else {
    hits = [
      { time: 0.42, damage: 6, knockback: 80, name: "punch" },
      { time: 0.58, damage: 7, knockback: 105, name: "punch" },
      { time: 0.76, damage: 8, knockback: 135, name: "kick" },
      { time: 0.98, damage: 9, knockback: ATTACKS.special.knockback, name: "special", final: true }
    ];
  }

  for (let i = 0; i < hits.length; i++) {
    const step = hits[i];
    if (!attacker.hitStepsDone.includes(i) && attacker.attack.elapsed >= step.time) {
      attacker.hitStepsDone.push(i);
      const previousRange = attacker.attack.range;
      if (step.range) attacker.attack.range = step.range;
      const landed = tryHit(attacker, defender, step.damage, step.knockback, step.name, 0, step.final || i === hits.length - 1);
      attacker.attack.range = previousRange;
      const sparkX = attacker.x + attacker.facing * (55 + i * 8);
      addImpactFlash(sparkX, attacker.y - 88 + i * 8, step.name, false, attacker.colors.suit);
      addAuraBurst(attacker.x, attacker.y - 82, attacker.colors.suit, step.final || i === hits.length - 1 ? 18 : 7);
      addSpeedLines(attacker.x, attacker.y - 80, attacker.facing, step.final || i === hits.length - 1 ? 18 : 8, attacker.colors.suit);
      if (landed && (step.final || i === hits.length - 1)) screenFlash = 0.45;
    }
  }
}
function tryHit(attacker, defender, damage, knockback, type, specialGain, finalSpecialHit = false) {
  const distance = Math.abs(attacker.x - defender.x);
  const facingTarget = Math.sign(defender.x - attacker.x) === attacker.facing;
  const range = attacker.attack.range;
  if (!facingTarget || distance > range) return false;

  let finalDamage = damage;
  let blocked = false;

  if (defender.blocking && defender.stamina > STATS.guardBreakLimit) {
    blocked = true;
    finalDamage *= 1 - defender.fighterData.stats.blockReduction;
    defender.stamina -= damage * 1.45;
    addFloatingText("GUARD SPARK", defender.x, defender.y - 128, "#68f7ff", 19);
    if (defender.stamina <= STATS.guardBreakLimit) guardBreak(defender);
  }

  defender.health = Math.max(0, defender.health - finalDamage);
  defender.vx = attacker.facing * knockback * (blocked ? 0.52 : 1);
  defender.knockbackTimer = finalSpecialHit ? 0.34 : type === "kick" || type === "combo" ? 0.2 : 0.14;
  defender.hitReactTimer = 0.22;
  attacker.special = Math.min(100, attacker.special + specialGain);

  const hitX = defender.x - defender.facing * 24;
  const hitY = defender.y - 78;
  addImpactFlash(hitX, hitY, type, blocked, attacker.colors.suit);
  addFloatingText(`-${Math.ceil(finalDamage)}`, defender.x, defender.y - 148, blocked ? "#8be9ff" : "#fff1a8");

  hitPause = type === "punch" ? 0.035 : finalSpecialHit ? 0.12 : 0.075;
  if (type === "kick" || type === "combo" || type === "special") shake = Math.max(shake, finalSpecialHit ? 24 : 10);

  if (attacker.controlledByPlayer && !blocked) recordComboHit(type);
  return true;
}

function recordComboHit(type) {
  if (type === "combo" || type === "special") return;
  comboSequence.push(type);
  comboSequence = comboSequence.slice(-3);
  comboTimer = 1.05;

  if (comboSequence.join(",") === "punch,punch,kick") {
    ui.comboText.textContent = "SPIRIT COMBO FINISHER!";
    comboMessageTimer = 1.4;
    comboSequence = [];
    player.comboQueued = true;
  } else {
    ui.comboText.textContent = `${comboSequence.length} HIT CHAIN`;
    comboMessageTimer = 0.55;
  }
}

function guardBreak(fighter) {
  fighter.blocking = false;
  fighter.guardBroken = true;
  fighter.guardBreakTimer = 1.15;
  fighter.stamina = 0;
  addFloatingText("GUARD BREAK!", fighter.x, fighter.y - 150, "#ff4d76");
  addImpactFlash(fighter.x, fighter.y - 80, "guard", false);
  shake = Math.max(shake, 8);
}

function addFloatingText(text, x, y, color, size = 26, life = 0.8) {
  effects.push({ kind: "text", text, x, y, vy: -58, life, maxLife: life, color, size });
}

function addImpactFlash(x, y, type, blocked, color = null) {
  effects.push({
    kind: "flash",
    x,
    y,
    life: 0.28,
    maxLife: 0.28,
    radius: type === "special" ? 92 : type === "kick" || type === "combo" ? 60 : 38,
    color,
    blocked
  });
  addSpeedLines(x, y, Math.random() < 0.5 ? 1 : -1, type === "special" ? 24 : 10, blocked ? "#68f7ff" : "#fff1a8");
}

function addSpeedLines(x, y, direction, count, color) {
  for (let i = 0; i < count; i++) {
    effects.push({
      kind: "line",
      x: x + (Math.random() - 0.5) * 110,
      y: y + (Math.random() - 0.5) * 130,
      direction,
      length: 35 + Math.random() * 72,
      life: 0.22 + Math.random() * 0.18,
      maxLife: 0.4,
      color
    });
  }
}

function addDashDust(x, y, direction, color) {
  for (let i = 0; i < 12; i++) {
    effects.push({
      kind: "dust",
      x: x + (Math.random() - 0.5) * 26,
      y: y + Math.random() * 16,
      vx: direction * (80 + Math.random() * 120),
      vy: -30 - Math.random() * 65,
      radius: 6 + Math.random() * 12,
      life: 0.38,
      maxLife: 0.38,
      color
    });
  }
}

function addAuraBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    effects.push({
      kind: "particle",
      x,
      y,
      vx: Math.cos(angle) * (60 + Math.random() * 190),
      vy: Math.sin(angle) * (60 + Math.random() * 190),
      radius: 3 + Math.random() * 6,
      life: 0.45 + Math.random() * 0.3,
      maxLife: 0.75,
      color
    });
  }
}

function addAfterImage(fighter) {
  effects.push({
    kind: "afterimage",
    x: fighter.x,
    y: fighter.y,
    facing: fighter.facing,
    colors: fighter.colors,
    life: 0.18,
    maxLife: 0.18
  });
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    effect.life -= dt;
    if (effect.kind === "text") {
      effect.y += effect.vy * dt;
      effect.vy += 18 * dt;
    }
    if (effect.kind === "dust" || effect.kind === "particle") {
      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.vy += 120 * dt;
    }
    if (effect.life <= 0) effects.splice(i, 1);
  }
  shake = Math.max(0, shake - 35 * dt);
  screenFlash = Math.max(0, screenFlash - 1.3 * dt);
}

function checkWinner() {
  if (player.health <= 0 || enemy.health <= 0) {
    gameState = "ended";
    const playerWon = enemy.health <= 0;
    ui.endTitle.textContent = playerWon ? "Victory!" : "Defeat";
    ui.endMessage.textContent = playerWon
      ? `${player.name} owns the cage. Choose again and chase a cleaner combo!`
      : `${enemy.name} takes the round. Breathe, guard, dash, and build your special for the rematch!`;
    ui.roundStatus.textContent = playerWon ? `${player.name} Wins` : `${enemy.name} Wins`;
    ui.endOverlay.classList.remove("hidden");
  }
}

function updateUI() {
  ui.playerName.textContent = player.name;
  ui.enemyName.textContent = enemy.name;
  ui.playerSpecial.style.background = `linear-gradient(90deg, ${player.colors.suit}, ${player.colors.trim}, #ffffff)`;
  ui.enemySpecial.style.background = `linear-gradient(90deg, ${enemy.colors.suit}, ${enemy.colors.trim}, #ffffff)`;
  setBar(ui.playerHealth, ui.playerHealthText, player.health, player.maxHealth, false);
  setBar(ui.playerStamina, ui.playerStaminaText, player.stamina, player.maxStamina, false);
  setBar(ui.playerSpecial, ui.playerSpecialText, player.special, 100, true);
  setBar(ui.enemyHealth, ui.enemyHealthText, enemy.health, enemy.maxHealth, false);
  setBar(ui.enemyStamina, ui.enemyStaminaText, enemy.stamina, enemy.maxStamina, false);
  setBar(ui.enemySpecial, ui.enemySpecialText, enemy.special, 100, true);
}

function setBar(bar, label, value, max, percentLabel) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  bar.style.width = `${percent}%`;
  label.textContent = percentLabel ? `${Math.floor(percent)}%` : Math.ceil(value);
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  drawArena();
  drawEffects("behind");
  drawFighter(player);
  drawFighter(enemy);
  drawEffects("front");
  drawScreenFlash();
  ctx.restore();
}

function drawArena() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#18275a");
  gradient.addColorStop(0.45, "#080b17");
  gradient.addColorStop(1, "#18101b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Crowd silhouettes.
  ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
  for (let i = 0; i < 28; i++) {
    const x = i * 38 + (i % 2) * 9;
    const h = 28 + (i % 5) * 8;
    ctx.fillRect(x, 248 - h, 24, h);
    ctx.beginPath();
    ctx.arc(x + 12, 242 - h, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing overhead lights.
  for (const light of [{ x: 140, c: "#68f7ff" }, { x: 480, c: "#f7d84a" }, { x: 820, c: "#ff4d76" }]) {
    const cone = ctx.createRadialGradient(light.x, 54, 10, light.x, 190, 260);
    cone.addColorStop(0, `${light.c}88`);
    cone.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.ellipse(light.x, 170, 210, 170, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light.c;
    ctx.fillRect(light.x - 42, 38, 84, 8);
  }

  // Neon cage fence: two diagonal layers and cage posts.
  ctx.strokeStyle = "rgba(104, 247, 255, 0.2)";
  ctx.lineWidth = 2;
  for (let x = -canvas.height; x < canvas.width; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, 72);
    ctx.lineTo(x + canvas.height, STATS.groundY + 18);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 77, 118, 0.13)";
  for (let x = 0; x < canvas.width + canvas.height; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, 72);
    ctx.lineTo(x - canvas.height, STATS.groundY + 18);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(238, 244, 255, 0.22)";
  ctx.lineWidth = 7;
  for (const postX of [62, 220, 740, 898]) {
    ctx.beginPath();
    ctx.moveTo(postX, 68);
    ctx.lineTo(postX, STATS.groundY + 22);
    ctx.stroke();
  }

  // Arena floor with painted octagon and perspective grid.
  const floor = ctx.createLinearGradient(0, STATS.groundY - 15, 0, canvas.height);
  floor.addColorStop(0, "#242849");
  floor.addColorStop(1, "#0b0710");
  ctx.fillStyle = floor;
  ctx.fillRect(0, STATS.groundY + 18, canvas.width, canvas.height - STATS.groundY);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, STATS.groundY + 45, 370, 72, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(104, 247, 255, 0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(120 + i * 80, STATS.groundY + 22);
    ctx.lineTo(70 + i * 95, canvas.height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(104, 247, 255, 0.09)";
  ctx.font = "900 66px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("CAGE SPIRIT", canvas.width / 2, 190);
}

function drawFighter(fighter) {
  const x = fighter.x;
  const y = fighter.y;
  const bounce = Math.sin(performance.now() / 130 + (fighter.controlledByPlayer ? 0 : 1.5)) * 2.4;
  const lean = fighter.state === "attack" ? fighter.facing * 8 : fighter.vx * 0.014;
  const hitLean = fighter.hitReactTimer > 0 ? -fighter.facing * 7 : 0;

  if (fighter.special >= 100 || fighter.attack?.type === "special") {
    ctx.fillStyle = fighter.colors.aura;
    ctx.beginPath();
    ctx.ellipse(x, y - 67, 60 + Math.sin(performance.now() / 85) * 7, 92, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (fighter.lowStaminaTimer > 0) {
    ctx.strokeStyle = "rgba(101, 255, 143, 0.7)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 38, y - 156, 76, 12);
  }

  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.scale(fighter.facing, 1);
  ctx.rotate((lean + hitLean) * Math.PI / 180);
  drawFighterBody(fighter, 1);
  ctx.restore();
}

function drawFighterBody(fighter, alpha = 1) {
  const c = fighter.colors;
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Back leg, front leg, shoes.
  drawLimb(-10, -54, -21, -8, 13, c.skin);
  drawLimb(12, -54, 24, -9, 13, c.skin);
  ctx.fillStyle = c.shoe;
  roundRect(-35, -12, 26, 12, 5);
  roundRect(9, -12, 33, 12, 5);

  // Angular shorts with waistband and side stripe.
  ctx.fillStyle = c.shorts;
  ctx.beginPath();
  ctx.moveTo(-29, -69);
  ctx.lineTo(30, -69);
  ctx.lineTo(22, -34);
  ctx.lineTo(5, -42);
  ctx.lineTo(-6, -34);
  ctx.lineTo(-25, -39);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.trim;
  ctx.fillRect(-27, -69, 54, 7);
  ctx.fillRect(17, -61, 5, 21);

  // Torso armor/rashguard shape and shoulders.
  ctx.fillStyle = c.suit;
  ctx.beginPath();
  ctx.moveTo(-28, -112);
  ctx.quadraticCurveTo(0, -128, 30, -112);
  ctx.lineTo(22, -67);
  ctx.lineTo(-23, -67);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.moveTo(-3, -121);
  ctx.lineTo(18, -72);
  ctx.lineTo(4, -68);
  ctx.lineTo(-12, -114);
  ctx.closePath();
  ctx.fill();

  // Small body details make each original fighter read differently on the canvas.
  ctx.strokeStyle = c.detail || c.trim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (fighter.fighterData.specialType === "lightning") {
    ctx.moveTo(-12, -108); ctx.lineTo(5, -97); ctx.lineTo(-4, -84); ctx.lineTo(15, -73);
  } else if (fighter.fighterData.specialType === "clinch") {
    ctx.strokeRect(-18, -108, 36, 28);
  } else if (fighter.fighterData.specialType === "roundhouse") {
    ctx.arc(0, -92, 18, 0.2, Math.PI * 1.45);
  } else if (fighter.fighterData.specialType === "reversal") {
    ctx.moveTo(-18, -74); ctx.quadraticCurveTo(0, -122, 18, -74);
  } else {
    ctx.moveTo(0, -116); ctx.lineTo(0, -72);
  }
  ctx.stroke();

  // Arms and gloves change pose for idle, block, punch, kick, and special.
  const attacking = fighter.state === "attack";
  const attackType = fighter.attack?.type;
  ctx.lineWidth = 12;
  ctx.strokeStyle = c.skin;
  ctx.beginPath();
  if (fighter.blocking || fighter.guardBroken) {
    ctx.moveTo(-22, -103); ctx.lineTo(-9, -131);
    ctx.moveTo(22, -103); ctx.lineTo(10, -128);
  } else if (attacking && (attackType === "punch" || attackType === "combo" || attackType === "special")) {
    const reach = attackType === "special" ? 76 : attackType === "combo" ? 62 : 50;
    ctx.moveTo(22, -102); ctx.lineTo(reach, -108);
    ctx.moveTo(-20, -101); ctx.lineTo(-33, -83);
  } else {
    ctx.moveTo(-22, -102); ctx.lineTo(-39, -84);
    ctx.moveTo(22, -102); ctx.lineTo(38, -87);
  }
  ctx.stroke();

  if (attacking && (attackType === "kick" || attackType === "combo" || attackType === "special")) {
    ctx.lineWidth = 14;
    ctx.strokeStyle = c.skin;
    ctx.beginPath();
    ctx.moveTo(13, -51);
    ctx.lineTo(attackType === "special" ? 82 : 66, -45);
    ctx.stroke();
    ctx.fillStyle = c.shoe;
    roundRect(attackType === "special" ? 72 : 57, -52, 28, 14, 6);
  }

  // Gloves/wraps.
  ctx.fillStyle = c.glove;
  if (fighter.blocking || fighter.guardBroken) {
    roundRect(-20, -140, 21, 19, 8);
    roundRect(1, -138, 22, 19, 8);
  } else if (attacking && (attackType === "punch" || attackType === "combo" || attackType === "special")) {
    roundRect(attackType === "special" ? 67 : attackType === "combo" ? 53 : 42, -118, 24, 19, 8);
    roundRect(-44, -92, 21, 18, 8);
  } else {
    roundRect(-48, -93, 21, 18, 8);
    roundRect(29, -96, 22, 18, 8);
  }

  // Neck, head, face, and anime hair silhouette.
  ctx.fillStyle = c.skin;
  roundRect(-9, -128, 18, 16, 6);
  ctx.beginPath();
  ctx.arc(0, -143, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  ctx.moveTo(-21, -151);
  ctx.lineTo(-11, -169);
  ctx.lineTo(-4, -153);
  ctx.lineTo(7, -170);
  ctx.lineTo(13, -153);
  ctx.lineTo(24, -158);
  ctx.quadraticCurveTo(12, -172, -20, -160);
  ctx.closePath();
  ctx.fill();
  if (fighter.fighterData.specialType === "clinch") {
    ctx.fillStyle = c.trim;
    roundRect(-24, -151, 10, 9, 4);
    roundRect(14, -151, 10, 9, 4);
  }
  if (fighter.fighterData.specialType === "roundhouse") {
    ctx.fillStyle = c.trim;
    ctx.beginPath();
    ctx.arc(18, -151, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(5, -146, 5, 3);
  ctx.fillRect(-10, -146, 5, 3);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -136);
  ctx.quadraticCurveTo(0, -132, 8, -136);
  ctx.stroke();

  if (fighter.guardBroken) {
    ctx.fillStyle = "#ff4d76";
    ctx.font = "900 16px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("STUN", 0, -178);
  }
}

function drawLimb(x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
}

function drawEffects(layer) {
  for (const effect of effects) {
    const isBehind = effect.kind === "afterimage" || effect.kind === "dust" || effect.kind === "particle";
    if ((layer === "behind") !== isBehind) continue;

    const alpha = Math.max(0, effect.life / effect.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (effect.kind === "afterimage") {
      ctx.translate(effect.x, effect.y);
      ctx.scale(effect.facing, 1);
      drawFighterBody({ colors: effect.colors, state: "idle", attack: null, blocking: false, guardBroken: false }, 0.42);
    }
    if (effect.kind === "text") {
      ctx.fillStyle = effect.color;
      ctx.font = `900 ${effect.size || 26}px Trebuchet MS`;
      ctx.textAlign = "center";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0,0,0,0.72)";
      ctx.strokeText(effect.text, effect.x, effect.y);
      ctx.fillText(effect.text, effect.x, effect.y);
    }
    if (effect.kind === "flash") {
      ctx.strokeStyle = effect.blocked ? "#68f7ff" : (effect.color || "#fff1a8");
      ctx.fillStyle = effect.blocked ? "rgba(104,247,255,0.2)" : (effect.color ? `${effect.color}44` : "rgba(255,241,168,0.24)");
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        const radius = i % 2 === 0 ? effect.radius : effect.radius * 0.34;
        const px = effect.x + Math.cos(angle) * radius;
        const py = effect.y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (effect.kind === "line") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x - effect.direction * effect.length, effect.y + 6);
      ctx.stroke();
    }
    if (effect.kind === "dust" || effect.kind === "particle") {
      ctx.fillStyle = effect.kind === "dust" ? "rgba(210, 226, 255, 0.55)" : effect.color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawScreenFlash() {
  if (screenFlash <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(0.5, screenFlash);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function gameLoop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (["a", "d", "w", "j", "k", "l", "i", "shift"].includes(key)) event.preventDefault();
  if (gameState !== "playing") return;
  if (key === "w") hop(player);
  if (key === "shift") dash(player);
  if (key === "j") startAttack(player, "punch", enemy);
  if (key === "k") startAttack(player, "kick", enemy);
  if (key === "i") startAttack(player, "special", enemy);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

ui.startButton.addEventListener("click", showCharacterSelect);
ui.restartButton.addEventListener("click", showCharacterSelect);

// Create fighters once so the title screen has a background scene.
player = createFighter(FIGHTERS[0], 260, 1, true);
enemy = createFighter(FIGHTERS[1], 700, -1, false);
renderCharacterCards();
updateUI();
requestAnimationFrame(gameLoop);
