# Cage Spirit

**Cage Spirit** is a polished, beginner-friendly anime MMA arcade fighting-game website built with only `index.html`, `style.css`, and vanilla `game.js`. It uses original anime-style fighters, non-graphic cinematic effects, stamina management, blocking, dashing, a pause system, a VS intro, and stable full matches that work directly on GitHub Pages.

## How to Run

No installs are required.

1. Download or clone this folder.
2. Open `index.html` directly in a modern browser, or publish the folder to GitHub Pages.
3. Click **Choose Fighter**.
4. Pick a fighter, choose AI difficulty, and press **Start Fight**.

The game does **not** require npm, Node, React, Phaser, external libraries, a bundler, or a setup step.

## Match Flow

```text
Title Screen → Character Select → VS Intro → Fight → Win/Lose Screen
```

The end screen includes options to return to character select, rematch the same pairing, or restart the current match.

## Controls

| Key | Action |
| --- | --- |
| `A` | Move left |
| `D` | Move right |
| `W` | Quick hop |
| `Shift` | Dash in your current movement/facing direction |
| `J` | Fast punch |
| `K` | Heavier kick |
| `L` | Block / guard |
| `I` | Special attack when special meter is full |
| `P` | Pause / resume the fight |

### Pause Controls

The fight can be paused with the visible **Pause** button or the `P` key. While paused, fighters, AI, timers, stamina regeneration, particles, and special effects stop. The pause overlay includes:

- **Resume**
- **Restart Match**
- **Character Select**

## How to Play

Reduce the rival fighter's health to 0 before they defeat you.

- Health, stamina, and special bars show exact values such as `85 / 100`.
- Punches, kicks, hops, dashes, blocking, and specials cost stamina.
- Stamina regenerates over time, but low stamina prevents move spam.
- Blocking reduces damage and creates guard sparks, but repeated pressure can cause guard break.
- Landing attacks builds special meter.
- Specials require a full `100 / 100` special meter and reset to `0 / 100` after use.
- No special instantly wins; stronger moves have range, timing, recovery, or stamina risks.

## Combo

Land this sequence quickly to trigger a stronger finisher:

```text
Punch, Punch, Kick
J, J, K
```

## Difficulty Options

The character select screen includes three AI difficulty settings:

- **Easy**: slower decisions and less pressure.
- **Normal**: balanced arcade challenge.
- **Hard**: faster decisions, stronger blocking, and more confident special usage.

## Fighter Roster

All fighters are original characters made for Cage Spirit.

| Fighter | Role | Difficulty | Theme | Special |
| --- | --- | --- | --- | --- |
| **Spirit Brawler** | Balanced all-rounder | Easy | Blue/white spirit energy | **Spirit Rush**: a forward multi-hit anime MMA combo with reliable range, medium damage, and medium knockback. |
| **Storm Boxer** | Speed striker | Medium | Yellow lightning energy | **Lightning Step**: dashes through or behind the opponent with lightning afterimages, then lands rapid punches. |
| **Iron Wrestler** | Heavy grappler | Medium | Steel/grey energy | **Titan Clinch**: close-range clinch/slam-style impact with big knockback; too far becomes a weaker lunge. |
| **Flame Kicker** | Kick pressure fighter | Medium | Orange/red fire energy | **Inferno Roundhouse**: flaming roundhouse kick with a short-range shockwave and strong visual impact. |
| **Shadow Counter** | Defensive counter fighter | Hard | Purple/black shadow energy | **Phantom Reversal**: strong counter if the opponent is attacking; weaker shadow hit if mistimed. |
| **Gravity Monk** | Control/tricky fighter | Hard | Violet/space gravity energy | **Heavy Field**: creates a temporary gravity zone that slows the opponent and raises their dash/attack stamina costs. |

## Current Features

- Dark tournament title screen and controls/help panel.
- Fighting-game-style character select with selected highlight, random fighter button, AI preview, stat bars, strengths, weaknesses, roles, difficulty ratings, and special descriptions.
- Six original fighters with unique stats, colors, AI behavior preferences, silhouettes, hair/gear details, and special behaviors.
- VS intro before each match.
- Dark cage arena with fence pattern, floor grid, overhead lights, glowing edges, crowd silhouettes, shadows, and cinematic impact effects.
- Stable health, stamina, and special bars that clamp to `0%`–`100%` and display exact current/max values.
- Safety checks for invalid fighter data, NaN values, arena bounds, health/stamina/special clamping, and effect cleanup.
- Responsive movement, dash dust, afterimages, knockback, hit pause, guard sparks, combo counter, low-stamina warnings, and special-ready glow.
- Kick animation extends the existing front leg only, avoiding extra limbs.
- AI behaviors tuned per fighter: balanced, pressure, grappler, kicker, counter, and control.
- Pause overlay with resume, restart, and character-select flow.
- Win/lose screen with winner/loser summary, rematch, restart, and back-to-select actions.

## Beginner Editing Guide

Open `game.js` and look near the top for:

- `FIGHTERS` to edit roster data, stats, colors, roles, strengths, weaknesses, special names, and AI behavior.
- `STATS` to edit movement, dash, hop, guard, arena, and stamina settings.
- `ATTACKS` to edit punch, kick, combo, and special timing/range templates.

Each fighter has clean data for id, name, role, difficulty, description, strengths, weaknesses, health, stamina, speed, damage, defense, dash cost, stamina regeneration, special, theme colors, and AI preference.

## Future Update Ideas

- Add sound effects and music toggles.
- Add best-of-three rounds.
- Add a training mode with hitboxes and input display.
- Add mobile touch controls.
- Add more arenas and entrance animations.
- Add more combo routes and tutorial missions.
