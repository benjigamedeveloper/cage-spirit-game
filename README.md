# Cage Spirit

**Cage Spirit** is a beginner-friendly 2D browser game prototype about original anime-style MMA combat. It mixes side-view cage fighting, arcade attacks, stamina management, blocking, dashing, character selection, and flashy non-graphic impact effects.

## How to Run

No installs are required.

1. Download or clone this folder.
2. Open `index.html` directly in any modern web browser.
3. Click **Choose Fighter**.
4. Select one of the five original fighters to start the match.

The game uses only HTML, CSS, and vanilla JavaScript. It does not require npm, Node, React, Phaser, or external libraries.

## How to Play

Pick a fighter on the character select screen, then defeat the AI rival by reducing their health to 0 before they defeat you. The AI randomly chooses a different fighter from the roster, uses that fighter's stats, and can spend a full special meter on that fighter's unique special move.

Manage stamina carefully:

- Punches, kicks, blocking, hopping, special attacks, and dashing cost stamina.
- Stamina regenerates slowly, so repeated pressure can leave you unable to attack or dash.
- When stamina is too low, the game shows a low-stamina warning instead of letting moves spam.
- Blocking reduces damage and creates guard sparks, but taking too many blocked hits can cause a guard break.
- Landing hits builds your special meter.
- Specials require 100% meter, reset the meter to 0 after use, and are balanced around strong but non-instant-win damage.

## Fighter Roster

All fighters are original anime-style MMA characters created for Cage Spirit.

| Fighter | Style | Theme | Stat Identity | Special |
| --- | --- | --- | --- | --- |
| **Spirit Brawler** | Balanced all-rounder | Blue/white energy | Balanced health, stamina, speed, punch, and kick damage | **Spirit Rush**: a fast, easy-to-use multi-hit rush combo with balanced damage and knockback. |
| **Storm Boxer** | Fast striker | Yellow/lightning energy | High speed and fast punches, lower health, lower kick damage | **Lightning Step**: blinks through or behind the opponent with afterimages, then lands rapid punches. |
| **Iron Wrestler** | Slow powerhouse grappler | Steel/grey energy | High health and damage, slow speed, higher stamina costs | **Titan Clinch**: if close, lands a heavy non-graphic slam-style impact with big knockback; if far, it becomes a weaker lunge. |
| **Flame Kicker** | Kick-focused pressure fighter | Orange/red fire energy | Strong kicks, medium speed, medium health, weaker punches | **Inferno Roundhouse**: a powerful flaming roundhouse with a short-range shockwave. |
| **Shadow Counter** | Defensive counter fighter | Purple/black shadow energy | Strong block, good stamina, medium-low direct damage | **Phantom Reversal**: counters hard if timed while the opponent attacks; mistimed use becomes a weaker shadow hit. |

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

## Combo

Land this sequence quickly to trigger a stronger finisher:

```text
Punch, Punch, Kick
J, J, K
```

If the combo lands in time, the game shows combo text and automatically fires a stronger spirit combo finisher.

## Current Prototype Features

- Title screen leading into a polished character selection screen.
- Five original anime MMA fighters with unique stats, colors, style descriptions, special move names, and abilities.
- Random AI fighter selection that avoids mirroring the player when possible.
- Dark neon cage arena with fence pattern, arena lights, floor markings, and crowd silhouettes.
- More detailed canvas fighters with heads, hair, face details, torsos, shorts, gloves/wraps, legs, shoes, color themes, aura effects, and style-specific body details.
- Player versus active AI opponent that follows consistently, manages distance, blocks, backs up, dashes in, punches, kicks, and sometimes uses full-meter specials.
- Health, stamina, and special meter UI that reflects each fighter's health/stamina maximums and special color theme.
- Punch, kick, dash, hop, block, special attack, pause/resume, and combo finisher.
- Improved dash with stamina cost, cooldown, speed lines, dust burst, and afterimages.
- Slower stamina regeneration with clear low-stamina feedback.
- Cinematic specials with aura charge-up, screen flash, speed lines, hit pause, themed impacts, camera shake, and move-name text.
- Knockback, hit reactions, guard sparks, dust, aura particles, floating damage numbers, and screen shake.
- Pause overlay with **Resume** and **Restart** buttons.
- End-of-match overlay with a **Choose Again** button.

## Beginner Editing Guide

Open `game.js` and look near the top for:

- `FIGHTERS` to edit the roster, fighter names, descriptions, stats, colors, special move names, and special ability descriptions.
- `STATS` to edit shared movement, dash, hop, guard, arena, and gravity-style settings.
- `ATTACKS` to edit shared punch, kick, combo, and special timing/range templates.

These values are grouped together so new developers can experiment without digging through the full game loop.

## Ideas for Future Updates

- Add more combo routes and special move variants.
- Add sound effects and music.
- Add a training mode with input display.
- Add best-of-three rounds.
- Add mobile touch controls.
- Replace shape fighters with sprite art or frame-by-frame animations.
- Add more arenas, entrances, and anime-style victory poses.
