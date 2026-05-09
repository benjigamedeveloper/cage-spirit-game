# Cage Spirit

**Cage Spirit** is a polished, beginner-friendly anime MMA arcade fighting-game website built with only `index.html`, `style.css`, and vanilla `game.js`. It uses original anime-style fighters, non-graphic cinematic effects, stamina management, blocking, dashing, a pause system, a VS intro, and stable full matches that work directly on GitHub Pages.

## How to Run

No installs are required.

1. Download or clone this folder.
2. Open `index.html` directly in a modern browser, or publish the folder to GitHub Pages.
3. Click **Start Game**.
4. Pick a Fighter Card. The selected card glows and its label changes from **Select** to **Selected**.
5. Use the preview panel to review OVR, special move, strengths, weaknesses, and stat bars.
6. Press the large visible **Confirm Fighter** button after choosing a card.
7. Choose **Timed Match** or **Untimed Match**, then press **Start Fight**.

The game does **not** require npm, Node, React, Phaser, external libraries, a bundler, or a setup step.

## Match Flow

```text
Title Screen → Character Select → Match Options → VS Screen → Fight → Win/Lose Screen
```

The end screen includes one replay option: **Rematch**. It keeps the same fighters and match type. You can also choose **Back to Character Select** or **Main Menu**.

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
| `Space` | During Final Clash only, tap repeatedly to build Player Clash Power |

### Pause Controls

The fight can be paused with the visible **Pause** button or the `P` key. While paused, fighters, AI, timers, stamina regeneration, particles, and special effects stop. The pause overlay includes:

- **Resume**
- **Rematch**
- **Back to Character Select**
- **Main Menu**

## How to Play

Reduce the rival fighter's health to 0 before they defeat you. Before the VS screen, choose a match type:

- **Timed Match**: 75-second round timer, Final Clash in the last 10 seconds, and a decision by remaining health when time expires. If health is almost equal, the result is a draw.
- **Untimed Match**: no timer and no Final Clash. The fight continues until one fighter reaches 0 health and the result is **Won by KO**.

- Health, stamina, and special bars show exact values such as `85 / 100`.
- Punches, kicks, hops, dashes, blocking, and specials cost stamina.
- Stamina regenerates over time, but low stamina prevents move spam.
- Blocking reduces damage and creates guard sparks, but repeated pressure can cause guard break.
- Landing attacks builds special meter.
- Specials require a full `100 / 100` special meter and reset to `0 / 100` after use.
- No special instantly wins; stronger moves have range, timing, recovery, or stamina risks.
- In Timed Match, **Final Clash** starts at 10 seconds. Tap `Space` to build the player meter while the AI builds its meter automatically based on difficulty, stamina, health, and fighter type. The winner lands a cinematic final combo for strong but non-instant damage before the match decision.

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

All fighters are original characters made for Cage Spirit. Character select now presents original sports-card-style **Fighter Cards** with OVR, Power, Speed, Defense, Stamina, Technique, Special, playstyle, strengths, weaknesses, and special move info.

| Fighter | OVR | Power | Speed | Defense | Stamina | Technique | Special |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Spirit Brawler | 84 | 82 | 82 | 82 | 84 | 85 | 86 |
| Storm Boxer | 86 | 74 | 95 | 68 | 82 | 90 | 88 |
| Iron Wrestler | 85 | 94 | 58 | 92 | 80 | 76 | 87 |
| Flame Kicker | 85 | 88 | 84 | 74 | 80 | 84 | 89 |
| Shadow Counter | 87 | 76 | 82 | 91 | 88 | 94 | 90 |
| Gravity Monk | 86 | 72 | 78 | 88 | 86 | 92 | 93 |

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
- Fighting-game-style character select with a large **Choose Your Fighter** heading, clear instructions, selected-card glow, card label switching from **Select** to **Selected**, a selected fighter preview panel, a Random Fighter button, AI difficulty, and a large visible **Confirm Fighter** panel that stays disabled until a fighter is selected.
- Six original fighters with unique stats, colors, AI behavior preferences, silhouettes, hair/gear details, and special behaviors.
- Match Options screen with clearly selected Timed and Untimed rules before the VS intro, followed by the **Start Fight** button.
- VS intro before each match.
- Dark cage arena with fence pattern, floor grid, overhead lights, glowing edges, crowd silhouettes, shadows, and cinematic impact effects.
- Stable health, stamina, special, timer, and Final Clash bars that clamp to `0%`–`100%` and display exact current/max values.
- Safety checks for invalid fighter data, NaN values, arena bounds, health/stamina/special clamping, and effect cleanup.
- Responsive movement, dash dust, afterimages, knockback, hit pause, guard sparks, combo counter, low-stamina warnings, and special-ready glow.
- Kick animation extends the existing front leg only, avoiding extra limbs.
- AI behaviors tuned per fighter: balanced, pressure, grappler, kicker, counter, and control.
- Pause overlay with **Resume**, **Rematch**, **Back to Character Select**, and **Main Menu** actions.
- Win/lose screen with KO, Decision, or Draw result text plus **Rematch**, **Back to Character Select**, and **Main Menu** actions.

## Beginner Editing Guide

Open `game.js` and look near the top for:

- `FIGHTERS` to edit roster data, stats, colors, roles, strengths, weaknesses, special names, and AI behavior.
- `STATS` to edit movement, dash, hop, guard, arena, and stamina settings.
- `ATTACKS` to edit punch, kick, combo, and special timing/range templates.
- `ROUND_TIME_SECONDS` to edit the Timed Match round length.

Each fighter has clean data for id, name, role, difficulty, description, strengths, weaknesses, health, stamina, speed, damage, defense, dash cost, stamina regeneration, special, theme colors, and AI preference.

## Future Update Ideas

- Add sound effects and music toggles.
- Add best-of-three rounds.
- Add a training mode with hitboxes and input display.
- Add mobile touch controls.
- Add more arenas and entrance animations.
- Add more combo routes and tutorial missions.
