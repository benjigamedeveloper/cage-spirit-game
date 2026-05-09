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
  fighterPreview: document.getElementById("fighterPreview"),
  startButton: document.getElementById("startButton"),
  helpButton: document.getElementById("helpButton"),
  helpPanel: document.getElementById("helpPanel"),
  selectBackButton: document.getElementById("selectBackButton"),
  randomButton: document.getElementById("randomButton"),
  confirmButton: document.getElementById("confirmButton"),
  difficultySelect: document.getElementById("difficultySelect"),
  matchOptions: document.getElementById("matchOptions"),
  matchupSummary: document.getElementById("matchupSummary"),
  timedMatchButton: document.getElementById("timedMatchButton"),
  untimedMatchButton: document.getElementById("untimedMatchButton"),
  optionsBackButton: document.getElementById("optionsBackButton"),
  beginVsButton: document.getElementById("beginVsButton"),
  timerDisplay: document.getElementById("timerDisplay"),
  finalClashOverlay: document.getElementById("finalClashOverlay"),
  playerClashMeter: document.getElementById("playerClashMeter"),
  enemyClashMeter: document.getElementById("enemyClashMeter"),
  playerClashText: document.getElementById("playerClashText"),
  enemyClashText: document.getElementById("enemyClashText"),
  vsOverlay: document.getElementById("vsOverlay"),
  vsPlayer: document.getElementById("vsPlayer"),
  vsEnemy: document.getElementById("vsEnemy"),
  endOverlay: document.getElementById("endOverlay"),
  restartButton: document.getElementById("restartButton"),
  rematchButton: document.getElementById("rematchButton"),
  quickRestartButton: document.getElementById("quickRestartButton"),
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
  enemySpecialText: document.getElementById("enemySpecialText"),
  pauseButton: document.getElementById("pauseButton"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  resumeButton: document.getElementById("resumeButton"),
  pauseRestartButton: document.getElementById("pauseRestartButton"),
  pauseSelectButton: document.getElementById("pauseSelectButton")
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

const MAX_SPECIAL = 100;
// 75 seconds fits the current medium-paced damage, stamina costs, and regen: long enough for specials, short enough to avoid dragging.
const ROUND_TIME_SECONDS = 75;
const FINAL_CLASH_SECONDS = 10;
const DRAW_HEALTH_MARGIN = 4;
const MAX_CLASH_TAPS_PER_SECOND = 7;
const SAFE_COLORS = {
  suit: "#68f7ff",
  skin: "#ffd2a6",
  shorts: "#17203f",
  trim: "#f5fbff",
  hair: "#111a33",
  glove: "#f8fcff",
  shoe: "#87f6ff",
  aura: "rgba(104, 247, 255, 0.38)",
  detail: "#ffffff"
};
const SAFE_FIGHTER = {
  id: "safe-fighter",
  name: "Safe Fighter",
  role: "Balanced fallback",
  style: "Balanced fallback",
  difficulty: "Easy",
  description: "A stable fallback fighter used if roster data is missing.",
  strengths: ["Stable defaults"],
  weaknesses: ["No unique edge"],
  specialName: "Spirit Rush",
  specialDescription: "Uses safe balanced stats to keep the match playable.",
  ability: "Uses safe balanced stats to keep the match playable.",
  specialType: "rush",
  specialDamage: ATTACKS.special.damage,
  aiBehavior: "balanced",
  theme: "Blue/white spirit energy",
  stats: {
    maxHealth: STATS.maxHealth,
    health: STATS.maxHealth,
    maxStamina: STATS.maxStamina,
    stamina: STATS.maxStamina,
    speed: STATS.walkSpeed,
    staminaRegen: STATS.staminaRegen,
    punchDamage: ATTACKS.punch.damage,
    kickDamage: ATTACKS.kick.damage,
    specialDamage: ATTACKS.special.damage,
    dashCost: STATS.dashCost,
    punchCost: ATTACKS.punch.stamina,
    kickCost: ATTACKS.kick.stamina,
    defense: 34,
    blockReduction: STATS.blockDamageReduction
  },
  colors: SAFE_COLORS
};

// Six original anime MMA fighters. Cards, stats, colors, AI, visuals, and specials all read from this data.
const FIGHTERS = [
  {
    id: "spirit-brawler",
    name: "Spirit Brawler",
    role: "Balanced all-rounder",
    style: "Balanced all-rounder",
    difficulty: "Easy",
    description: "A clean fundamentals fighter with steady footwork, crisp boxing, and blue-white spirit pressure.",
    strengths: ["Balanced stats", "Easy to use", "Reliable J,J,K combo"],
    weaknesses: ["No extreme advantage", "Needs meter to shine"],
    specialName: "Spirit Rush",
    specialDescription: "Dashes forward with a multi-hit anime MMA combo. Medium damage, medium knockback, reliable range.",
    ability: "Dashes forward with a multi-hit anime MMA combo. Medium damage, medium knockback, reliable range.",
    specialType: "rush",
    specialDamage: 30,
    aiBehavior: "balanced",
    theme: "Blue/white spirit energy",
    stats: { maxHealth: 100, health: 100, maxStamina: 100, stamina: 100, speed: 235, staminaRegen: 8.5, punchDamage: 7, kickDamage: 14, specialDamage: 30, dashCost: 24, punchCost: 8, kickCost: 18, defense: 34, blockReduction: 0.66 },
    colors: { suit: "#68f7ff", skin: "#ffd2a6", shorts: "#17203f", trim: "#f5fbff", hair: "#111a33", glove: "#f8fcff", shoe: "#87f6ff", aura: "rgba(104, 247, 255, 0.38)", detail: "#ffffff" }
  },
  {
    id: "storm-boxer",
    name: "Storm Boxer",
    role: "Speed striker",
    style: "Speed striker",
    difficulty: "Medium",
    description: "A lightning-fast boxer who darts through angles with bright yellow afterimages and rapid hands.",
    strengths: ["Very fast movement", "Fast punches", "Strong dash pressure"],
    weaknesses: ["Lower health", "Weaker kicks"],
    specialName: "Lightning Step",
    specialDescription: "Quickly dashes through or behind the opponent with lightning afterimages, then lands rapid punches.",
    ability: "Quickly dashes through or behind the opponent with lightning afterimages, then lands rapid punches. Fast but lighter than heavy specials.",
    specialType: "lightning",
    specialDamage: 22,
    aiBehavior: "pressure",
    theme: "Yellow lightning energy",
    stats: { maxHealth: 88, health: 88, maxStamina: 96, stamina: 96, speed: 292, staminaRegen: 9.3, punchDamage: 8, kickDamage: 9, specialDamage: 22, dashCost: 19, punchCost: 7, kickCost: 17, defense: 24, blockReduction: 0.58 },
    colors: { suit: "#ffd84a", skin: "#f0bd8c", shorts: "#2c2308", trim: "#fff6a5", hair: "#fff26a", glove: "#fff7c2", shoe: "#ffef62", aura: "rgba(255, 216, 74, 0.36)", detail: "#ffffff" }
  },
  {
    id: "iron-wrestler",
    name: "Iron Wrestler",
    role: "Heavy grappler",
    style: "Heavy grappler",
    difficulty: "Medium",
    description: "A steel-clad clinch specialist with crushing pressure, heavy strikes, and a stubborn guard.",
    strengths: ["High health", "Strong defense", "Heavy hits"],
    weaknesses: ["Slow movement", "High stamina costs"],
    specialName: "Titan Clinch",
    specialDescription: "Close-range clinch/slam-style impact with big knockback. If too far away, it becomes a weaker lunge.",
    ability: "Close-range clinch/slam-style impact with big knockback. If too far away, it misses or becomes a weaker lunge.",
    specialType: "clinch",
    specialDamage: 35,
    aiBehavior: "grappler",
    theme: "Steel/grey energy",
    stats: { maxHealth: 118, health: 118, maxStamina: 108, stamina: 108, speed: 178, staminaRegen: 7.1, punchDamage: 10, kickDamage: 17, specialDamage: 35, dashCost: 30, punchCost: 11, kickCost: 23, defense: 48, blockReduction: 0.72 },
    colors: { suit: "#9aa3ad", skin: "#d7aa84", shorts: "#242a31", trim: "#dce4ec", hair: "#252a31", glove: "#c6ced7", shoe: "#676f78", aura: "rgba(154, 163, 173, 0.38)", detail: "#f2f6f8" }
  },
  {
    id: "flame-kicker",
    name: "Flame Kicker",
    role: "Kick pressure fighter",
    style: "Kick pressure fighter",
    difficulty: "Medium",
    description: "A fiery roundhouse artist who controls mid range with orange-red kicks and burning pressure.",
    strengths: ["Strong kicks", "Good pressure", "Good mid-range"],
    weaknesses: ["Weaker punches", "Average defense"],
    specialName: "Inferno Roundhouse",
    specialDescription: "Flaming roundhouse kick that creates a short-range shockwave with strong visual impact.",
    ability: "Flaming roundhouse kick that creates a short-range shockwave. Good damage and strong visual impact.",
    specialType: "roundhouse",
    specialDamage: 32,
    aiBehavior: "kicker",
    theme: "Orange/red fire energy",
    stats: { maxHealth: 98, health: 98, maxStamina: 102, stamina: 102, speed: 230, staminaRegen: 8.2, punchDamage: 5, kickDamage: 18, specialDamage: 32, dashCost: 24, punchCost: 7, kickCost: 19, defense: 30, blockReduction: 0.62 },
    colors: { suit: "#ff6b2b", skin: "#ffc195", shorts: "#38120c", trim: "#ffd0a0", hair: "#b61e0d", glove: "#ff9356", shoe: "#ff3f22", aura: "rgba(255, 107, 43, 0.36)", detail: "#ffe08f" }
  },
  {
    id: "shadow-counter",
    name: "Shadow Counter",
    role: "Defensive counter fighter",
    style: "Defensive counter fighter",
    difficulty: "Hard",
    description: "A patient shadow stylist with evasive blocks, purple-black aura, and timing-based punishment.",
    strengths: ["Strong block", "Good stamina", "Rewards timing"],
    weaknesses: ["Weaker direct attacks", "Mistimed special is modest"],
    specialName: "Phantom Reversal",
    specialDescription: "If activated while the opponent is attacking, it becomes a strong counter. Mistimed use is weaker.",
    ability: "If activated while the opponent is attacking, it becomes a strong counter. If used at the wrong time, it becomes a weaker shadow hit.",
    specialType: "reversal",
    specialDamage: 32,
    aiBehavior: "counter",
    theme: "Purple/black shadow energy",
    stats: { maxHealth: 96, health: 96, maxStamina: 112, stamina: 112, speed: 218, staminaRegen: 9.0, punchDamage: 6, kickDamage: 11, specialDamage: 32, dashCost: 22, punchCost: 7, kickCost: 16, defense: 55, blockReduction: 0.78 },
    colors: { suit: "#8b5cff", skin: "#e3b18d", shorts: "#120a1f", trim: "#c9b7ff", hair: "#08050e", glove: "#5b35a6", shoe: "#20102f", aura: "rgba(139, 92, 255, 0.34)", detail: "#2b173f" }
  },
  {
    id: "gravity-monk",
    name: "Gravity Monk",
    role: "Control/tricky fighter",
    style: "Control/tricky fighter",
    difficulty: "Hard",
    description: "A calm space-violet controller who bends distance with floating footwork and pressure fields.",
    strengths: ["Controls distance", "Good defense", "Tricky movement"],
    weaknesses: ["Lower raw damage", "Needs spacing discipline"],
    specialName: "Heavy Field",
    specialDescription: "Creates a temporary gravity zone that slows the opponent and makes dash/attacks cost more stamina.",
    ability: "Creates a temporary gravity zone that slows the opponent and makes their dash and attacks cost more stamina for a few seconds.",
    specialType: "gravity",
    specialDamage: 10,
    aiBehavior: "control",
    theme: "Violet/space gravity energy",
    stats: { maxHealth: 102, health: 102, maxStamina: 108, stamina: 108, speed: 222, staminaRegen: 8.7, punchDamage: 6, kickDamage: 12, specialDamage: 10, dashCost: 22, punchCost: 8, kickCost: 17, defense: 42, blockReduction: 0.7 },
    colors: { suit: "#7d5cff", skin: "#cda27f", shorts: "#15112a", trim: "#bca6ff", hair: "#301d5a", glove: "#a98cff", shoe: "#4c33aa", aura: "rgba(125, 92, 255, 0.36)", detail: "#e7dcff" }
  }
];

const FIGHTER_RATINGS = {
  "spirit-brawler": { ovr: 84, Power: 82, Speed: 82, Defense: 82, Stamina: 84, Technique: 85, Special: 86 },
  "storm-boxer": { ovr: 86, Power: 74, Speed: 95, Defense: 68, Stamina: 82, Technique: 90, Special: 88 },
  "iron-wrestler": { ovr: 85, Power: 94, Speed: 58, Defense: 92, Stamina: 80, Technique: 76, Special: 87 },
  "flame-kicker": { ovr: 85, Power: 88, Speed: 84, Defense: 74, Stamina: 80, Technique: 84, Special: 89 },
  "shadow-counter": { ovr: 87, Power: 76, Speed: 82, Defense: 91, Stamina: 88, Technique: 94, Special: 90 },
  "gravity-monk": { ovr: 86, Power: 72, Speed: 78, Defense: 88, Stamina: 86, Technique: 92, Special: 93 }
};

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
let pausedStatusText = "";
let selectedFighterId = null;
let selectedMatchType = "timed";
let matchTimeRemaining = ROUND_TIME_SECONDS;
let finalClashActive = false;
let finalClashTriggered = false;
let finalClashResolved = false;
let playerClashPower = 0;
let enemyClashPower = 0;
let clashTapWindowStart = 0;
let clashTapCount = 0;
let lastPlayerId = "spirit-brawler";
let lastEnemyId = "storm-boxer";
let aiDifficulty = "normal";
let introTimer = 0;
let pendingStart = null;
const effects = [];

function safeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function clampNumber(value, min, max, fallback = min) {
  const safeValue = safeNumber(value, fallback);
  const safeMin = safeNumber(min, fallback);
  const safeMax = Math.max(safeMin, safeNumber(max, safeMin));
  return Math.max(safeMin, Math.min(safeMax, safeValue));
}

function normalizeFighterData(fighterData = {}) {
  const sourceStats = fighterData.stats || {};
  const maxHealth = Math.max(1, safeNumber(sourceStats.maxHealth, safeNumber(sourceStats.health, SAFE_FIGHTER.stats.maxHealth)));
  const maxStamina = Math.max(1, safeNumber(sourceStats.maxStamina, safeNumber(sourceStats.stamina, SAFE_FIGHTER.stats.maxStamina)));
  const colors = { ...SAFE_COLORS, ...(fighterData.colors || {}) };

  const ratingFallback = FIGHTER_RATINGS[fighterData.id] || { ovr: 80, Power: 80, Speed: 80, Defense: 80, Stamina: 80, Technique: 80, Special: 80 };

  return {
    ...SAFE_FIGHTER,
    ...fighterData,
    name: fighterData.name || SAFE_FIGHTER.name,
    role: fighterData.role || fighterData.style || SAFE_FIGHTER.role,
    style: fighterData.style || fighterData.role || SAFE_FIGHTER.style,
    difficulty: fighterData.difficulty || SAFE_FIGHTER.difficulty,
    description: fighterData.description || SAFE_FIGHTER.description,
    strengths: Array.isArray(fighterData.strengths) ? fighterData.strengths : SAFE_FIGHTER.strengths,
    weaknesses: Array.isArray(fighterData.weaknesses) ? fighterData.weaknesses : SAFE_FIGHTER.weaknesses,
    specialName: fighterData.specialName || SAFE_FIGHTER.specialName,
    specialDescription: fighterData.specialDescription || fighterData.ability || SAFE_FIGHTER.specialDescription,
    specialType: fighterData.specialType || SAFE_FIGHTER.specialType,
    specialDamage: Math.max(0, safeNumber(fighterData.specialDamage, SAFE_FIGHTER.specialDamage)),
    aiBehavior: fighterData.aiBehavior || SAFE_FIGHTER.aiBehavior,
    theme: fighterData.theme || SAFE_FIGHTER.theme,
    ratings: { ...ratingFallback, ...(fighterData.ratings || {}) },
    stats: {
      ...SAFE_FIGHTER.stats,
      ...sourceStats,
      maxHealth,
      health: clampNumber(safeNumber(sourceStats.health, maxHealth), 0, maxHealth, maxHealth),
      maxStamina,
      stamina: clampNumber(safeNumber(sourceStats.stamina, maxStamina), 0, maxStamina, maxStamina),
      speed: Math.max(1, safeNumber(sourceStats.speed, SAFE_FIGHTER.stats.speed)),
      staminaRegen: Math.max(0, safeNumber(sourceStats.staminaRegen, SAFE_FIGHTER.stats.staminaRegen)),
      punchDamage: Math.max(0, safeNumber(sourceStats.punchDamage, SAFE_FIGHTER.stats.punchDamage)),
      kickDamage: Math.max(0, safeNumber(sourceStats.kickDamage, SAFE_FIGHTER.stats.kickDamage)),
      specialDamage: Math.max(0, safeNumber(sourceStats.specialDamage, safeNumber(fighterData.specialDamage, SAFE_FIGHTER.stats.specialDamage))),
      dashCost: Math.max(0, safeNumber(sourceStats.dashCost, SAFE_FIGHTER.stats.dashCost)),
      punchCost: Math.max(0, safeNumber(sourceStats.punchCost, SAFE_FIGHTER.stats.punchCost)),
      kickCost: Math.max(0, safeNumber(sourceStats.kickCost, SAFE_FIGHTER.stats.kickCost)),
      defense: clampNumber(sourceStats.defense, 0, 100, SAFE_FIGHTER.stats.defense),
      blockReduction: clampNumber(sourceStats.blockReduction, 0, 0.95, SAFE_FIGHTER.stats.blockReduction)
    },
    colors
  };
}

function sanitizeFighter(fighter, fallbackX) {
  if (!fighter) return;
  fighter.fighterData = normalizeFighterData(fighter.fighterData);
  fighter.name = fighter.name || fighter.fighterData.name;
  fighter.colors = { ...SAFE_COLORS, ...(fighter.colors || fighter.fighterData.colors) };
  fighter.maxHealth = Math.max(1, safeNumber(fighter.maxHealth, fighter.fighterData.stats.maxHealth));
  fighter.maxStamina = Math.max(1, safeNumber(fighter.maxStamina, fighter.fighterData.stats.maxStamina));
  fighter.maxSpecial = Math.max(1, safeNumber(fighter.maxSpecial, MAX_SPECIAL));
  fighter.health = clampNumber(fighter.health, 0, fighter.maxHealth, fighter.maxHealth);
  fighter.stamina = clampNumber(fighter.stamina, 0, fighter.maxStamina, fighter.maxStamina);
  fighter.special = clampNumber(fighter.special, 0, fighter.maxSpecial, 0);
  fighter.x = clampNumber(fighter.x, STATS.arenaPadding, canvas.width - STATS.arenaPadding, fallbackX);
  fighter.y = clampNumber(fighter.y, 0, STATS.groundY, STATS.groundY);
  fighter.vx = clampNumber(fighter.vx, -1200, 1200, 0);
  fighter.vy = clampNumber(fighter.vy, -1200, 1400, 0);
  fighter.facing = fighter.facing === -1 ? -1 : 1;
  fighter.moveIntent = fighter.moveIntent === -1 ? -1 : fighter.moveIntent === 1 ? 1 : fighter.facing;
  fighter.stateTimer = Math.max(0, safeNumber(fighter.stateTimer, 0));
  fighter.dashTimer = Math.max(0, safeNumber(fighter.dashTimer, 0));
  fighter.dashCooldown = Math.max(0, safeNumber(fighter.dashCooldown, 0));
  fighter.specialCooldown = Math.max(0, safeNumber(fighter.specialCooldown, 0));
  fighter.knockbackTimer = Math.max(0, safeNumber(fighter.knockbackTimer, 0));
  fighter.hitReactTimer = Math.max(0, safeNumber(fighter.hitReactTimer, 0));
  fighter.lowStaminaTimer = Math.max(0, safeNumber(fighter.lowStaminaTimer, 0));
  fighter.guardBreakTimer = Math.max(0, safeNumber(fighter.guardBreakTimer, 0));
  fighter.aiDecisionCooldown = Math.max(0, safeNumber(fighter.aiDecisionCooldown, 0));
  fighter.aiBlockTimer = Math.max(0, safeNumber(fighter.aiBlockTimer, 0));
  fighter.aiStrafeTimer = Math.max(0, safeNumber(fighter.aiStrafeTimer, 0));
  fighter.aiSpecialPatience = safeNumber(fighter.aiSpecialPatience, 0.6);
  fighter.gravityTimer = Math.max(0, safeNumber(fighter.gravityTimer, 0));
  fighter.gravitySource = fighter.gravitySource || null;
  if (!Array.isArray(fighter.hitStepsDone)) fighter.hitStepsDone = [];
  if (!fighter.attack || typeof fighter.attack !== "object") fighter.attack = null;
  if (fighter.attack) {
    fighter.attack.elapsed = Math.max(0, safeNumber(fighter.attack.elapsed, 0));
    fighter.attack.windup = Math.max(0, safeNumber(fighter.attack.windup, ATTACKS.punch.windup));
    fighter.attack.active = Math.max(0, safeNumber(fighter.attack.active, ATTACKS.punch.active));
    fighter.attack.recovery = Math.max(0, safeNumber(fighter.attack.recovery, ATTACKS.punch.recovery));
    fighter.attack.range = Math.max(1, safeNumber(fighter.attack.range, ATTACKS.punch.range));
  }
  if (!["idle", "attack"].includes(fighter.state)) fighter.state = "idle";
}

function setPaused(paused) {
  if (paused) {
    if (gameState !== "playing") return;
    pausedStatusText = ui.roundStatus.textContent;
    gameState = "paused";
    keys.clear();
    ui.pauseOverlay.classList.remove("hidden");
    ui.pauseButton.textContent = "Resume";
    ui.roundStatus.textContent = "Paused";
    return;
  }

  if (gameState === "paused") {
    gameState = "playing";
    ui.roundStatus.textContent = pausedStatusText || `${player.name} vs ${enemy.name}`;
  }
  ui.pauseOverlay.classList.add("hidden");
  ui.pauseButton.textContent = "Pause";
}

function togglePause() {
  if (gameState === "playing") setPaused(true);
  else if (gameState === "paused") setPaused(false);
}

function createFighter(fighterData, x, facing, controlledByPlayer) {
  const safeData = normalizeFighterData(fighterData);
  const stats = safeData.stats;
  const safeX = clampNumber(x, STATS.arenaPadding, canvas.width - STATS.arenaPadding, controlledByPlayer ? 260 : 700);
  const safeFacing = facing === -1 ? -1 : 1;
  return {
    name: safeData.name,
    fighterData: safeData,
    x: safeX,
    y: STATS.groundY,
    width: 52,
    height: 134,
    vx: 0,
    vy: 0,
    facing: safeFacing,
    moveIntent: safeFacing,
    colors: safeData.colors,
    maxHealth: stats.maxHealth,
    maxStamina: stats.maxStamina,
    maxSpecial: MAX_SPECIAL,
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
    gravityTimer: 0,
    gravitySource: null,
    comboQueued: false,
    controlledByPlayer
  };
}
function renderCharacterCards() {
  ui.fighterCards.innerHTML = "";
  for (const rosterFighter of FIGHTERS) {
    const fighter = normalizeFighterData(rosterFighter);
    const card = document.createElement("button");
    card.className = `fighter-card${fighter.id === selectedFighterId ? " selected" : ""}`;
    card.type = "button";
    card.dataset.fighterId = fighter.id;
    card.style.setProperty("--card-accent", fighter.colors.suit);
    card.style.setProperty("--card-dark", fighter.colors.shorts);
    card.innerHTML = `
      <div class="rating-badge"><b>${fighter.ratings.ovr}</b><span>OVR</span></div>
      <div class="fighter-portrait" aria-hidden="true"><span></span></div>
      <div class="card-topline"><span>${fighter.difficulty}</span><span>${fighter.theme}</span></div>
      <h3>${fighter.name}</h3>
      <p class="fighter-style">${fighter.role}</p>
      <p class="fighter-desc">${fighter.description}</p>
      <div class="stat-bars small-stats">${buildStatBars(fighter)}</div>
      <p class="fighter-special">Special Move: ${fighter.specialName}</p>
      <p class="ability-desc"><strong>Strengths:</strong> ${fighter.strengths.join(", ")}</p>
      <p class="ability-desc"><strong>Weaknesses:</strong> ${fighter.weaknesses.join(", ")}</p>
      <p class="ability-desc">${fighter.specialDescription}</p>
      <span class="choose-label">${fighter.id === selectedFighterId ? "Selected" : "Select Fighter"}</span>
    `;
    card.addEventListener("click", () => selectFighter(fighter.id));
    ui.fighterCards.appendChild(card);
  }
}

function statPercent(label, fighter) {
  const ratings = fighter.ratings || FIGHTER_RATINGS[fighter.id] || {};
  const value = ratings[label];
  return clampNumber(value, 0, 100, 80);
}

function buildStatBars(fighter) {
  return ["Power", "Speed", "Defense", "Stamina", "Technique", "Special"].map((label) => {
    const percent = statPercent(label, fighter);
    return `<div class="mini-stat"><span>${label}</span><b>${Math.round(percent)}</b><i><em style="width:${percent}%"></em></i></div>`;
  }).join("");
}

function selectFighter(fighterId) {
  const exists = FIGHTERS.some((fighter) => fighter.id === fighterId);
  if (!exists) return;
  selectedFighterId = fighterId;
  ui.confirmButton.disabled = false;
  ui.confirmButton.textContent = "Confirm Fighter";
  ui.confirmButton.classList.add("confirm-ready");
  renderCharacterCards();
  updateFighterPreview();
}

function hideMainScreens() {
  ui.titleScreen.classList.add("hidden");
  ui.characterSelect.classList.add("hidden");
  ui.matchOptions.classList.add("hidden");
  ui.vsOverlay.classList.add("hidden");
}

function updateFighterPreview() {
  const fighter = normalizeFighterData(FIGHTERS.find((item) => item.id === selectedFighterId) || FIGHTERS[0]);
  const rivals = FIGHTERS.map(normalizeFighterData).filter((item) => item.id !== fighter.id);
  const previewRival = normalizeFighterData(rivals[0] || FIGHTERS[1] || SAFE_FIGHTER);
  ui.fighterPreview.style.setProperty("--card-accent", fighter.colors.suit);
  ui.fighterPreview.style.setProperty("--rival-accent", previewRival.colors.suit);
  ui.fighterPreview.innerHTML = `
    <p class="eyebrow">Selected Fighter</p>
    <div class="preview-versus">
      <div><strong>${fighter.name}</strong><span>${fighter.role}</span></div>
      <b>VS</b>
      <div><strong>Random Rival</strong><span>Preview: ${previewRival.name}</span></div>
    </div>
    <h3>${fighter.specialName}</h3>
    <p>${fighter.specialDescription}</p>
    <div class="stat-bars">${buildStatBars(fighter)}</div>
    <div class="trait-grid">
      <div><strong>Strengths</strong><ul>${fighter.strengths.map((item) => `<li>${item}</li>`).join("")}</ul></div>
      <div><strong>Weaknesses</strong><ul>${fighter.weaknesses.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    </div>
    <p class="preview-note">AI behavior: ${fighter.aiBehavior}. Difficulty: ${fighter.difficulty}.</p>
  `;
}

function showTitleScreen() {
  setPaused(false);
  keys.clear();
  gameState = "title";
  pendingStart = null;
  finalClashActive = false;
  ui.finalClashOverlay.classList.add("hidden");
  ui.endOverlay.classList.add("hidden");
  hideMainScreens();
  ui.titleScreen.classList.remove("hidden");
  ui.timerDisplay.classList.add("hidden");
  ui.roundStatus.textContent = "Press Start";
  ui.comboText.textContent = "";
}

function showCharacterSelect() {
  setPaused(false);
  keys.clear();
  gameState = "select";
  pendingStart = null;
  introTimer = 0;
  finalClashActive = false;
  ui.finalClashOverlay.classList.add("hidden");
  ui.endOverlay.classList.add("hidden");
  hideMainScreens();
  ui.characterSelect.classList.remove("hidden");
  ui.roundStatus.textContent = "Choose Fighter";
  ui.comboText.textContent = "";
  ui.timerDisplay.classList.add("hidden");
  ui.confirmButton.disabled = !selectedFighterId;
  ui.confirmButton.classList.toggle("confirm-ready", Boolean(selectedFighterId));
  ui.confirmButton.textContent = selectedFighterId ? "Confirm Fighter" : "Select a Fighter";
  renderCharacterCards();
  updateFighterPreview();
}

function confirmSelection() {
  if (!selectedFighterId) {
    ui.roundStatus.textContent = "Select a Fighter First";
    return;
  }
  aiDifficulty = ui.difficultySelect.value || "normal";
  showMatchOptions();
}

function showMatchOptions() {
  const playerData = normalizeFighterData(FIGHTERS.find((fighter) => fighter.id === selectedFighterId) || FIGHTERS[0]);
  const rivalData = chooseEnemyData(playerData.id);
  lastEnemyId = rivalData.id;
  hideMainScreens();
  ui.endOverlay.classList.add("hidden");
  ui.matchOptions.classList.remove("hidden");
  ui.matchupSummary.textContent = `${playerData.name} vs ${rivalData.name}`;
  gameState = "options";
  updateMatchTypeButtons();
}

function chooseMatchType(type) {
  selectedMatchType = type === "untimed" ? "untimed" : "timed";
  updateMatchTypeButtons();
}

function updateMatchTypeButtons() {
  const timed = selectedMatchType === "timed";
  ui.timedMatchButton.classList.toggle("selected", timed);
  ui.untimedMatchButton.classList.toggle("selected", !timed);
  ui.timedMatchButton.setAttribute("aria-pressed", String(timed));
  ui.untimedMatchButton.setAttribute("aria-pressed", String(!timed));
}

function chooseEnemyData(playerId, fixedEnemyId = null) {
  const normalized = FIGHTERS.map(normalizeFighterData);
  if (fixedEnemyId) {
    const fixed = normalized.find((fighter) => fighter.id === fixedEnemyId && fighter.id !== playerId);
    if (fixed) return fixed;
  }
  const rivals = normalized.filter((fighter) => fighter.id !== playerId);
  return normalizeFighterData(rivals[Math.floor(Math.random() * rivals.length)] || normalized[1] || SAFE_FIGHTER);
}

function beginVsScreen() {
  if (!selectedFighterId) return showCharacterSelect();
  resetGame(selectedFighterId, lastEnemyId || null);
}

function resetGame(selectedFighterIdToUse = selectedFighterId || "spirit-brawler", fixedEnemyId = null) {
  const playerData = normalizeFighterData(FIGHTERS.find((fighter) => fighter.id === selectedFighterIdToUse) || FIGHTERS[0]);
  const enemyData = chooseEnemyData(playerData.id, fixedEnemyId);

  player = createFighter(playerData, 260, 1, true);
  enemy = createFighter(enemyData, 700, -1, false);
  lastPlayerId = playerData.id;
  lastEnemyId = enemyData.id;
  effects.length = 0;
  comboSequence = [];
  comboTimer = 0;
  comboMessageTimer = 0;
  hitPause = 0;
  shake = 0;
  screenFlash = 0;
  keys.clear();
  matchTimeRemaining = ROUND_TIME_SECONDS;
  finalClashActive = false;
  finalClashTriggered = false;
  finalClashResolved = false;
  playerClashPower = 0;
  enemyClashPower = 0;
  clashTapWindowStart = 0;
  clashTapCount = 0;
  ui.finalClashOverlay.classList.add("hidden");
  updateClashUI();
  pendingStart = { playerName: player.name, enemyName: enemy.name };
  introTimer = 1.7;
  gameState = "intro";
  setPaused(false);
  ui.endOverlay.classList.add("hidden");
  hideMainScreens();
  ui.vsPlayer.textContent = player.name;
  ui.vsEnemy.textContent = enemy.name;
  ui.vsOverlay.classList.remove("hidden");
  ui.roundStatus.textContent = selectedMatchType === "timed" ? `VS Intro • ${ROUND_TIME_SECONDS}s Timed` : "VS Intro • Untimed";
  ui.timerDisplay.classList.toggle("hidden", selectedMatchType !== "timed");
  ui.timerDisplay.classList.remove("danger");
  ui.timerDisplay.textContent = String(ROUND_TIME_SECONDS);
  addFloatingText(`${playerData.specialName} ready at 100%`, canvas.width / 2, 92, player.colors.suit, 22, 1.2);
  updateUI();
}

function startIntroFight() {
  if (!pendingStart) return;
  gameState = "playing";
  ui.vsOverlay.classList.add("hidden");
  ui.roundStatus.textContent = selectedMatchType === "timed" ? `${player.name} vs ${enemy.name} • Timed` : `${player.name} vs ${enemy.name} • Untimed`;
  pendingStart = null;
}

function rematch() {
  resetGame(lastPlayerId || selectedFighterId, lastEnemyId || null);
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
  sanitizeFighter(fighter, fighter.controlledByPlayer ? 260 : 700);
  if (type === "special" && fighter.special < fighter.maxSpecial) {
    if (fighter.controlledByPlayer) addFloatingText("SPECIAL NOT READY", fighter.x, fighter.y - 170, "#f7d84a", 19);
    return;
  }
  const gravityTax = fighter.gravityTimer > 0 ? 1.35 : 1;
  data.stamina = Math.ceil(data.stamina * gravityTax);
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
  fighter.fighterData = normalizeFighterData(fighter.fighterData);
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
  const specialRange = specialType === "lightning" ? 240 : specialType === "roundhouse" ? 155 : specialType === "clinch" ? 138 : specialType === "gravity" ? 210 : 175;
  return { ...ATTACKS.special, damage: stats.specialDamage, stamina: 28, range: specialRange, specialType, countered };
}
function getDashSpeed(fighter) {
  const speed = safeNumber(fighter.fighterData?.stats?.speed, STATS.walkSpeed);
  return STATS.dashSpeed * (speed / STATS.walkSpeed);
}

function dash(fighter) {
  if (gameState !== "playing" || fighter.guardBroken || fighter.state === "attack") return;
  if (fighter.dashCooldown > 0) return;
  const dashCost = safeNumber(fighter.fighterData?.stats?.dashCost, STATS.dashCost) * (fighter.gravityTimer > 0 ? 1.45 : 1);
  if (fighter.stamina < dashCost) {
    showLowStamina(fighter, "DASH");
    return;
  }

  // Dash follows the currently pressed direction if there is one, otherwise facing.
  const direction = fighter.moveIntent || fighter.facing;
  fighter.stamina -= dashCost;
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
  if (gameState === "intro") {
    introTimer = Math.max(0, introTimer - dt);
    updateEffects(dt);
    updateUI();
    if (introTimer <= 0) startIntroFight();
    return;
  }
  if (gameState !== "playing") return;

  sanitizeFighter(player, 260);
  sanitizeFighter(enemy, 700);

  if (hitPause > 0) {
    hitPause -= dt;
    updateEffects(dt);
    draw();
    return;
  }

  comboTimer = Math.max(0, safeNumber(comboTimer, 0) - dt);
  comboMessageTimer = Math.max(0, safeNumber(comboMessageTimer, 0) - dt);
  if (comboTimer <= 0) comboSequence = [];
  if (comboMessageTimer <= 0) ui.comboText.textContent = "";

  handlePlayerInput(dt);
  updateAI(dt);
  updateFighter(player, enemy, dt);
  updateFighter(enemy, player, dt);
  updateTimedMatch(dt);
  updateEffects(dt);
  sanitizeFighter(player, 260);
  sanitizeFighter(enemy, 700);
  checkWinner();
  updateUI();
}


function updateTimedMatch(dt) {
  if (selectedMatchType !== "timed" || gameState !== "playing") return;
  matchTimeRemaining = clampNumber(matchTimeRemaining - dt, 0, ROUND_TIME_SECONDS, ROUND_TIME_SECONDS);
  if (!finalClashTriggered && matchTimeRemaining <= FINAL_CLASH_SECONDS) startFinalClash();
  if (finalClashActive) updateFinalClash(dt);
  if (matchTimeRemaining <= 0) {
    if (finalClashActive && !finalClashResolved) resolveFinalClash();
    decideTimedWinner();
  }
}

function startFinalClash() {
  finalClashTriggered = true;
  finalClashActive = true;
  finalClashResolved = false;
  playerClashPower = 0;
  enemyClashPower = 0;
  clashTapWindowStart = performance.now();
  clashTapCount = 0;
  ui.finalClashOverlay.classList.remove("hidden");
  ui.roundStatus.textContent = "FINAL CLASH!";
  screenFlash = 0.5;
  shake = Math.max(shake, 18);
  addFloatingText("FINAL CLASH!", canvas.width / 2, 110, "#fff1a8", 44, 1.2);
  addSpeedLines(canvas.width / 2, 250, 1, 34, "#fff1a8");
  addSpeedLines(canvas.width / 2, 250, -1, 34, "#ff4d76");
  updateClashUI();
}

function updateFinalClash(dt) {
  const difficulty = aiDifficulty === "hard" ? 1.2 : aiDifficulty === "easy" ? 0.78 : 1;
  const staminaRatio = enemy.stamina / Math.max(1, enemy.maxStamina);
  const healthBonus = enemy.health < enemy.maxHealth * 0.35 ? 1.08 : 1;
  const type = enemy.fighterData.specialType;
  const typeRate = type === "lightning" ? 14 : type === "clinch" ? 8.5 : type === "reversal" ? (enemy.blocking ? 14 : 10.5) : type === "gravity" ? 10 : 11.5;
  enemyClashPower = clampNumber(enemyClashPower + typeRate * difficulty * (0.72 + staminaRatio * 0.56) * healthBonus * dt, 0, 100, 0);
  if (player.gravityTimer > 0 || enemy.fighterData.specialType === "gravity") playerClashPower = clampNumber(playerClashPower - 2.5 * dt, 0, 100, 0);
  if (Math.random() < 0.42) {
    effects.push({ kind: "particle", x: canvas.width / 2 + (Math.random() - 0.5) * 520, y: 140 + Math.random() * 240, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 80, radius: 3 + Math.random() * 6, life: 0.42, maxLife: 0.42, color: Math.random() < 0.5 ? player.colors.suit : enemy.colors.suit });
  }
  updateClashUI();
}

function handleClashTap() {
  if (!finalClashActive || gameState !== "playing") return;
  const now = performance.now();
  if (now - clashTapWindowStart >= 1000) {
    clashTapWindowStart = now;
    clashTapCount = 0;
  }
  if (clashTapCount >= MAX_CLASH_TAPS_PER_SECOND) return;
  clashTapCount += 1;
  const playerType = player.fighterData.specialType;
  const typeGain = playerType === "lightning" ? 3.2 : playerType === "clinch" ? 2.15 : playerType === "gravity" ? 2.4 : 2.75;
  const staminaGain = 0.72 + (player.stamina / Math.max(1, player.maxStamina)) * 0.48;
  const gravityPenalty = enemy.fighterData.specialType === "gravity" || player.gravityTimer > 0 ? 0.84 : 1;
  playerClashPower = clampNumber(playerClashPower + typeGain * staminaGain * gravityPenalty, 0, 100, 0);
  addAuraBurst(player.x, player.y - 82, player.colors.suit, 4);
  updateClashUI();
}

function updateClashUI() {
  const p = clampNumber(playerClashPower, 0, 100, 0);
  const e = clampNumber(enemyClashPower, 0, 100, 0);
  ui.playerClashMeter.style.width = `${p}%`;
  ui.enemyClashMeter.style.width = `${e}%`;
  ui.playerClashText.textContent = `${Math.round(p)}%`;
  ui.enemyClashText.textContent = `${Math.round(e)}%`;
}

function resolveFinalClash() {
  finalClashResolved = true;
  finalClashActive = false;
  ui.finalClashOverlay.classList.add("hidden");
  const diff = playerClashPower - enemyClashPower;
  if (Math.abs(diff) < 8) {
    player.vx = -player.facing * 260;
    enemy.vx = -enemy.facing * 260;
    addFloatingText("CLASH DRAW!", canvas.width / 2, 138, "#eef4ff", 34, 1.1);
    shake = Math.max(shake, 16);
    return;
  }
  const attacker = diff > 0 ? player : enemy;
  const defender = diff > 0 ? enemy : player;
  const impactBonus = attacker.fighterData.specialType === "clinch" ? 4 : attacker.fighterData.specialType === "roundhouse" ? 5 : attacker.fighterData.specialType === "lightning" ? 1 : 2;
  const damage = clampNumber(10 + Math.abs(diff) * 0.14 + impactBonus, 10, 25, 14);
  defender.health = clampNumber(defender.health - damage, 0, defender.maxHealth, defender.maxHealth);
  defender.vx = attacker.facing * (280 + damage * 11);
  defender.knockbackTimer = 0.42;
  defender.hitReactTimer = 0.32;
  addFloatingText(`${attacker.name} FINAL COMBO!`, canvas.width / 2, 132, attacker.colors.suit, 30, 1.25);
  addFloatingText(`-${Math.ceil(damage)}`, defender.x, defender.y - 150, "#fff1a8", 26, 1);
  addImpactFlash(defender.x, defender.y - 86, "special", false, attacker.colors.suit);
  addAuraBurst(attacker.x, attacker.y - 80, attacker.colors.suit, 22);
  screenFlash = 0.55;
  shake = Math.max(shake, 26);
}

function decideTimedWinner() {
  if (gameState !== "playing") return;
  const diff = player.health - enemy.health;
  if (Math.abs(diff) <= DRAW_HEALTH_MARGIN) endMatch(null, "Draw");
  else endMatch(diff > 0 ? player : enemy, "Won by Decision");
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
    if (player.dashTimer <= 0) player.vx = input * safeNumber(player.fighterData?.stats?.speed, STATS.walkSpeed) * (player.gravityTimer > 0 ? 0.58 : 1);
  }

  player.blocking = keys.has("l") && !player.guardBroken && player.stamina > 0 && player.state !== "attack" && player.knockbackTimer <= 0;
  if (player.blocking) player.stamina -= STATS.blockDrainPerSecond * dt;
}

function updateAI(dt) {
  const difficultyFactor = aiDifficulty === "hard" ? 1.25 : aiDifficulty === "easy" ? 0.72 : 1;
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
    const aiSpeed = safeNumber(enemy.fighterData?.stats?.speed, STATS.walkSpeed) * (enemy.gravityTimer > 0 ? 0.58 : 1);
    const behavior = enemy.fighterData.aiBehavior;
    const idealRange = behavior === "grappler" ? 84 : behavior === "kicker" ? 128 : behavior === "control" ? 168 : 116;
    if (absDistance > idealRange + 30) enemy.vx = directionToPlayer * aiSpeed * (behavior === "pressure" ? 1.02 : 0.86);
    else if (absDistance < idealRange - 42) enemy.vx = -directionToPlayer * aiSpeed * (behavior === "control" ? 0.82 : 0.62);
    else if (enemy.aiStrafeTimer > 0) enemy.vx = enemy.aiStrafeDirection * aiSpeed * 0.32;
  }

  if (enemy.aiDecisionCooldown <= 0) {
    enemy.aiDecisionCooldown = (0.24 + Math.random() * 0.36) / difficultyFactor;
    const playerAttackingNearby = player.state === "attack" && absDistance < 135;

    if (enemy.aiStrafeTimer <= 0) {
      enemy.aiStrafeTimer = 0.35 + Math.random() * 0.45;
      enemy.aiStrafeDirection = Math.random() < 0.5 ? directionToPlayer : -directionToPlayer;
    }

    const behavior = enemy.fighterData.aiBehavior;
    const blockChance = behavior === "counter" ? 0.82 : behavior === "grappler" ? 0.5 : 0.62;
    if (playerAttackingNearby && enemy.stamina > 18 && Math.random() < blockChance * difficultyFactor) {
      enemy.blocking = true;
      enemy.aiBlockTimer = 0.34 + Math.random() * 0.24;
      return;
    }

    const aiDashCost = safeNumber(enemy.fighterData?.stats?.dashCost, STATS.dashCost);
    const dashChance = behavior === "pressure" ? 0.62 : behavior === "grappler" ? 0.52 : behavior === "control" ? 0.24 : 0.42;
    if (absDistance > 170 && enemy.stamina > aiDashCost + 8 && Math.random() < dashChance * difficultyFactor) {
      enemy.moveIntent = directionToPlayer;
      dash(enemy);
      return;
    }

    if (absDistance > 95 && absDistance < 165 && enemy.stamina > aiDashCost + 18 && Math.random() < (behavior === "pressure" ? 0.38 : 0.22) * difficultyFactor) {
      enemy.moveIntent = directionToPlayer;
      dash(enemy);
      return;
    }

    const wantsCounter = enemy.fighterData.specialType === "reversal" && player.state === "attack" && absDistance < 160;
    const specialRangeOk = enemy.fighterData.specialType === "gravity" ? absDistance < 230 : absDistance < 165;
    if (enemy.special >= enemy.maxSpecial && enemy.stamina > 32 && enemy.aiSpecialPatience <= 0 && (wantsCounter || (specialRangeOk && Math.random() < 0.28 * difficultyFactor))) {
      enemy.aiSpecialPatience = 1.8 + Math.random() * 2.2;
      startAttack(enemy, "special", player);
      return;
    }

    const attackRange = behavior === "kicker" ? 148 : behavior === "grappler" ? 105 : 125;
    if (absDistance < attackRange && enemy.stamina > 12 && Math.random() < 0.72 * difficultyFactor) {
      const kickBias = behavior === "kicker" ? 0.68 : behavior === "pressure" ? 0.2 : 0.34;
      startAttack(enemy, Math.random() < kickBias ? "kick" : "punch", player);
    }
  }

  if (enemy.blocking) enemy.stamina -= STATS.blockDrainPerSecond * dt;
}

function updateFighter(fighter, target, dt) {
  sanitizeFighter(fighter, fighter.controlledByPlayer ? 260 : 700);
  sanitizeFighter(target, target.controlledByPlayer ? 260 : 700);
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
  if (fighter.gravityTimer > 0) {
    fighter.gravityTimer -= dt;
    if (Math.random() < 0.28) effects.push({ kind: "gravity", x: fighter.x, y: fighter.y - 78, radius: 58 + Math.random() * 28, life: 0.42, maxLife: 0.42, color: fighter.gravitySource || "#7d5cff" });
  }
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
  fighter.stamina = clampNumber(fighter.stamina + safeNumber(fighter.fighterData?.stats?.staminaRegen, STATS.staminaRegen) * dt, 0, fighter.maxStamina, fighter.maxStamina);

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
      sanitizeFighter(fighter, fighter.controlledByPlayer ? 260 : 700);
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
  } else if (special === "gravity") {
    if (!attacker.hitStepsDone.includes("field") && attacker.attack.elapsed >= 0.22) {
      attacker.hitStepsDone.push("field");
      defender.gravityTimer = 4.0;
      defender.gravitySource = attacker.colors.suit;
      addFloatingText("HEAVY FIELD", defender.x, defender.y - 170, attacker.colors.suit, 24, 1.1);
      for (let g = 0; g < 10; g++) effects.push({ kind: "gravity", x: defender.x + (Math.random() - 0.5) * 110, y: defender.y - 80 + (Math.random() - 0.5) * 95, radius: 45 + Math.random() * 45, life: 0.8, maxLife: 0.8, color: attacker.colors.suit });
    }
    hits = [{ time: 0.44, damage: 10, knockback: 180, name: "special", range: 210, final: true }];
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
  sanitizeFighter(attacker, attacker.controlledByPlayer ? 260 : 700);
  sanitizeFighter(defender, defender.controlledByPlayer ? 260 : 700);
  damage = Math.max(0, safeNumber(damage, 0));
  knockback = safeNumber(knockback, 0);
  specialGain = Math.max(0, safeNumber(specialGain, 0));
  const distance = Math.abs(attacker.x - defender.x);
  const facingTarget = Math.sign(defender.x - attacker.x) === attacker.facing;
  const range = attacker.attack.range;
  if (!facingTarget || distance > range) return false;

  let finalDamage = damage;
  let blocked = false;

  if (defender.blocking && defender.stamina > STATS.guardBreakLimit) {
    blocked = true;
    finalDamage *= 1 - safeNumber(defender.fighterData?.stats?.blockReduction, STATS.blockDamageReduction);
    defender.stamina -= damage * 1.45;
    addFloatingText("GUARD SPARK", defender.x, defender.y - 128, "#68f7ff", 19);
    if (defender.stamina <= STATS.guardBreakLimit) guardBreak(defender);
  }

  defender.health = Math.max(0, defender.health - finalDamage);
  defender.vx = attacker.facing * knockback * (blocked ? 0.52 : 1);
  defender.knockbackTimer = finalSpecialHit ? 0.34 : type === "kick" || type === "combo" ? 0.2 : 0.14;
  defender.hitReactTimer = 0.22;
  attacker.special = clampNumber(attacker.special + specialGain, 0, attacker.maxSpecial, 0);

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
  while (effects.length > 180) effects.shift();
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
  if (gameState !== "playing") return;
  if (player.health <= 0 && enemy.health <= 0) {
    endMatch(null, "Draw");
  } else if (enemy.health <= 0) {
    endMatch(player, "Won by KO");
  } else if (player.health <= 0) {
    endMatch(enemy, "Won by KO");
  }
}

function endMatch(winner, resultType) {
  gameState = "ended";
  finalClashActive = false;
  ui.finalClashOverlay.classList.add("hidden");
  ui.timerDisplay.classList.toggle("hidden", selectedMatchType !== "timed");
  ui.timerDisplay.classList.remove("danger");
  if (!winner || resultType === "Draw") {
    ui.endTitle.textContent = "Draw";
    ui.endMessage.textContent = `Draw. Both fighters were nearly even. Rematch, restart the same pairing, or return to character select.`;
    ui.roundStatus.textContent = "Draw";
  } else {
    const playerWon = winner === player;
    const loser = playerWon ? enemy : player;
    ui.endTitle.textContent = playerWon ? "Victory!" : "Defeat";
    ui.endMessage.textContent = `${winner.name} defeats ${loser.name}. ${resultType}. Rematch instantly, restart the same pairing, or return to character select.`;
    ui.roundStatus.textContent = `${winner.name} Wins`;
  }
  ui.endOverlay.classList.remove("hidden");
  keys.clear();
}

function updateUI() {
  sanitizeFighter(player, 260);
  sanitizeFighter(enemy, 700);
  ui.playerName.textContent = player.name;
  ui.enemyName.textContent = enemy.name;
  ui.playerSpecial.style.background = `linear-gradient(90deg, ${player.colors.suit}, ${player.colors.trim}, #ffffff)`;
  ui.enemySpecial.style.background = `linear-gradient(90deg, ${enemy.colors.suit}, ${enemy.colors.trim}, #ffffff)`;
  setBar(ui.playerHealth, ui.playerHealthText, player.health, player.maxHealth, false);
  setBar(ui.playerStamina, ui.playerStaminaText, player.stamina, player.maxStamina, false);
  setBar(ui.playerSpecial, ui.playerSpecialText, player.special, player.maxSpecial, true);
  setBar(ui.enemyHealth, ui.enemyHealthText, enemy.health, enemy.maxHealth, false);
  setBar(ui.enemyStamina, ui.enemyStaminaText, enemy.stamina, enemy.maxStamina, false);
  setBar(ui.enemySpecial, ui.enemySpecialText, enemy.special, enemy.maxSpecial, true);
  const showTimer = selectedMatchType === "timed" && ["intro", "playing", "ended"].includes(gameState);
  ui.timerDisplay.classList.toggle("hidden", !showTimer);
  if (showTimer) {
    ui.timerDisplay.textContent = String(Math.ceil(matchTimeRemaining));
    ui.timerDisplay.classList.toggle("danger", matchTimeRemaining <= FINAL_CLASH_SECONDS && gameState === "playing");
  }
}

function setBar(bar, label, value, max, percentLabel) {
  const safeMax = Math.max(1, safeNumber(max, 1));
  const safeValue = clampNumber(value, 0, safeMax, 0);
  const percent = clampNumber((safeValue / safeMax) * 100, 0, 100, 0);
  bar.style.width = `${percent}%`;
  label.textContent = `${Math.ceil(safeValue)} / ${Math.ceil(safeMax)}`;
  bar.classList.toggle("meter-full", percent >= 100 && percentLabel);
  if (percentLabel) label.title = `${Math.floor(percent)}%`;
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
  sanitizeFighter(fighter, fighter.controlledByPlayer ? 260 : 700);
  const x = fighter.x;
  const y = fighter.y;
  const bounce = Math.sin(performance.now() / 130 + (fighter.controlledByPlayer ? 0 : 1.5)) * 2.4;
  const lean = fighter.state === "attack" ? fighter.facing * 8 : fighter.vx * 0.014;
  const hitLean = fighter.hitReactTimer > 0 ? -fighter.facing * 7 : 0;

  if (fighter.gravityTimer > 0) {
    ctx.strokeStyle = fighter.gravitySource || "#7d5cff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y - 70, 70, 100, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (fighter.special >= fighter.maxSpecial || fighter.attack?.type === "special") {
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
  const c = { ...SAFE_COLORS, ...(fighter.colors || {}) };
  const specialType = fighter.fighterData?.specialType || "rush";
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const attacking = fighter.state === "attack";
  const attackType = fighter.attack?.type;
  const kicking = attacking && (attackType === "kick" || attackType === "combo" || attackType === "special");

  // Back leg, front leg, shoes. Kicks animate the existing front leg only, never a third limb.
  drawLimb(-10, -54, -21, -8, 13, c.skin);
  if (kicking) drawLimb(12, -54, attackType === "special" ? 82 : 66, -45, 14, c.skin);
  else drawLimb(12, -54, 24, -9, 13, c.skin);
  ctx.fillStyle = c.shoe;
  roundRect(-35, -12, 26, 12, 5);
  if (kicking) roundRect(attackType === "special" ? 72 : 57, -52, 28, 14, 6);
  else roundRect(9, -12, 33, 12, 5);

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
  if (specialType === "lightning") {
    ctx.moveTo(-12, -108); ctx.lineTo(5, -97); ctx.lineTo(-4, -84); ctx.lineTo(15, -73);
  } else if (specialType === "clinch") {
    ctx.strokeRect(-18, -108, 36, 28);
  } else if (specialType === "roundhouse") {
    ctx.arc(0, -92, 18, 0.2, Math.PI * 1.45);
  } else if (specialType === "reversal") {
    ctx.moveTo(-18, -74); ctx.quadraticCurveTo(0, -122, 18, -74);
  } else if (specialType === "gravity") {
    ctx.arc(0, -92, 19, 0, Math.PI * 2);
    ctx.moveTo(-22, -92); ctx.lineTo(22, -92);
  } else {
    ctx.moveTo(0, -116); ctx.lineTo(0, -72);
  }
  ctx.stroke();

  // Arms and gloves change pose for idle, block, punch, kick, and special.
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
  if (specialType === "clinch") {
    ctx.fillStyle = c.trim;
    roundRect(-24, -151, 10, 9, 4);
    roundRect(14, -151, 10, 9, 4);
  }
  if (specialType === "roundhouse") {
    ctx.fillStyle = c.trim;
    ctx.beginPath();
    ctx.arc(18, -151, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  if (specialType === "gravity") {
    ctx.strokeStyle = c.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -144, 27, 0.2, Math.PI * 1.35);
    ctx.stroke();
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
    if (effect.kind === "gravity") {
      ctx.strokeStyle = effect.color || "#7d5cff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (1.2 - alpha * 0.2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `${effect.color || "#7d5cff"}22`;
      ctx.fill();
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
  if (key === "p") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (key === " ") {
    event.preventDefault();
    if (!event.repeat) handleClashTap();
    return;
  }
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
ui.selectBackButton.addEventListener("click", showTitleScreen);
ui.helpButton.addEventListener("click", () => ui.helpPanel.classList.toggle("hidden"));
ui.randomButton.addEventListener("click", () => selectFighter(FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)].id));
ui.confirmButton.addEventListener("click", confirmSelection);
ui.timedMatchButton.addEventListener("click", () => chooseMatchType("timed"));
ui.untimedMatchButton.addEventListener("click", () => chooseMatchType("untimed"));
ui.optionsBackButton.addEventListener("click", showCharacterSelect);
ui.beginVsButton.addEventListener("click", beginVsScreen);
ui.restartButton.addEventListener("click", showCharacterSelect);
ui.rematchButton.addEventListener("click", rematch);
ui.quickRestartButton.addEventListener("click", () => resetGame(lastPlayerId || selectedFighterId, lastEnemyId || null));
ui.pauseButton.addEventListener("click", togglePause);
ui.resumeButton.addEventListener("click", () => setPaused(false));
ui.pauseRestartButton.addEventListener("click", () => resetGame(lastPlayerId || selectedFighterId, lastEnemyId || null));
ui.pauseSelectButton.addEventListener("click", showCharacterSelect);

// Create fighters once so the title screen has a background scene.
player = createFighter(FIGHTERS[0], 260, 1, true);
enemy = createFighter(FIGHTERS[1], 700, -1, false);
renderCharacterCards();
updateFighterPreview();
updateUI();
requestAnimationFrame(gameLoop);
