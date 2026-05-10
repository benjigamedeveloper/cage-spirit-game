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
  randomMatchButton: document.getElementById("randomMatchButton"),
  confirmButton: document.getElementById("confirmButton"),
  confirmHint: document.getElementById("confirmHint"),
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
  rematchButton: document.getElementById("rematchButton"),
  endSelectButton: document.getElementById("endSelectButton"),
  endMainMenuButton: document.getElementById("endMainMenuButton"),
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
  pauseRematchButton: document.getElementById("pauseRematchButton"),
  pauseSelectButton: document.getElementById("pauseSelectButton"),
  pauseMainMenuButton: document.getElementById("pauseMainMenuButton"),
  controlsGuide: document.getElementById("controlsGuide")
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
  colors: SAFE_COLORS,
  visual: { build: "balanced", hair: "hero", stance: "square", emblem: "spirit", aura: "streak", eye: "#eaffff", scaleX: 1, torso: 1, shoulder: 1, leg: 1, guard: 1 }
};

// Twelve original anime MMA fighters. Cards, stats, colors, AI, visuals, and specials all read from this data.
const FIGHTERS = [
  {
    id: "spirit-brawler", name: "Spirit Brawler", role: "Balanced all-rounder", style: "Balanced all-rounder", difficulty: "Easy",
    description: "A clean fundamentals fighter with steady footwork, crisp boxing, and blue-white spirit pressure.",
    personality: "Brave, friendly, and composed under tournament lights.", strengths: ["Balanced stats", "Easy to use", "Reliable J,J,K combo"], weaknesses: ["No extreme advantage", "Needs meter to shine"],
    specialName: "Spirit Rush", specialDescription: "Fast forward multi-hit combo with medium damage, spirit streaks, and knockback.", ability: "Fast forward multi-hit combo with medium damage, spirit streaks, and knockback.", specialType: "rush", specialDamage: 30, aiBehavior: "balanced", theme: "Blue/white spirit energy",
    ovr: 84, power: 82, speedRating: 82, defenseRating: 82, staminaRating: 84, techniqueRating: 85, specialRating: 86,
    ratings: { ovr: 84, Power: 82, Speed: 82, Defense: 82, Stamina: 84, Technique: 85, Special: 86 },
    stats: { maxHealth: 100, health: 100, maxStamina: 100, stamina: 100, speed: 235, staminaRegen: 8.5, punchDamage: 7, kickDamage: 14, specialDamage: 30, dashCost: 24, punchCost: 8, kickCost: 18, defense: 34, blockReduction: 0.66 },
    colors: { suit: "#68f7ff", skin: "#ffd2a6", shorts: "#17203f", trim: "#f5fbff", hair: "#111a33", glove: "#f8fcff", shoe: "#87f6ff", aura: "rgba(104, 247, 255, 0.38)", detail: "#ffffff" }
  },
  {
    id: "storm-boxer", name: "Storm Boxer", role: "Fast lightning striker", style: "Speed striker", difficulty: "Medium",
    description: "A lightning-fast boxer who darts through angles with bright yellow afterimages and rapid hands.",
    personality: "Cocky, upbeat, and always looking for the next angle.", strengths: ["Very fast movement", "Fast punches", "Strong dash pressure"], weaknesses: ["Lower health", "Weaker kicks"],
    specialName: "Lightning Step", specialDescription: "Yellow electric dash-through afterimage attack followed by rapid punches.", ability: "Yellow electric dash-through afterimage attack followed by rapid punches.", specialType: "lightning", specialDamage: 22, aiBehavior: "pressure", theme: "Yellow lightning energy",
    ovr: 86, power: 74, speedRating: 95, defenseRating: 68, staminaRating: 82, techniqueRating: 90, specialRating: 88,
    ratings: { ovr: 86, Power: 74, Speed: 95, Defense: 68, Stamina: 82, Technique: 90, Special: 88 },
    stats: { maxHealth: 88, health: 88, maxStamina: 96, stamina: 96, speed: 292, staminaRegen: 9.3, punchDamage: 8, kickDamage: 9, specialDamage: 22, dashCost: 19, punchCost: 7, kickCost: 17, defense: 24, blockReduction: 0.58 },
    colors: { suit: "#ffd84a", skin: "#f0bd8c", shorts: "#2c2308", trim: "#fff6a5", hair: "#fff26a", glove: "#fff7c2", shoe: "#ffef62", aura: "rgba(255, 216, 74, 0.36)", detail: "#ffffff" }
  },
  {
    id: "iron-wrestler", name: "Iron Wrestler", role: "Heavy grappler", style: "Heavy grappler", difficulty: "Medium",
    description: "A steel-clad clinch specialist with crushing pressure, heavy strikes, and a stubborn guard.",
    personality: "Stoic, respectful, and impossible to bully up close.", strengths: ["High health", "Strong defense", "Heavy hits"], weaknesses: ["Slow movement", "High stamina costs"],
    specialName: "Titan Clinch", specialDescription: "Close-range steel impact with big knockback; misses or weakens if too far.", ability: "Close-range steel impact with big knockback; misses or weakens if too far.", specialType: "clinch", specialDamage: 35, aiBehavior: "grappler", theme: "Steel/dark grey energy",
    ovr: 85, power: 94, speedRating: 58, defenseRating: 92, staminaRating: 80, techniqueRating: 76, specialRating: 87,
    ratings: { ovr: 85, Power: 94, Speed: 58, Defense: 92, Stamina: 80, Technique: 76, Special: 87 },
    stats: { maxHealth: 118, health: 118, maxStamina: 108, stamina: 108, speed: 178, staminaRegen: 7.1, punchDamage: 10, kickDamage: 17, specialDamage: 35, dashCost: 30, punchCost: 11, kickCost: 23, defense: 48, blockReduction: 0.72 },
    colors: { suit: "#9aa3ad", skin: "#d7aa84", shorts: "#242a31", trim: "#dce4ec", hair: "#252a31", glove: "#c6ced7", shoe: "#676f78", aura: "rgba(154, 163, 173, 0.38)", detail: "#f2f6f8" }
  },
  {
    id: "flame-kicker", name: "Flame Kicker", role: "Kick pressure fighter", style: "Kick pressure fighter", difficulty: "Medium",
    description: "A fiery roundhouse artist who controls mid range with orange-red kicks and burning pressure.",
    personality: "Flashy, competitive, and happiest at kicking range.", strengths: ["Strong kicks", "Good pressure", "Good mid-range"], weaknesses: ["Weaker punches", "Average defense"],
    specialName: "Inferno Roundhouse", specialDescription: "Orange fire arc and short shockwave from a powerful kick-based special.", ability: "Orange fire arc and short shockwave from a powerful kick-based special.", specialType: "roundhouse", specialDamage: 32, aiBehavior: "kicker", theme: "Orange/red flame energy",
    ovr: 85, power: 88, speedRating: 84, defenseRating: 74, staminaRating: 80, techniqueRating: 84, specialRating: 89,
    ratings: { ovr: 85, Power: 88, Speed: 84, Defense: 74, Stamina: 80, Technique: 84, Special: 89 },
    stats: { maxHealth: 98, health: 98, maxStamina: 102, stamina: 102, speed: 230, staminaRegen: 8.2, punchDamage: 5, kickDamage: 18, specialDamage: 32, dashCost: 24, punchCost: 7, kickCost: 19, defense: 30, blockReduction: 0.62 },
    colors: { suit: "#ff6b2b", skin: "#ffc195", shorts: "#38120c", trim: "#ffd0a0", hair: "#b61e0d", glove: "#ff9356", shoe: "#ff3f22", aura: "rgba(255, 107, 43, 0.36)", detail: "#ffe08f" }
  },
  {
    id: "shadow-counter", name: "Shadow Counter", role: "Defensive counter fighter", style: "Defensive counter fighter", difficulty: "Hard",
    description: "A patient shadow stylist with evasive blocks, purple-black aura, and timing-based punishment.",
    personality: "Quiet, analytical, and dangerous when opponents overextend.", strengths: ["Strong block", "Good stamina", "Rewards timing"], weaknesses: ["Weaker direct attacks", "Mistimed special is modest"],
    specialName: "Phantom Reversal", specialDescription: "Purple shadow flash that is strong during enemy attacks and weaker if mistimed.", ability: "Purple shadow flash that is strong during enemy attacks and weaker if mistimed.", specialType: "reversal", specialDamage: 32, aiBehavior: "counter", theme: "Purple/black shadow energy",
    ovr: 87, power: 76, speedRating: 82, defenseRating: 91, staminaRating: 88, techniqueRating: 94, specialRating: 90,
    ratings: { ovr: 87, Power: 76, Speed: 82, Defense: 91, Stamina: 88, Technique: 94, Special: 90 },
    stats: { maxHealth: 96, health: 96, maxStamina: 112, stamina: 112, speed: 218, staminaRegen: 9.0, punchDamage: 6, kickDamage: 11, specialDamage: 32, dashCost: 22, punchCost: 7, kickCost: 16, defense: 55, blockReduction: 0.78 },
    colors: { suit: "#8b5cff", skin: "#e3b18d", shorts: "#120a1f", trim: "#c9b7ff", hair: "#08050e", glove: "#5b35a6", shoe: "#20102f", aura: "rgba(139, 92, 255, 0.34)", detail: "#2b173f" }
  },
  {
    id: "gravity-monk", name: "Gravity Monk", role: "Control fighter", style: "Control/tricky fighter", difficulty: "Hard",
    description: "A calm space-violet controller who bends distance with floating footwork and pressure fields.",
    personality: "Serene, tactical, and more interested in rhythm than raw damage.", strengths: ["Controls distance", "Good defense", "Tricky movement"], weaknesses: ["Lower raw damage", "Needs spacing discipline"],
    specialName: "Heavy Field", specialDescription: "Violet gravity ring slows the opponent and raises their stamina costs briefly.", ability: "Violet gravity ring slows the opponent and raises their stamina costs briefly.", specialType: "gravity", specialDamage: 10, aiBehavior: "control", theme: "Violet/space gravity energy",
    ovr: 86, power: 72, speedRating: 78, defenseRating: 88, staminaRating: 86, techniqueRating: 92, specialRating: 93,
    ratings: { ovr: 86, Power: 72, Speed: 78, Defense: 88, Stamina: 86, Technique: 92, Special: 93 },
    stats: { maxHealth: 102, health: 102, maxStamina: 108, stamina: 108, speed: 222, staminaRegen: 8.7, punchDamage: 6, kickDamage: 12, specialDamage: 10, dashCost: 22, punchCost: 8, kickCost: 17, defense: 42, blockReduction: 0.7 },
    colors: { suit: "#7d5cff", skin: "#cda27f", shorts: "#15112a", trim: "#bca6ff", hair: "#301d5a", glove: "#a98cff", shoe: "#4c33aa", aura: "rgba(125, 92, 255, 0.36)", detail: "#e7dcff" }
  },
  {
    id: "frost-judoka", name: "Frost Judoka", role: "Defensive throw specialist", style: "Patient punish fighter", difficulty: "Medium",
    description: "An ice-blue judoka who waits, braces, then sweeps opponents into a cold slow effect.",
    personality: "Measured, polite, and relentless once a mistake appears.", strengths: ["Patient defense", "Punishes attacks", "Slowing special"], weaknesses: ["Needs timing", "Limited chase power"],
    specialName: "Frozen Sweep", specialDescription: "Ice burst defensive sweep-style counter that slows the opponent after impact.", ability: "Ice burst defensive sweep-style counter that slows the opponent after impact.", specialType: "sweep", specialDamage: 24, aiBehavior: "punish", theme: "Ice blue energy",
    ovr: 84, power: 78, speedRating: 76, defenseRating: 89, staminaRating: 86, techniqueRating: 88, specialRating: 84,
    ratings: { ovr: 84, Power: 78, Speed: 76, Defense: 89, Stamina: 86, Technique: 88, Special: 84 },
    stats: { maxHealth: 104, health: 104, maxStamina: 106, stamina: 106, speed: 205, staminaRegen: 8.6, punchDamage: 6, kickDamage: 13, specialDamage: 24, dashCost: 24, punchCost: 8, kickCost: 17, defense: 46, blockReduction: 0.74 },
    colors: { suit: "#8ee7ff", skin: "#f0c4a1", shorts: "#0c2738", trim: "#eaffff", hair: "#d8faff", glove: "#b9f4ff", shoe: "#52c9ee", aura: "rgba(142, 231, 255, 0.36)", detail: "#ffffff" }
  },
  {
    id: "neon-assassin", name: "Neon Assassin", role: "Fast combo fighter", style: "Fast combo fighter", difficulty: "Hard",
    description: "A cyan-pink combo artist who overwhelms with neon routes and fragile high speed.",
    personality: "Playful, theatrical, and always moving before the crowd can blink.", strengths: ["Fastest combos", "Great mobility", "Multi-hit pressure"], weaknesses: ["Fragile", "Post-special stamina drain"],
    specialName: "Afterimage Barrage", specialDescription: "Neon duplicates join a fast multi-hit combo, then stamina dips for balance.", ability: "Neon duplicates join a fast multi-hit combo, then stamina dips for balance.", specialType: "barrage", specialDamage: 28, aiBehavior: "combo", theme: "Cyan/pink neon energy",
    ovr: 88, power: 78, speedRating: 98, defenseRating: 62, staminaRating: 80, techniqueRating: 95, specialRating: 92,
    ratings: { ovr: 88, Power: 78, Speed: 98, Defense: 62, Stamina: 80, Technique: 95, Special: 92 },
    stats: { maxHealth: 84, health: 84, maxStamina: 100, stamina: 100, speed: 306, staminaRegen: 9.4, punchDamage: 7, kickDamage: 12, specialDamage: 28, dashCost: 18, punchCost: 7, kickCost: 16, defense: 20, blockReduction: 0.55 },
    colors: { suit: "#29f6ff", skin: "#eec0a3", shorts: "#160927", trim: "#ff4fd8", hair: "#ff4fd8", glove: "#7fffff", shoe: "#ff7ce4", aura: "rgba(41, 246, 255, 0.34)", detail: "#ff4fd8" }
  },
  {
    id: "crimson-oni", name: "Crimson Oni", role: "Aggressive power fighter", style: "Aggressive power fighter", difficulty: "Medium",
    description: "A dark crimson brawler who commits to huge pressure and guard-breaking forward strikes.",
    personality: "Intense, loud, and fearless, but sometimes too committed.", strengths: ["Huge damage", "Guard pressure", "Strong knockback"], weaknesses: ["Risky recovery", "Stamina hungry"],
    specialName: "Oni Breaker", specialDescription: "Crimson guard-breaking burst with strong knockback and slower recovery.", ability: "Crimson guard-breaking burst with strong knockback and slower recovery.", specialType: "breaker", specialDamage: 34, aiBehavior: "berserker", theme: "Red/dark crimson aura",
    ovr: 87, power: 96, speedRating: 72, defenseRating: 76, staminaRating: 78, techniqueRating: 80, specialRating: 91,
    ratings: { ovr: 87, Power: 96, Speed: 72, Defense: 76, Stamina: 78, Technique: 80, Special: 91 },
    stats: { maxHealth: 108, health: 108, maxStamina: 96, stamina: 96, speed: 210, staminaRegen: 7.6, punchDamage: 11, kickDamage: 18, specialDamage: 34, dashCost: 27, punchCost: 11, kickCost: 22, defense: 36, blockReduction: 0.64 },
    colors: { suit: "#ff304f", skin: "#d99d7b", shorts: "#25050b", trim: "#ff9cac", hair: "#2d050a", glove: "#ff5b70", shoe: "#7d111f", aura: "rgba(255, 48, 79, 0.36)", detail: "#ffd1d9" }
  },
  {
    id: "solar-champion", name: "Solar Champion", role: "Technical striker", style: "Technical striker", difficulty: "Medium",
    description: "A gold-white technician who feints with bright flashes before landing clean precise combos.",
    personality: "Confident, noble, and disciplined about perfect timing.", strengths: ["Clean timing", "Balanced offense", "Reliable special"], weaknesses: ["Needs precision", "Average close defense"],
    specialName: "Solar Flare Combo", specialDescription: "Gold flash feint into a precise multi-hit combo with strong timing windows.", ability: "Gold flash feint into a precise multi-hit combo with strong timing windows.", specialType: "solar", specialDamage: 29, aiBehavior: "technical", theme: "Gold/white solar energy",
    ovr: 86, power: 83, speedRating: 84, defenseRating: 78, staminaRating: 84, techniqueRating: 93, specialRating: 88,
    ratings: { ovr: 86, Power: 83, Speed: 84, Defense: 78, Stamina: 84, Technique: 93, Special: 88 },
    stats: { maxHealth: 100, health: 100, maxStamina: 104, stamina: 104, speed: 238, staminaRegen: 8.8, punchDamage: 8, kickDamage: 14, specialDamage: 29, dashCost: 23, punchCost: 8, kickCost: 18, defense: 34, blockReduction: 0.66 },
    colors: { suit: "#ffd76a", skin: "#f5c39b", shorts: "#221b05", trim: "#fff9d7", hair: "#fff0a3", glove: "#fff5bd", shoe: "#ffc445", aura: "rgba(255, 215, 106, 0.36)", detail: "#ffffff" }
  },
  {
    id: "vortex-ninja", name: "Vortex Ninja", role: "Evasive movement fighter", style: "Evasive movement fighter", difficulty: "Hard",
    description: "A teal wind mover who slips past attacks, spins through space, and counters from odd angles.",
    personality: "Mischievous, calm, and allergic to standing still.", strengths: ["Evasive movement", "Low dash cost", "Hard to pin down"], weaknesses: ["Lower damage", "Requires spacing"],
    specialName: "Cyclone Step", specialDescription: "Teal wind spiral movement attack that slips past the opponent and counters.", ability: "Teal wind spiral movement attack that slips past the opponent and counters.", specialType: "cyclone", specialDamage: 23, aiBehavior: "evasive", theme: "Teal wind energy",
    ovr: 85, power: 72, speedRating: 92, defenseRating: 74, staminaRating: 86, techniqueRating: 91, specialRating: 86,
    ratings: { ovr: 85, Power: 72, Speed: 92, Defense: 74, Stamina: 86, Technique: 91, Special: 86 },
    stats: { maxHealth: 92, health: 92, maxStamina: 106, stamina: 106, speed: 280, staminaRegen: 9.1, punchDamage: 6, kickDamage: 11, specialDamage: 23, dashCost: 17, punchCost: 7, kickCost: 16, defense: 28, blockReduction: 0.61 },
    colors: { suit: "#21e7c7", skin: "#e5b696", shorts: "#05251f", trim: "#cafff4", hair: "#063f3b", glove: "#8dfff0", shoe: "#19bda9", aura: "rgba(33, 231, 199, 0.34)", detail: "#e8fffb" }
  },
  {
    id: "dragon-guard", name: "Dragon Guard", role: "Tank/blocking fighter", style: "Tank/blocking fighter", difficulty: "Medium",
    description: "A green defensive tank who survives pressure and rewards correct blocking with a dragon aura.",
    personality: "Protective, patient, and proud of winning late rounds.", strengths: ["Great blocking", "High health", "Defense aura"], weaknesses: ["Slower speed", "Lower chase power"],
    specialName: "Dragon Shell", specialDescription: "Green guard aura grants temporary defense and rewards blocking pressure.", ability: "Green guard aura grants temporary defense and rewards blocking pressure.", specialType: "shell", specialDamage: 16, aiBehavior: "guard", theme: "Green dragon energy",
    ovr: 86, power: 78, speedRating: 64, defenseRating: 96, staminaRating: 88, techniqueRating: 82, specialRating: 86,
    ratings: { ovr: 86, Power: 78, Speed: 64, Defense: 96, Stamina: 88, Technique: 82, Special: 86 },
    stats: { maxHealth: 116, health: 116, maxStamina: 112, stamina: 112, speed: 188, staminaRegen: 8.3, punchDamage: 7, kickDamage: 12, specialDamage: 16, dashCost: 28, punchCost: 9, kickCost: 19, defense: 58, blockReduction: 0.82 },
    colors: { suit: "#5cff8d", skin: "#d9aa87", shorts: "#082212", trim: "#d7ffe2", hair: "#0a3318", glove: "#a0ffba", shoe: "#2ac867", aura: "rgba(92, 255, 141, 0.34)", detail: "#edfff2" }
  }
];



const FIGHTER_VISUALS = {
  "spirit-brawler": { build: "balanced", hair: "hero", stance: "square", emblem: "spirit", aura: "streak", eye: "#eaffff", scaleX: 1, torso: 1, shoulder: 1, leg: 1, guard: 1, portraitPose: "hero" },
  "storm-boxer": { build: "lean", hair: "bolt", stance: "boxer", emblem: "bolt", aura: "lightning", eye: "#fff6a5", scaleX: 0.9, torso: 0.92, shoulder: 0.92, leg: 1.02, guard: 1.18, portraitPose: "boxer" },
  "iron-wrestler": { build: "heavy", hair: "crop", stance: "grappler", emblem: "plate", aura: "steel", eye: "#eef4ff", scaleX: 1.22, torso: 1.16, shoulder: 1.36, leg: 1.08, guard: 0.82, portraitPose: "heavy" },
  "flame-kicker": { build: "striker", hair: "flame", stance: "kicker", emblem: "flame", aura: "flame", eye: "#fff1a8", scaleX: 0.96, torso: 0.96, shoulder: 0.98, leg: 1.22, guard: 0.9, portraitPose: "kicker" },
  "shadow-counter": { build: "counter", hair: "veil", stance: "counter", emblem: "moon", aura: "shadow", eye: "#dcb8ff", scaleX: 0.94, torso: 1, shoulder: 1, leg: 0.96, guard: 1.06, portraitPose: "shadow" },
  "gravity-monk": { build: "monk", hair: "topknot", stance: "monk", emblem: "orbit", aura: "gravity", eye: "#eadcff", scaleX: 1.02, torso: 1.06, shoulder: 1.05, leg: 1, guard: 0.72, portraitPose: "monk" },
  "frost-judoka": { build: "judoka", hair: "swept", stance: "judoka", emblem: "snow", aura: "ice", eye: "#eaffff", scaleX: 1.04, torso: 1.05, shoulder: 1.12, leg: 1.02, guard: 0.96, portraitPose: "judoka" },
  "neon-assassin": { build: "assassin", hair: "neon", stance: "low", emblem: "neon", aura: "neon", eye: "#7fffff", scaleX: 0.84, torso: 0.9, shoulder: 0.84, leg: 1.12, guard: 1.12, portraitPose: "assassin" },
  "crimson-oni": { build: "brute", hair: "horns", stance: "brute", emblem: "oni", aura: "crimson", eye: "#ffd1d9", scaleX: 1.18, torso: 1.1, shoulder: 1.28, leg: 1.04, guard: 0.78, portraitPose: "brute" },
  "solar-champion": { build: "champion", hair: "crown", stance: "champion", emblem: "sun", aura: "solar", eye: "#fff9d7", scaleX: 1, torso: 1, shoulder: 1.06, leg: 1.02, guard: 1.02, portraitPose: "champion" },
  "vortex-ninja": { build: "ninja", hair: "tail", stance: "evasive", emblem: "vortex", aura: "wind", eye: "#cafff4", scaleX: 0.88, torso: 0.94, shoulder: 0.9, leg: 1.16, guard: 1.2, portraitPose: "ninja" },
  "dragon-guard": { build: "guardian", hair: "crest", stance: "guard", emblem: "dragon", aura: "dragon", eye: "#edfff2", scaleX: 1.16, torso: 1.12, shoulder: 1.24, leg: 1.04, guard: 0.88, portraitPose: "guard" }
};

function getFighterVisual(fighterData = {}) {
  return { ...(FIGHTER_VISUALS[SAFE_FIGHTER.id] || {}), ...(FIGHTER_VISUALS[fighterData.id] || {}), ...(fighterData.visual || {}) };
}

const FIGHTER_RATINGS = Object.fromEntries(FIGHTERS.map((fighter) => [fighter.id, fighter.ratings]));

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
    personality: fighterData.personality || "Focused tournament competitor.",
    ratings: { ...ratingFallback, ovr: fighterData.ovr || ratingFallback.ovr, Power: fighterData.power || ratingFallback.Power, Speed: fighterData.speedRating || ratingFallback.Speed, Defense: fighterData.defenseRating || ratingFallback.Defense, Stamina: fighterData.staminaRating || ratingFallback.Stamina, Technique: fighterData.techniqueRating || ratingFallback.Technique, Special: fighterData.specialRating || ratingFallback.Special, ...(fighterData.ratings || {}) },
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
    colors,
    visual: getFighterVisual(fighterData)
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
  fighter.dragonShellTimer = Math.max(0, safeNumber(fighter.dragonShellTimer, 0));
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
    ui.pauseButton.textContent = "Pause";
    ui.roundStatus.textContent = "Paused";
    updateGameplayChrome();
    return;
  }

  if (gameState === "paused") {
    gameState = "playing";
    ui.roundStatus.textContent = pausedStatusText || `${player.name} vs ${enemy.name}`;
  }
  ui.pauseOverlay.classList.add("hidden");
  ui.pauseButton.textContent = "Pause";
  updateGameplayChrome();
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
    card.dataset.pose = fighter.visual.portraitPose || fighter.visual.stance || "hero";
    card.dataset.aura = fighter.visual.aura || fighter.specialType;
    card.style.setProperty("--card-accent", fighter.colors.suit);
    card.style.setProperty("--card-dark", fighter.colors.shorts);
    card.style.setProperty("--card-trim", fighter.colors.trim);
    card.style.setProperty("--card-hair", fighter.colors.hair);
    card.style.setProperty("--card-skin", fighter.colors.skin);
    card.innerHTML = `
      <div class="rating-badge"><b>${fighter.ratings.ovr}</b><span>OVR</span></div>
      <div class="fighter-portrait" aria-hidden="true">
        <i class="portrait-aura"></i><i class="portrait-leg back"></i><i class="portrait-leg front"></i><i class="portrait-body"></i><i class="portrait-head"></i><i class="portrait-hair"></i><i class="portrait-arm left"></i><i class="portrait-arm right"></i><i class="portrait-glow"></i>
      </div>
      <div class="card-topline"><span>${fighter.difficulty}</span><span>${fighter.theme}</span></div>
      <h3>${fighter.name}</h3>
      <p class="fighter-style">${fighter.role}</p>
      <p class="fighter-desc">${fighter.description}</p>
      <div class="stat-bars small-stats">${buildStatBars(fighter)}</div>
      <p class="fighter-special"><span>Special Move</span>${fighter.specialName}</p>
      <p class="ability-desc"><strong>Strengths:</strong> ${fighter.strengths.join(", ")}</p>
      <p class="ability-desc"><strong>Weaknesses:</strong> ${fighter.weaknesses.join(", ")}</p>
      <p class="ability-desc">${fighter.specialDescription}</p>
      <span class="choose-label">${fighter.id === selectedFighterId ? "Selected" : "Select"}</span>
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

function setConfirmState() {
  const selected = selectedFighterId ? normalizeFighterData(FIGHTERS.find((fighter) => fighter.id === selectedFighterId) || FIGHTERS[0]) : null;
  ui.confirmButton.disabled = !selected;
  ui.confirmButton.textContent = "Confirm Fighter";
  ui.confirmButton.classList.toggle("confirm-ready", Boolean(selected));
  if (ui.confirmHint) {
    ui.confirmHint.textContent = selected
      ? `${selected.name} selected. Press Confirm Fighter to choose match type.`
      : "Pick a fighter card to unlock the next step.";
  }
}

function selectFighter(fighterId) {
  const exists = FIGHTERS.some((fighter) => fighter.id === fighterId);
  if (!exists) return;
  selectedFighterId = fighterId;
  setConfirmState();
  renderCharacterCards();
  updateFighterPreview();
  ui.confirmButton.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideMainScreens() {
  ui.titleScreen.classList.add("hidden");
  ui.characterSelect.classList.add("hidden");
  ui.matchOptions.classList.add("hidden");
  ui.vsOverlay.classList.add("hidden");
}

function updateFighterPreview() {
  if (!selectedFighterId) {
    const sample = normalizeFighterData(FIGHTERS[0]);
    ui.fighterPreview.style.setProperty("--card-accent", sample.colors.suit);
    ui.fighterPreview.style.setProperty("--card-dark", sample.colors.shorts);
    ui.fighterPreview.style.setProperty("--card-trim", sample.colors.trim);
    ui.fighterPreview.style.setProperty("--card-hair", sample.colors.hair);
    ui.fighterPreview.style.setProperty("--card-skin", sample.colors.skin);
    ui.fighterPreview.innerHTML = `
      <p class="eyebrow">Pick a Fighter</p>
      <h3>No fighter selected yet</h3>
      <p class="preview-note">Click any fighter card to show their OVR rating, special move, strengths, weaknesses, and stat bars here.</p>
      <div class="empty-preview-callout">1. Pick a fighter card<br>2. Check the preview<br>3. Press Confirm Fighter</div>
    `;
    return;
  }

  const fighter = normalizeFighterData(FIGHTERS.find((item) => item.id === selectedFighterId) || FIGHTERS[0]);
  const rivals = FIGHTERS.map(normalizeFighterData).filter((item) => item.id !== fighter.id);
  const previewRival = normalizeFighterData(rivals[0] || FIGHTERS[1] || SAFE_FIGHTER);
  ui.fighterPreview.style.setProperty("--card-accent", fighter.colors.suit);
  ui.fighterPreview.style.setProperty("--card-dark", fighter.colors.shorts);
  ui.fighterPreview.style.setProperty("--card-trim", fighter.colors.trim);
  ui.fighterPreview.style.setProperty("--card-hair", fighter.colors.hair);
  ui.fighterPreview.style.setProperty("--card-skin", fighter.colors.skin);
  ui.fighterPreview.style.setProperty("--rival-accent", previewRival.colors.suit);
  ui.fighterPreview.dataset.pose = fighter.visual.portraitPose || fighter.visual.stance || "hero";
  ui.fighterPreview.innerHTML = `
    <p class="eyebrow">Selected Fighter</p>
    <h3>${fighter.name} <span class="preview-ovr">${fighter.ratings.ovr} OVR</span></h3>
    <div class="preview-stage" aria-hidden="true"><i class="portrait-aura"></i><i class="portrait-leg back"></i><i class="portrait-leg front"></i><i class="portrait-body"></i><i class="portrait-head"></i><i class="portrait-hair"></i><i class="portrait-arm left"></i><i class="portrait-arm right"></i><i class="portrait-glow"></i></div>
    <div class="preview-versus">
      <div><strong>${fighter.name}</strong><span>${fighter.role}</span></div>
      <b>VS</b>
      <div><strong>Random Rival</strong><span>Preview: ${previewRival.name}</span></div>
    </div>
    <h4>${fighter.specialName}</h4>
    <p>${fighter.specialDescription}</p>
    <p class="preview-note"><strong>Personality:</strong> ${fighter.personality}</p>
    <div class="stat-bars">${buildStatBars(fighter)}</div>
    <div class="trait-grid">
      <div><strong>Strengths</strong><ul>${fighter.strengths.map((item) => `<li>${item}</li>`).join("")}</ul></div>
      <div><strong>Weaknesses</strong><ul>${fighter.weaknesses.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    </div>
    <p class="preview-note">AI behavior: ${fighter.aiBehavior}. Difficulty: ${fighter.difficulty}. Press Confirm Fighter when ready.</p>
  `;
}


function updateGameplayChrome() {
  const fightIsActive = gameState === "playing";
  ui.pauseButton.classList.toggle("hidden", !fightIsActive);
  ui.controlsGuide.classList.toggle("hidden", !fightIsActive);
}

function clearMatchState() {
  pendingStart = null;
  introTimer = 0;
  matchTimeRemaining = ROUND_TIME_SECONDS;
  finalClashActive = false;
  finalClashTriggered = false;
  finalClashResolved = false;
  playerClashPower = 0;
  enemyClashPower = 0;
  clashTapWindowStart = 0;
  clashTapCount = 0;
  effects.length = 0;
  comboSequence = [];
  comboTimer = 0;
  comboMessageTimer = 0;
  hitPause = 0;
  shake = 0;
  screenFlash = 0;
  pausedStatusText = "";
  keys.clear();
  ui.pauseOverlay.classList.add("hidden");
  ui.endOverlay.classList.add("hidden");
  ui.finalClashOverlay.classList.add("hidden");
  ui.vsOverlay.classList.add("hidden");
  ui.timerDisplay.classList.add("hidden");
  ui.timerDisplay.classList.remove("danger");
  ui.comboText.textContent = "";
  updateClashUI();
}

function showTitleScreen() {
  setPaused(false);
  clearMatchState();
  gameState = "title";
  hideMainScreens();
  ui.titleScreen.classList.remove("hidden");
  ui.timerDisplay.classList.add("hidden");
  ui.roundStatus.textContent = "Main Menu";
  ui.comboText.textContent = "";
  updateGameplayChrome();
}

function showCharacterSelect() {
  setPaused(false);
  clearMatchState();
  gameState = "select";
  hideMainScreens();
  ui.characterSelect.classList.remove("hidden");
  ui.roundStatus.textContent = "Character Select";
  ui.comboText.textContent = "";
  ui.timerDisplay.classList.add("hidden");
  setConfirmState();
  renderCharacterCards();
  updateFighterPreview();
  updateGameplayChrome();
}

function confirmSelection() {
  if (!selectedFighterId) {
    ui.roundStatus.textContent = "Select a fighter";
    setConfirmState();
    return;
  }
  aiDifficulty = ui.difficultySelect.value || "normal";
  showMatchOptions();
}

function showMatchOptions(fixedEnemyId = null) {
  const playerData = normalizeFighterData(FIGHTERS.find((fighter) => fighter.id === selectedFighterId) || FIGHTERS[0]);
  const rivalData = chooseEnemyData(playerData.id, fixedEnemyId);
  lastEnemyId = rivalData.id;
  hideMainScreens();
  ui.endOverlay.classList.add("hidden");
  ui.matchOptions.classList.remove("hidden");
  ui.matchupSummary.textContent = `${playerData.name} vs ${rivalData.name}`;
  gameState = "options";
  updateMatchTypeButtons();
  updateGameplayChrome();
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
  clearMatchState();
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
  ui.roundStatus.textContent = selectedMatchType === "timed" ? `Timed Match` : "Untimed Match";
  ui.timerDisplay.classList.toggle("hidden", selectedMatchType !== "timed");
  ui.timerDisplay.classList.remove("danger");
  ui.timerDisplay.textContent = String(ROUND_TIME_SECONDS);
  addFloatingText(`${playerData.specialName} ready at 100%`, canvas.width / 2, 92, player.colors.suit, 22, 1.2);
  updateUI();
  updateGameplayChrome();
}

function startIntroFight() {
  if (!pendingStart) return;
  gameState = "playing";
  ui.vsOverlay.classList.add("hidden");
  ui.roundStatus.textContent = selectedMatchType === "timed" ? `${player.name} vs ${enemy.name} • Timed` : `${player.name} vs ${enemy.name} • Untimed`;
  pendingStart = null;
  updateGameplayChrome();
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
  const specialRange = specialType === "lightning" ? 240 : specialType === "roundhouse" ? 155 : specialType === "clinch" ? 138 : specialType === "gravity" ? 210 : specialType === "cyclone" ? 225 : specialType === "breaker" ? 150 : specialType === "shell" ? 185 : 175;
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
  const typeRate = type === "lightning" || type === "barrage" ? 14 : type === "clinch" || type === "breaker" ? 8.5 : type === "reversal" || type === "sweep" ? (enemy.blocking ? 14 : 10.5) : type === "gravity" || type === "shell" ? 10 : 11.5;
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
  const typeGain = playerType === "lightning" || playerType === "barrage" ? 3.2 : playerType === "clinch" || playerType === "breaker" ? 2.15 : playerType === "gravity" || playerType === "shell" ? 2.4 : 2.75;
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
    const idealRange = behavior === "grappler" || behavior === "berserker" ? 84 : behavior === "kicker" ? 128 : behavior === "control" || behavior === "guard" ? 168 : behavior === "evasive" ? 148 : 116;
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
    const blockChance = behavior === "counter" || behavior === "punish" ? 0.82 : behavior === "guard" ? 0.9 : behavior === "grappler" ? 0.5 : behavior === "berserker" ? 0.36 : 0.62;
    if (playerAttackingNearby && enemy.stamina > 18 && Math.random() < blockChance * difficultyFactor) {
      enemy.blocking = true;
      enemy.aiBlockTimer = 0.34 + Math.random() * 0.24;
      return;
    }

    const aiDashCost = safeNumber(enemy.fighterData?.stats?.dashCost, STATS.dashCost);
    const dashChance = behavior === "pressure" || behavior === "combo" ? 0.62 : behavior === "grappler" || behavior === "berserker" ? 0.52 : behavior === "evasive" ? 0.7 : behavior === "control" || behavior === "guard" ? 0.24 : 0.42;
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

    const wantsCounter = (enemy.fighterData.specialType === "reversal" || enemy.fighterData.specialType === "sweep") && player.state === "attack" && absDistance < 170;
    const specialRangeOk = enemy.fighterData.specialType === "gravity" || enemy.fighterData.specialType === "cyclone" ? absDistance < 230 : absDistance < 170;
    if (enemy.special >= enemy.maxSpecial && enemy.stamina > 32 && enemy.aiSpecialPatience <= 0 && (wantsCounter || (specialRangeOk && Math.random() < 0.28 * difficultyFactor))) {
      enemy.aiSpecialPatience = 1.8 + Math.random() * 2.2;
      startAttack(enemy, "special", player);
      return;
    }

    const attackRange = behavior === "kicker" ? 148 : behavior === "grappler" || behavior === "berserker" ? 105 : behavior === "control" || behavior === "guard" ? 132 : 125;
    if (absDistance < attackRange && enemy.stamina > 12 && Math.random() < 0.72 * difficultyFactor) {
      const kickBias = behavior === "kicker" ? 0.68 : behavior === "pressure" || behavior === "combo" ? 0.2 : behavior === "berserker" ? 0.48 : 0.34;
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
  if (fighter.dragonShellTimer > 0) {
    fighter.dragonShellTimer -= dt;
    if (Math.random() < 0.18) addAuraBurst(fighter.x, fighter.y - 90, fighter.colors.suit, 1);
  }
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
  } else if (special === "sweep") {
    if (!attacker.hitStepsDone.includes("frost") && attacker.attack.elapsed >= 0.22) {
      attacker.hitStepsDone.push("frost");
      defender.gravityTimer = 2.8;
      defender.gravitySource = attacker.colors.suit;
      addFloatingText("FROST SLOW", defender.x, defender.y - 168, attacker.colors.suit, 23, 1);
    }
    hits = [{ time: 0.38, damage: attacker.attack.countered ? 28 : 22, knockback: 285, name: "kick", range: 142, final: true }];
  } else if (special === "barrage") {
    if (Math.random() < 0.6) addAfterImage(attacker);
    hits = [
      { time: 0.2, damage: 5, knockback: 60, name: "punch" },
      { time: 0.32, damage: 5, knockback: 70, name: "punch" },
      { time: 0.45, damage: 5, knockback: 80, name: "punch" },
      { time: 0.62, damage: 6, knockback: 115, name: "kick" },
      { time: 0.82, damage: 7, knockback: 250, name: "special", final: true }
    ];
    if (!attacker.hitStepsDone.includes("drain") && attacker.attack.elapsed >= 0.9) {
      attacker.hitStepsDone.push("drain");
      attacker.stamina = clampNumber(attacker.stamina - 16, 0, attacker.maxStamina, 0);
    }
  } else if (special === "breaker") {
    hits = [{ time: 0.66, damage: 34, knockback: 500, name: "special", range: 150, final: true }];
    if (defender.blocking && attacker.attack.elapsed >= 0.55) defender.stamina = clampNumber(defender.stamina - 18, 0, defender.maxStamina, 0);
  } else if (special === "solar") {
    if (!attacker.hitStepsDone.includes("flare") && attacker.attack.elapsed >= 0.18) {
      attacker.hitStepsDone.push("flare");
      screenFlash = Math.max(screenFlash, 0.35);
      addFloatingText("SOLAR FEINT", attacker.x, attacker.y - 168, attacker.colors.suit, 23, 0.75);
    }
    hits = [
      { time: 0.42, damage: 8, knockback: 95, name: "punch" },
      { time: 0.58, damage: 9, knockback: 120, name: "kick" },
      { time: 0.74, damage: 12, knockback: 315, name: "special", final: true }
    ];
  } else if (special === "cyclone") {
    if (!attacker.hitStepsDone.includes("slip") && attacker.attack.elapsed >= 0.18) {
      attacker.hitStepsDone.push("slip");
      attacker.x = clampNumber(defender.x - attacker.facing * 74, STATS.arenaPadding, canvas.width - STATS.arenaPadding, attacker.x);
      attacker.facing = defender.x > attacker.x ? 1 : -1;
      addAfterImage(attacker);
      addSpeedLines(attacker.x, attacker.y - 80, attacker.facing, 24, attacker.colors.suit);
    }
    hits = [{ time: 0.42, damage: 23, knockback: 320, name: "special", range: 190, final: true }];
  } else if (special === "shell") {
    if (!attacker.hitStepsDone.includes("shell")) {
      attacker.hitStepsDone.push("shell");
      attacker.dragonShellTimer = 5;
      attacker.stamina = clampNumber(attacker.stamina + 22, 0, attacker.maxStamina, attacker.maxStamina);
      addFloatingText("DRAGON SHELL", attacker.x, attacker.y - 168, attacker.colors.suit, 25, 1.2);
    }
    hits = [{ time: 0.56, damage: attacker.blocking ? 22 : 16, knockback: 220, name: "special", range: 170, final: true }];
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
    if (defender.dragonShellTimer > 0) {
      finalDamage *= 0.55;
      defender.special = clampNumber(defender.special + 8, 0, defender.maxSpecial, 0);
      addFloatingText("SHELL GUARD", defender.x, defender.y - 175, defender.colors.suit, 18, 0.7);
    }
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
    ui.endMessage.textContent = `Both fighters were nearly even. Choose Rematch for the same fight, Back to Character Select for a new fighter, or Main Menu.`;
    ui.roundStatus.textContent = "Draw";
  } else {
    const playerWon = winner === player;
    const loser = playerWon ? enemy : player;
    ui.endTitle.textContent = playerWon ? "Victory!" : "Defeat";
    ui.endMessage.textContent = `${winner.name} defeats ${loser.name}. ${resultType}. Choose Rematch for the same fight, Back to Character Select for a new fighter, or Main Menu.`;
    ui.roundStatus.textContent = `${winner.name} Wins`;
  }
  ui.endOverlay.classList.remove("hidden");
  keys.clear();
  updateGameplayChrome();
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
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#121944");
  sky.addColorStop(0.36, "#070914");
  sky.addColorStop(0.72, "#090610");
  sky.addColorStop(1, "#050309");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atmospheric haze and tournament wall glow.
  for (const glow of [
    { x: 160, y: 70, r: 260, c: "rgba(104,247,255,0.18)" },
    { x: 800, y: 82, r: 280, c: "rgba(255,77,118,0.16)" },
    { x: 480, y: 95, r: 330, c: "rgba(247,216,74,0.1)" }
  ]) {
    const g = ctx.createRadialGradient(glow.x, glow.y, 10, glow.x, glow.y, glow.r);
    g.addColorStop(0, glow.c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, STATS.groundY + 40);
  }

  // Layered crowd silhouettes with occasional glow sticks.
  for (let row = 0; row < 3; row++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.28 + row * 0.14})`;
    const baseY = 242 + row * 23;
    for (let i = 0; i < 34; i++) {
      const x = i * 31 + (row % 2) * 13;
      const h = 18 + ((i + row) % 5) * 7;
      ctx.fillRect(x, baseY - h, 20, h);
      ctx.beginPath();
      ctx.arc(x + 10, baseY - h - 4, 8, 0, Math.PI * 2);
      ctx.fill();
      if ((i + row) % 11 === 0) {
        ctx.strokeStyle = row % 2 ? "rgba(255,77,118,0.46)" : "rgba(104,247,255,0.46)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, baseY - h - 22);
        ctx.lineTo(x + 5, baseY - h - 8);
        ctx.stroke();
      }
    }
  }

  // Overhead truss, light bars, and cones.
  ctx.strokeStyle = "rgba(238,244,255,0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(70, 48); ctx.lineTo(890, 48);
  ctx.moveTo(110, 26); ctx.lineTo(850, 26);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const x = 110 + i * 92;
    ctx.strokeStyle = "rgba(238,244,255,0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x + 42, 48); ctx.stroke();
  }
  for (const light of [{ x: 150, c: "#68f7ff" }, { x: 480, c: "#f7d84a" }, { x: 810, c: "#ff4d76" }]) {
    const cone = ctx.createRadialGradient(light.x, 58, 10, light.x, 220, 300);
    cone.addColorStop(0, `${light.c}70`);
    cone.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.ellipse(light.x, 205, 225, 190, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light.c;
    roundRect(light.x - 46, 42, 92, 10, 5);
  }

  // Hex cage: angled mesh, posts, and bright upper/lower rails.
  ctx.save();
  ctx.beginPath();
  ctx.rect(40, 70, canvas.width - 80, STATS.groundY - 42);
  ctx.clip();
  ctx.strokeStyle = "rgba(104, 247, 255, 0.18)";
  ctx.lineWidth = 2;
  for (let x = -canvas.height; x < canvas.width + canvas.height; x += 34) {
    ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x + canvas.height * 0.9, STATS.groundY + 18); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 77, 118, 0.13)";
  for (let x = 0; x < canvas.width + canvas.height; x += 34) {
    ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x - canvas.height * 0.9, STATS.groundY + 18); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(238,244,255,0.28)";
  ctx.lineWidth = 7;
  for (const postX of [58, 212, 748, 902]) {
    ctx.beginPath(); ctx.moveTo(postX, 64); ctx.lineTo(postX, STATS.groundY + 24); ctx.stroke();
    ctx.strokeStyle = "rgba(104,247,255,0.26)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(postX + 8, 70); ctx.lineTo(postX + 8, STATS.groundY + 18); ctx.stroke();
    ctx.strokeStyle = "rgba(238,244,255,0.28)";
    ctx.lineWidth = 7;
  }
  ctx.strokeStyle = "rgba(184,250,255,0.44)";
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(50, 72); ctx.lineTo(910, 72); ctx.moveTo(42, STATS.groundY + 21); ctx.lineTo(918, STATS.groundY + 21); ctx.stroke();

  // Arena floor with perspective texture, sponsor mark, and fighter contact area.
  const floor = ctx.createLinearGradient(0, STATS.groundY - 20, 0, canvas.height);
  floor.addColorStop(0, "#252b4b");
  floor.addColorStop(0.45, "#121426");
  floor.addColorStop(1, "#07040a");
  ctx.fillStyle = floor;
  ctx.fillRect(0, STATS.groundY + 18, canvas.width, canvas.height - STATS.groundY);
  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.moveTo(40 + i * 70, STATS.groundY + 22);
    ctx.lineTo(-90 + i * 92, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, STATS.groundY + 45 + i * 24, 370 + i * 42, 72 + i * 20, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(247,216,74,0.34)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + i * Math.PI / 4;
    const x = canvas.width / 2 + Math.cos(a) * 300;
    const y = STATS.groundY + 50 + Math.sin(a) * 66;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(104, 247, 255, 0.08)";
  ctx.font = "900 74px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("CAGE SPIRIT", canvas.width / 2, 194);
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  ctx.font = "900 52px Trebuchet MS";
  ctx.fillText("DARK TOURNAMENT", canvas.width / 2, STATS.groundY + 82);
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
  const data = fighter.fighterData || {};
  const visual = data.visual || getFighterVisual(data);
  const specialType = data.specialType || "rush";
  const t = performance.now() / 1000;
  const attacking = fighter.state === "attack";
  const attackType = fighter.attack?.type;
  const attackProgress = fighter.attack ? clampNumber(fighter.attack.elapsed / Math.max(0.01, fighter.attack.windup + fighter.attack.active + fighter.attack.recovery), 0, 1, 0) : 0;
  const punchPose = attacking && ["punch", "combo", "special"].includes(attackType);
  const kickPose = attacking && ["kick", "combo", "special"].includes(attackType);
  const blockPose = fighter.blocking || fighter.guardBroken;
  const sx = visual.scaleX || 1;
  const shoulder = 31 * (visual.shoulder || 1);
  const torso = visual.torso || 1;
  const leg = visual.leg || 1;
  const guard = visual.guard || 1;
  const idleBreath = Math.sin(t * 7 + (visual.scaleX || 1)) * 1.6;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.scale(sx, 1);

  drawAuraGlyph(c, visual, specialType, fighter.special >= fighter.maxSpecial || attackType === "special", t);

  // Grounded contact shadow sells weight before limb details are drawn.
  ctx.fillStyle = "rgba(0,0,0,0.36)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 48 / sx, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const rearHip = { x: -14, y: -58 };
  const frontHip = { x: 14, y: -58 };
  const rearKnee = { x: -28, y: -31 + idleBreath * 0.3 };
  const rearFoot = { x: -39, y: -4 };
  let frontKnee = { x: 25, y: -30 - idleBreath * 0.2 };
  let frontFoot = { x: 42, y: -4 };

  if (kickPose) {
    const ext = attackType === "special" ? 92 : attackType === "combo" ? 76 : 68;
    const lift = attackType === "special" ? -60 : -48;
    frontKnee = { x: 38 + attackProgress * 12, y: -60 };
    frontFoot = { x: ext, y: lift + Math.sin(attackProgress * Math.PI) * -10 };
  } else if (visual.stance === "low" || visual.stance === "evasive") {
    frontFoot.x += 12;
    frontKnee.y += 8;
    rearFoot.x -= 8;
  } else if (["grappler", "brute", "guard"].includes(visual.stance)) {
    frontFoot.x += 5;
    rearFoot.x -= 5;
  }

  drawSegment(rearHip, rearKnee, 15 * leg, c.skin, c.trim);
  drawSegment(rearKnee, rearFoot, 13 * leg, c.skin, c.trim);
  drawSegment(frontHip, frontKnee, 15 * leg, c.skin, c.trim);
  drawSegment(frontKnee, frontFoot, 13 * leg, c.skin, c.trim);
  drawShoe(rearFoot.x - 13, rearFoot.y - 8, 30, 13, c.shoe, c.trim);
  drawShoe(frontFoot.x - (kickPose ? 12 : 13), frontFoot.y - 8, kickPose ? 34 : 34, 14, c.shoe, c.trim);

  // Shorts/waist have asymmetric panels and trim so each palette reads at game size.
  ctx.fillStyle = c.shorts;
  ctx.beginPath();
  ctx.moveTo(-31, -72);
  ctx.lineTo(31, -72);
  ctx.lineTo(27, -42);
  ctx.lineTo(8, -49);
  ctx.lineTo(0, -36);
  ctx.lineTo(-10, -49);
  ctx.lineTo(-28, -42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.trim;
  roundRect(-31, -74, 62, 8, 4);
  ctx.fillStyle = colorWithAlpha(c.detail || c.trim, 0.7);
  roundRect(17, -66, 6, 22, 3);
  if (["judoka", "monk", "guardian"].includes(visual.build)) {
    ctx.fillStyle = colorWithAlpha(c.trim, 0.82);
    roundRect(-24, -70, 48, 8, 3);
  }

  // Torso silhouette: broader shoulders, clear neck, layered rashguard/gi/armor panels.
  const topY = -118 - idleBreath;
  const waistY = -70;
  ctx.fillStyle = c.suit;
  ctx.beginPath();
  ctx.moveTo(-shoulder, topY + 12);
  ctx.quadraticCurveTo(0, topY - 13 * torso, shoulder, topY + 12);
  ctx.lineTo(22 * torso, waistY);
  ctx.lineTo(-23 * torso, waistY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colorWithAlpha(c.trim, 0.2);
  ctx.beginPath();
  ctx.moveTo(-shoulder + 8, topY + 15);
  ctx.lineTo(0, waistY - 3);
  ctx.lineTo(shoulder - 9, topY + 15);
  ctx.lineTo(14, topY + 2);
  ctx.lineTo(0, waistY - 18);
  ctx.lineTo(-14, topY + 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colorWithAlpha(c.detail || c.trim, 0.88);
  ctx.lineWidth = 3;
  ctx.beginPath();
  drawChestMark(visual.emblem, specialType);
  ctx.stroke();
  ctx.fillStyle = colorWithAlpha(c.trim, 0.8);
  if (["heavy", "brute", "guardian"].includes(visual.build)) {
    roundRect(-shoulder - 5, topY + 10, 17, 12, 5);
    roundRect(shoulder - 12, topY + 10, 17, 12, 5);
  }

  const leftShoulder = { x: -shoulder + 3, y: topY + 17 };
  const rightShoulder = { x: shoulder - 3, y: topY + 17 };
  let leftElbow = { x: -42, y: -91 };
  let leftHand = { x: -51, y: -78 };
  let rightElbow = { x: 43, y: -92 };
  let rightHand = { x: 49, y: -80 };

  if (blockPose) {
    leftElbow = { x: -25 * guard, y: -119 };
    leftHand = { x: -11 * guard, y: -139 };
    rightElbow = { x: 25 * guard, y: -117 };
    rightHand = { x: 13 * guard, y: -136 };
  } else if (punchPose) {
    const reach = attackType === "special" ? 86 : attackType === "combo" ? 70 : 58;
    rightElbow = { x: 43, y: -111 };
    rightHand = { x: reach, y: -113 - Math.sin(attackProgress * Math.PI) * 5 };
    leftElbow = { x: -28, y: -104 };
    leftHand = { x: -39, y: -88 };
  } else if (visual.stance === "boxer") {
    leftElbow = { x: -24, y: -112 };
    leftHand = { x: -10, y: -132 };
    rightElbow = { x: 29, y: -111 };
    rightHand = { x: 18, y: -129 };
  } else if (visual.stance === "monk") {
    leftElbow = { x: -38, y: -103 };
    leftHand = { x: -24, y: -116 };
    rightElbow = { x: 39, y: -103 };
    rightHand = { x: 25, y: -116 };
  } else if (["grappler", "brute", "guard"].includes(visual.stance)) {
    leftElbow = { x: -48, y: -92 };
    leftHand = { x: -45, y: -73 };
    rightElbow = { x: 48, y: -91 };
    rightHand = { x: 45, y: -74 };
  }

  drawSegment(leftShoulder, leftElbow, 13, c.skin, c.trim);
  drawSegment(leftElbow, leftHand, 11, c.skin, c.glove);
  drawSegment(rightShoulder, rightElbow, 13, c.skin, c.trim);
  drawSegment(rightElbow, rightHand, 11, c.skin, c.glove);
  drawGlove(leftHand.x - 10, leftHand.y - 9, c.glove, c.trim);
  drawGlove(rightHand.x - 10, rightHand.y - 9, c.glove, c.trim);

  // Neck, head, facial details, and unique anime hair silhouettes.
  ctx.fillStyle = c.skin;
  roundRect(-10, -132, 20, 18, 7);
  ctx.beginPath();
  ctx.arc(0, -148, 21, 0, Math.PI * 2);
  ctx.fill();
  drawHairShape(visual.hair, c);
  ctx.fillStyle = visual.eye || "#0b1020";
  roundRect(-12, -151, 7, 3, 1.5);
  roundRect(6, -151, 7, 3, 1.5);
  ctx.strokeStyle = "rgba(0,0,0,0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-7, -140);
  ctx.quadraticCurveTo(0, -136, 8, -140);
  ctx.stroke();
  drawHeadAccessory(visual, c, specialType);

  if (fighter.guardBroken) {
    ctx.fillStyle = "#ff4d76";
    ctx.font = "900 16px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("STUN", 0, -184);
  }
  ctx.restore();
}

function drawSegment(a, b, width, color, accent) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.strokeStyle = colorWithAlpha(accent || "#ffffff", 0.5);
  ctx.lineWidth = Math.max(2, width * 0.22);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawShoe(x, y, w, h, color, trim) {
  ctx.fillStyle = color;
  roundRect(x, y, w, h, 6);
  ctx.fillStyle = colorWithAlpha(trim, 0.85);
  roundRect(x + w * 0.58, y + h - 4, w * 0.34, 3, 2);
}

function drawGlove(x, y, color, trim) {
  ctx.fillStyle = color;
  roundRect(x, y, 23, 19, 8);
  ctx.fillStyle = colorWithAlpha(trim, 0.76);
  roundRect(x + 3, y + 3, 16, 4, 3);
}

function drawChestMark(emblem, specialType) {
  if (emblem === "bolt") { ctx.moveTo(-12, -112); ctx.lineTo(4, -99); ctx.lineTo(-5, -88); ctx.lineTo(15, -74); return; }
  if (emblem === "plate") { ctx.strokeRect(-19, -111, 38, 32); return; }
  if (emblem === "flame") { ctx.moveTo(0, -75); ctx.bezierCurveTo(-19, -92, -4, -114, 2, -122); ctx.bezierCurveTo(18, -100, 14, -84, 0, -75); return; }
  if (emblem === "moon") { ctx.arc(3, -96, 19, 0.45, Math.PI * 1.55); return; }
  if (emblem === "orbit") { ctx.ellipse(0, -96, 25, 12, -0.4, 0, Math.PI * 2); ctx.moveTo(-22, -96); ctx.lineTo(22, -96); return; }
  if (emblem === "snow") { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.moveTo(Math.cos(a) * 4, -96 + Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 22, -96 + Math.sin(a) * 22); } return; }
  if (emblem === "neon") { ctx.moveTo(-17, -108); ctx.lineTo(17, -108); ctx.lineTo(-12, -78); ctx.lineTo(17, -78); return; }
  if (emblem === "oni") { ctx.moveTo(-17, -82); ctx.quadraticCurveTo(0, -120, 17, -82); ctx.moveTo(-17, -108); ctx.lineTo(17, -108); return; }
  if (emblem === "sun") { ctx.arc(0, -96, 15, 0, Math.PI * 2); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.moveTo(Math.cos(a) * 20, -96 + Math.sin(a) * 20); ctx.lineTo(Math.cos(a) * 27, -96 + Math.sin(a) * 27); } return; }
  if (emblem === "vortex") { ctx.arc(0, -96, 22, 0.2, Math.PI * 1.8); ctx.arc(0, -96, 11, 0.2, Math.PI * 1.4); return; }
  if (emblem === "dragon") { ctx.moveTo(-19, -83); ctx.bezierCurveTo(-4, -126, 32, -105, 8, -82); return; }
  ctx.moveTo(0, -116); ctx.lineTo(0, -74);
}

function drawHairShape(hair, c) {
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  if (hair === "bolt") {
    ctx.moveTo(-22, -154); ctx.lineTo(-8, -176); ctx.lineTo(-1, -158); ctx.lineTo(14, -178); ctx.lineTo(10, -158); ctx.lineTo(25, -162); ctx.quadraticCurveTo(8, -176, -22, -160);
  } else if (hair === "crop") {
    ctx.ellipse(0, -160, 23, 13, 0, Math.PI, Math.PI * 2);
  } else if (hair === "flame") {
    ctx.moveTo(-20, -153); ctx.lineTo(-8, -174); ctx.lineTo(-2, -158); ctx.lineTo(7, -182); ctx.lineTo(14, -157); ctx.lineTo(24, -164); ctx.quadraticCurveTo(13, -177, -18, -162);
  } else if (hair === "veil") {
    ctx.moveTo(-22, -158); ctx.quadraticCurveTo(-8, -177, 22, -160); ctx.lineTo(18, -133); ctx.quadraticCurveTo(2, -143, -19, -134);
  } else if (hair === "topknot") {
    ctx.ellipse(0, -162, 19, 11, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, -178, 8, 0, Math.PI * 2);
  } else if (hair === "swept") {
    ctx.moveTo(-23, -154); ctx.quadraticCurveTo(2, -181, 29, -160); ctx.lineTo(7, -156); ctx.lineTo(-4, -147);
  } else if (hair === "neon") {
    ctx.moveTo(-22, -156); ctx.lineTo(-5, -180); ctx.lineTo(2, -158); ctx.lineTo(22, -171); ctx.lineTo(14, -151); ctx.lineTo(-18, -146);
  } else if (hair === "horns") {
    ctx.moveTo(-23, -153); ctx.lineTo(-31, -170); ctx.lineTo(-10, -160); ctx.lineTo(0, -171); ctx.lineTo(10, -160); ctx.lineTo(31, -170); ctx.lineTo(23, -153); ctx.quadraticCurveTo(0, -165, -23, -153);
  } else if (hair === "crown") {
    ctx.moveTo(-22, -154); ctx.lineTo(-12, -171); ctx.lineTo(-2, -158); ctx.lineTo(8, -173); ctx.lineTo(18, -155); ctx.quadraticCurveTo(5, -166, -22, -154);
  } else if (hair === "tail") {
    ctx.ellipse(0, -160, 20, 12, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(16, -160); ctx.quadraticCurveTo(42, -151, 32, -126); ctx.lineTo(24, -130); ctx.quadraticCurveTo(31, -149, 10, -153);
  } else if (hair === "crest") {
    ctx.moveTo(-20, -154); ctx.lineTo(-4, -174); ctx.lineTo(0, -157); ctx.lineTo(14, -172); ctx.lineTo(23, -153); ctx.quadraticCurveTo(4, -166, -20, -154);
  } else {
    ctx.moveTo(-21, -151); ctx.lineTo(-11, -169); ctx.lineTo(-4, -153); ctx.lineTo(7, -170); ctx.lineTo(13, -153); ctx.lineTo(24, -158); ctx.quadraticCurveTo(12, -172, -20, -160);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeadAccessory(visual, c, specialType) {
  ctx.strokeStyle = c.trim;
  ctx.fillStyle = c.trim;
  ctx.lineWidth = 2.5;
  if (["gravity", "shell", "dragon"].includes(visual.aura) || ["gravity", "shell"].includes(specialType)) {
    ctx.beginPath(); ctx.arc(0, -149, specialType === "shell" ? 32 : 28, 0.15, Math.PI * 1.32); ctx.stroke();
  }
  if (["assassin", "ninja"].includes(visual.build)) {
    roundRect(-24, -151, 8, 7, 3); roundRect(16, -151, 8, 7, 3);
  }
  if (visual.hair === "horns") {
    ctx.beginPath(); ctx.moveTo(-22, -162); ctx.lineTo(-36, -175); ctx.moveTo(22, -162); ctx.lineTo(36, -175); ctx.stroke();
  }
}

function drawAuraGlyph(c, visual, specialType, energized, t) {
  const glow = energized ? 1 : 0.42;
  ctx.save();
  ctx.globalAlpha *= glow;
  ctx.strokeStyle = c.suit;
  ctx.fillStyle = colorWithAlpha(c.suit, energized ? 0.2 : 0.09);
  ctx.lineWidth = energized ? 4 : 2;
  if (["gravity", "orbit"].includes(visual.aura) || specialType === "gravity") {
    ctx.beginPath(); ctx.ellipse(0, -82, 58 + Math.sin(t * 5) * 5, 88, t * 0.4, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -82, 82, 20, -0.35, 0, Math.PI * 2); ctx.stroke();
  } else if (["flame", "crimson"].includes(visual.aura)) {
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-45 + i * 30, -22); ctx.quadraticCurveTo(-32 + i * 30, -70 - Math.sin(t * 6 + i) * 10, -22 + i * 30, -34); ctx.stroke(); }
  } else if (visual.aura === "lightning") {
    for (let i = 0; i < 4; i++) { const x = -52 + i * 35; ctx.beginPath(); ctx.moveTo(x, -42); ctx.lineTo(x + 15, -69); ctx.lineTo(x + 4, -72); ctx.lineTo(x + 20, -104); ctx.stroke(); }
  } else if (visual.aura === "ice") {
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + t * 0.2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 44, -74 + Math.sin(a) * 68); ctx.lineTo(Math.cos(a) * 52, -74 + Math.sin(a) * 80); ctx.stroke(); }
  } else if (visual.aura === "wind") {
    ctx.beginPath(); ctx.arc(0, -72, 62, Math.sin(t) * 0.5, Math.PI * 1.45); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -88, 38, Math.PI, Math.PI * 2.35); ctx.stroke();
  } else if (visual.aura === "dragon") {
    ctx.beginPath(); ctx.moveTo(-55, -42); ctx.bezierCurveTo(-15, -124, 72, -120, 38, -44); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.ellipse(0, -76, 56 + Math.sin(t * 5) * 4, 90, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function colorWithAlpha(color, alpha) {
  if (!color) return `rgba(255,255,255,${alpha})`;
  if (color.startsWith("rgba")) return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
  if (color.startsWith("rgb(")) return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16), g = parseInt(hex[1] + hex[1], 16), b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
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
ui.randomButton.addEventListener("click", () => {
  const randomFighter = FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)];
  selectFighter(randomFighter.id);
  ui.roundStatus.textContent = `${normalizeFighterData(randomFighter).name} selected randomly`;
});

function createRandomMatch() {
  const randomPlayer = normalizeFighterData(FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)]);
  selectedFighterId = randomPlayer.id;
  const randomEnemy = chooseEnemyData(randomPlayer.id);
  lastPlayerId = randomPlayer.id;
  lastEnemyId = randomEnemy.id;
  selectedMatchType = Math.random() < 0.5 ? "timed" : "untimed";
  setConfirmState();
  renderCharacterCards();
  updateFighterPreview();
  ui.roundStatus.textContent = "Random Match Created";
  showMatchOptions(randomEnemy.id);
}

if (ui.randomMatchButton) ui.randomMatchButton.addEventListener("click", createRandomMatch);
ui.confirmButton.addEventListener("click", confirmSelection);
ui.timedMatchButton.addEventListener("click", () => chooseMatchType("timed"));
ui.untimedMatchButton.addEventListener("click", () => chooseMatchType("untimed"));
ui.optionsBackButton.addEventListener("click", showCharacterSelect);
ui.beginVsButton.addEventListener("click", beginVsScreen);
ui.rematchButton.addEventListener("click", rematch);
ui.endSelectButton.addEventListener("click", showCharacterSelect);
ui.endMainMenuButton.addEventListener("click", showTitleScreen);
ui.pauseButton.addEventListener("click", togglePause);
ui.resumeButton.addEventListener("click", () => setPaused(false));
ui.pauseRematchButton.addEventListener("click", rematch);
ui.pauseSelectButton.addEventListener("click", showCharacterSelect);
ui.pauseMainMenuButton.addEventListener("click", showTitleScreen);

// Create fighters once so the title screen has a background scene.
player = createFighter(FIGHTERS[0], 260, 1, true);
enemy = createFighter(FIGHTERS[1], 700, -1, false);
renderCharacterCards();
updateFighterPreview();
updateUI();
updateGameplayChrome();
requestAnimationFrame(gameLoop);
