/*
  Cage Spirit - beginner-friendly vanilla JavaScript prototype.
  Edit the STATS and ATTACKS objects below to rebalance the whole game.
*/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  titleScreen: document.getElementById("titleScreen"),
  startButton: document.getElementById("startButton"),
  endOverlay: document.getElementById("endOverlay"),
  restartButton: document.getElementById("restartButton"),
  endTitle: document.getElementById("endTitle"),
  endMessage: document.getElementById("endMessage"),
  roundStatus: document.getElementById("roundStatus"),
  comboText: document.getElementById("comboText"),
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
  staminaRegen: 18,
  walkSpeed: 230,
  dashSpeed: 520,
  dashCost: 20,
  hopCost: 12,
  blockDrainPerSecond: 10,
  blockDamageReduction: 0.72,
  guardBreakLimit: 8,
  arenaPadding: 55,
  groundY: 410
};

const ATTACKS = {
  punch: { damage: 7, stamina: 9, range: 70, windup: 0.08, active: 0.12, recovery: 0.18, knockback: 115, specialGain: 10 },
  kick: { damage: 13, stamina: 17, range: 88, windup: 0.16, active: 0.14, recovery: 0.28, knockback: 185, specialGain: 16 },
  combo: { damage: 20, stamina: 10, range: 98, windup: 0.03, active: 0.16, recovery: 0.22, knockback: 280, specialGain: 24 },
  special: { damage: 32, stamina: 0, range: 150, windup: 0.18, active: 0.25, recovery: 0.38, knockback: 390, specialGain: 0 }
};

const COLORS = {
  player: { suit: "#68f7ff", skin: "#ffd2a6", shorts: "#17203f", aura: "rgba(104, 247, 255, 0.38)" },
  enemy: { suit: "#ff4d76", skin: "#f2b58b", shorts: "#351520", aura: "rgba(255, 77, 118, 0.35)" }
};

const keys = new Set();
let player;
let enemy;
let gameState = "title";
let lastTime = 0;
let hitPause = 0;
let shake = 0;
let comboSequence = [];
let comboTimer = 0;
let comboMessageTimer = 0;
const effects = [];

function createFighter(name, x, facing, colors, controlledByPlayer) {
  return {
    name,
    x,
    y: STATS.groundY,
    width: 42,
    height: 120,
    vx: 0,
    vy: 0,
    facing,
    colors,
    health: STATS.maxHealth,
    stamina: STATS.maxStamina,
    special: 0,
    state: "idle",
    stateTimer: 0,
    attack: null,
    hasHit: false,
    blocking: false,
    guardBroken: false,
    guardBreakTimer: 0,
    dashTimer: 0,
    aiTimer: 0,
    aiDecisionCooldown: 0,
    aiBlockTimer: 0,
    knockbackTimer: 0,
    comboQueued: false,
    controlledByPlayer
  };
}

function resetGame() {
  player = createFighter("Rin", 260, 1, COLORS.player, true);
  enemy = createFighter("Kai", 700, -1, COLORS.enemy, false);
  effects.length = 0;
  comboSequence = [];
  comboTimer = 0;
  comboMessageTimer = 0;
  hitPause = 0;
  shake = 0;
  gameState = "playing";
  ui.endOverlay.classList.add("hidden");
  ui.titleScreen.classList.add("hidden");
  ui.roundStatus.textContent = "Fight!";
  updateUI();
}

function startAttack(fighter, type) {
  if (gameState !== "playing" || fighter.state === "attack" || fighter.guardBroken) return;
  const data = ATTACKS[type];
  if (type === "special" && fighter.special < 100) return;
  if (fighter.stamina < data.stamina) return;

  fighter.stamina -= data.stamina;
  fighter.attack = { type, ...data, elapsed: 0 };
  fighter.state = "attack";
  fighter.stateTimer = data.windup + data.active + data.recovery;
  fighter.hasHit = false;
  fighter.blocking = false;

  if (type === "special") {
    fighter.special = 0;
    addSpeedLines(fighter.x, fighter.y - 70, fighter.facing, 18, fighter.colors.suit);
    shake = Math.max(shake, 10);
  }
}

function dash(fighter) {
  if (fighter.stamina < STATS.dashCost || fighter.guardBroken) return;
  fighter.stamina -= STATS.dashCost;
  fighter.dashTimer = 0.14;
  fighter.vx = fighter.facing * STATS.dashSpeed;
  fighter.blocking = false;
  addSpeedLines(fighter.x, fighter.y - 65, fighter.facing, 8, fighter.colors.suit);
}

function hop(fighter) {
  if (fighter.stamina < STATS.hopCost || fighter.y < STATS.groundY || fighter.guardBroken) return;
  fighter.stamina -= STATS.hopCost;
  fighter.vy = -420;
  fighter.blocking = false;
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
  ui.comboText.textContent = comboMessageTimer > 0 ? ui.comboText.textContent : "";

  handlePlayerInput(dt);
  updateAI(dt);
  updateFighter(player, enemy, dt);
  updateFighter(enemy, player, dt);
  updateEffects(dt);
  checkWinner();
  updateUI();
}

function handlePlayerInput(dt) {
  if (player.knockbackTimer <= 0) {
    player.vx = 0;
    if (keys.has("a")) player.vx -= STATS.walkSpeed;
    if (keys.has("d")) player.vx += STATS.walkSpeed;
    if (player.vx !== 0) player.facing = Math.sign(player.vx);
  }

  player.blocking = keys.has("l") && !player.guardBroken && player.stamina > 0 && player.state !== "attack" && player.knockbackTimer <= 0;
  if (player.blocking) player.stamina -= STATS.blockDrainPerSecond * dt;
}

function updateAI(dt) {
  const distance = enemy.x - player.x;
  const absDistance = Math.abs(distance);
  enemy.facing = distance > 0 ? -1 : 1;
  enemy.aiDecisionCooldown -= dt;
  enemy.aiBlockTimer -= dt;
  if (enemy.knockbackTimer <= 0) enemy.vx = 0;

  if (enemy.guardBroken || enemy.state === "attack" || enemy.knockbackTimer > 0) return;

  enemy.blocking = enemy.aiBlockTimer > 0 && enemy.stamina > STATS.guardBreakLimit;
  if (absDistance > 135) enemy.vx = -Math.sign(distance) * STATS.walkSpeed * 0.72;
  if (absDistance < 75) enemy.vx = Math.sign(distance) * STATS.walkSpeed * 0.55;

  if (enemy.aiDecisionCooldown <= 0) {
    enemy.aiDecisionCooldown = 0.45 + Math.random() * 0.65;
    const playerAttackingNearby = player.state === "attack" && absDistance < 130;

    if (playerAttackingNearby && enemy.stamina > 20 && Math.random() < 0.55) {
      enemy.blocking = true;
      enemy.aiBlockTimer = 0.42;
      enemy.aiDecisionCooldown = 0.35;
      return;
    }

    if (absDistance > 155 && enemy.stamina > 35 && Math.random() < 0.35) {
      dash(enemy);
      return;
    }

    if (absDistance < 120 && enemy.stamina > 14) {
      startAttack(enemy, Math.random() < 0.62 ? "punch" : "kick");
    }
  }

  if (enemy.blocking) enemy.stamina -= STATS.blockDrainPerSecond * dt;
}

function updateFighter(fighter, target, dt) {
  fighter.facing = target.x > fighter.x ? 1 : -1;

  if (fighter.dashTimer > 0) fighter.dashTimer -= dt;
  if (fighter.knockbackTimer > 0) fighter.knockbackTimer -= dt;
  fighter.x += fighter.vx * dt;
  fighter.vy += 1300 * dt;
  fighter.y += fighter.vy * dt;
  if (fighter.y > STATS.groundY) {
    fighter.y = STATS.groundY;
    fighter.vy = 0;
  }

  fighter.x = Math.max(STATS.arenaPadding, Math.min(canvas.width - STATS.arenaPadding, fighter.x));
  fighter.stamina = Math.min(STATS.maxStamina, fighter.stamina + STATS.staminaRegen * dt);

  if (fighter.blocking && fighter.stamina <= STATS.guardBreakLimit) guardBreak(fighter);
  if (fighter.guardBreakTimer > 0) {
    fighter.guardBreakTimer -= dt;
    if (fighter.guardBreakTimer <= 0) fighter.guardBroken = false;
  }

  if (fighter.state === "attack" && fighter.attack) {
    fighter.attack.elapsed += dt;
    fighter.stateTimer -= dt;
    const activeStart = fighter.attack.windup;
    const activeEnd = fighter.attack.windup + fighter.attack.active;
    if (!fighter.hasHit && fighter.attack.elapsed >= activeStart && fighter.attack.elapsed <= activeEnd) {
      tryHit(fighter, target);
    }
    if (fighter.stateTimer <= 0) {
      fighter.state = "idle";
      fighter.attack = null;
      if (fighter.comboQueued) {
        fighter.comboQueued = false;
        startAttack(fighter, "combo");
      }
    }
  }
}

function tryHit(attacker, defender) {
  const attack = attacker.attack;
  const distance = Math.abs(attacker.x - defender.x);
  const facingTarget = Math.sign(defender.x - attacker.x) === attacker.facing;
  if (!facingTarget || distance > attack.range) return;

  attacker.hasHit = true;
  let damage = attack.damage;
  let blocked = false;

  if (defender.blocking && defender.stamina > STATS.guardBreakLimit) {
    blocked = true;
    damage *= 1 - STATS.blockDamageReduction;
    defender.stamina -= attack.damage * 1.35;
    addFloatingText("BLOCK", defender.x, defender.y - 125, "#68f7ff");
    if (defender.stamina <= STATS.guardBreakLimit) guardBreak(defender);
  }

  defender.health = Math.max(0, defender.health - damage);
  defender.vx = attacker.facing * attack.knockback;
  defender.knockbackTimer = attack.type === "special" ? 0.24 : 0.16;
  attacker.special = Math.min(100, attacker.special + attack.specialGain);

  const hitX = defender.x - defender.facing * 24;
  const hitY = defender.y - 76;
  addImpactFlash(hitX, hitY, attack.type, blocked);
  addFloatingText(`-${Math.ceil(damage)}`, defender.x, defender.y - 145, blocked ? "#8be9ff" : "#fff1a8");

  hitPause = attack.type === "punch" ? 0.04 : 0.08;
  if (attack.type === "kick" || attack.type === "combo" || attack.type === "special") shake = Math.max(shake, attack.type === "special" ? 18 : 9);

  if (attacker.controlledByPlayer && !blocked) recordComboHit(attack.type);
}

function recordComboHit(type) {
  if (type === "combo" || type === "special") return;
  comboSequence.push(type);
  comboSequence = comboSequence.slice(-3);
  comboTimer = 1.1;

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
  shake = Math.max(shake, 7);
}

function addFloatingText(text, x, y, color) {
  effects.push({ kind: "text", text, x, y, vy: -58, life: 0.8, maxLife: 0.8, color });
}

function addImpactFlash(x, y, type, blocked) {
  effects.push({ kind: "flash", x, y, life: 0.28, maxLife: 0.28, radius: type === "special" ? 85 : type === "kick" || type === "combo" ? 58 : 36, blocked });
  addSpeedLines(x, y, Math.random() < 0.5 ? 1 : -1, type === "special" ? 22 : 9, blocked ? "#68f7ff" : "#fff1a8");
}

function addSpeedLines(x, y, direction, count, color) {
  for (let i = 0; i < count; i++) {
    effects.push({
      kind: "line",
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 110,
      direction,
      length: 30 + Math.random() * 55,
      life: 0.22 + Math.random() * 0.18,
      maxLife: 0.4,
      color
    });
  }
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    effect.life -= dt;
    if (effect.kind === "text") {
      effect.y += effect.vy * dt;
      effect.vy += 18 * dt;
    }
    if (effect.life <= 0) effects.splice(i, 1);
  }
  shake = Math.max(0, shake - 35 * dt);
}

function checkWinner() {
  if (player.health <= 0 || enemy.health <= 0) {
    gameState = "ended";
    const playerWon = enemy.health <= 0;
    ui.endTitle.textContent = playerWon ? "Victory!" : "Defeat";
    ui.endMessage.textContent = playerWon
      ? "Rin's cage spirit burns bright. Run it back and try new combos!"
      : "Kai takes the round. Guard, dash, and build your special for the rematch!";
    ui.roundStatus.textContent = playerWon ? "Rin Wins" : "Kai Wins";
    ui.endOverlay.classList.remove("hidden");
  }
}

function updateUI() {
  setBar(ui.playerHealth, ui.playerHealthText, player.health, STATS.maxHealth, false);
  setBar(ui.playerStamina, ui.playerStaminaText, player.stamina, STATS.maxStamina, false);
  setBar(ui.playerSpecial, ui.playerSpecialText, player.special, 100, true);
  setBar(ui.enemyHealth, ui.enemyHealthText, enemy.health, STATS.maxHealth, false);
  setBar(ui.enemyStamina, ui.enemyStaminaText, enemy.stamina, STATS.maxStamina, false);
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
  drawFighter(player);
  drawFighter(enemy);
  drawEffects();
  ctx.restore();
}

function drawArena() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#101a3a");
  gradient.addColorStop(0.65, "#080b17");
  gradient.addColorStop(1, "#16111c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Neon cage fence.
  ctx.strokeStyle = "rgba(104, 247, 255, 0.18)";
  ctx.lineWidth = 2;
  for (let x = -canvas.height; x < canvas.width; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 75);
    ctx.lineTo(x + canvas.height, STATS.groundY + 18);
    ctx.stroke();
  }
  for (let x = 0; x < canvas.width + canvas.height; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 75);
    ctx.lineTo(x - canvas.height, STATS.groundY + 18);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  ctx.fillRect(0, STATS.groundY + 18, canvas.width, canvas.height - STATS.groundY);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, STATS.groundY + 45, 360, 70, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(104, 247, 255, 0.09)";
  ctx.font = "900 64px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("CAGE SPIRIT", canvas.width / 2, 190);
}

function drawFighter(fighter) {
  const x = fighter.x;
  const y = fighter.y;
  const lean = fighter.state === "attack" ? fighter.facing * 9 : fighter.vx * 0.018;

  if (fighter.special >= 100) {
    ctx.fillStyle = fighter.colors.aura;
    ctx.beginPath();
    ctx.ellipse(x, y - 64, 58 + Math.sin(performance.now() / 90) * 5, 86, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean * Math.PI / 180);

  // Legs and shorts.
  ctx.fillStyle = fighter.colors.shorts;
  ctx.fillRect(-22, -62, 44, 38);
  ctx.fillStyle = fighter.colors.suit;
  ctx.fillRect(-18, -24, 14, 24);
  ctx.fillRect(7, -24, 14, 24);

  // Torso and head.
  ctx.fillStyle = fighter.colors.suit;
  ctx.fillRect(-24, -107, 48, 50);
  ctx.fillStyle = fighter.colors.skin;
  ctx.beginPath();
  ctx.arc(0, -126, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#141421";
  ctx.fillRect(-15, -143, 30, 10);

  // Arms show guard or attack pose.
  ctx.strokeStyle = fighter.colors.skin;
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (fighter.blocking || fighter.guardBroken) {
    ctx.moveTo(-18, -96); ctx.lineTo(-7, -123);
    ctx.moveTo(18, -96); ctx.lineTo(8, -121);
  } else if (fighter.state === "attack") {
    const reach = fighter.attack.type === "kick" || fighter.attack.type === "combo" ? 52 : 42;
    ctx.moveTo(14, -94); ctx.lineTo(fighter.facing * reach, -104);
    ctx.moveTo(-16, -92); ctx.lineTo(-26, -84);
    if (fighter.attack.type === "kick" || fighter.attack.type === "combo") {
      ctx.moveTo(10, -28); ctx.lineTo(fighter.facing * 58, -48);
    }
  } else {
    ctx.moveTo(-18, -95); ctx.lineTo(-34, -80);
    ctx.moveTo(18, -95); ctx.lineTo(34, -82);
  }
  ctx.stroke();

  if (fighter.guardBroken) {
    ctx.fillStyle = "#ff4d76";
    ctx.font = "900 16px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("STUN", 0, -160);
  }

  ctx.restore();
}

function drawEffects() {
  for (const effect of effects) {
    const alpha = Math.max(0, effect.life / effect.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (effect.kind === "text") {
      ctx.fillStyle = effect.color;
      ctx.font = "900 26px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.strokeText(effect.text, effect.x, effect.y);
      ctx.fillText(effect.text, effect.x, effect.y);
    }
    if (effect.kind === "flash") {
      ctx.strokeStyle = effect.blocked ? "#68f7ff" : "#fff1a8";
      ctx.fillStyle = effect.blocked ? "rgba(104,247,255,0.18)" : "rgba(255,241,168,0.2)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 / 10) * i;
        const radius = i % 2 === 0 ? effect.radius : effect.radius * 0.35;
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
    ctx.restore();
  }
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
  if (key === "j") startAttack(player, "punch");
  if (key === "k") startAttack(player, "kick");
  if (key === "i") startAttack(player, "special");
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

ui.startButton.addEventListener("click", resetGame);
ui.restartButton.addEventListener("click", resetGame);

// Create fighters once so the title screen has a background scene.
player = createFighter("Rin", 260, 1, COLORS.player, true);
enemy = createFighter("Kai", 700, -1, COLORS.enemy, false);
updateUI();
requestAnimationFrame(gameLoop);
