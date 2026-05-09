# Cage Spirit

**Cage Spirit** is a beginner-friendly 2D browser game prototype about anime-style MMA combat. It mixes side-view cage fighting, arcade attacks, stamina management, blocking, dashing, and flashy non-graphic impact effects.

## How to Run

No installs are required.

1. Download or clone this folder.
2. Open `index.html` directly in any modern web browser.
3. Click **Start Fight**.

The game uses only HTML, CSS, and vanilla JavaScript. It does not require npm, Node, React, Phaser, or external libraries.

## How to Play

You control Rin, the blue/white fighter on the left. Defeat Kai, the red/dark rival fighter, by reducing his health to 0 before he defeats you.

Manage stamina carefully:

- Punches, kicks, blocking, hopping, special attacks, and dashing cost stamina.
- Stamina regenerates slowly, so repeated pressure can leave you unable to attack or dash.
- When stamina is too low, the game shows a low-stamina warning instead of letting moves spam.
- Blocking reduces damage and creates guard sparks, but taking too many blocked hits can cause a guard break.
- Landing hits builds your special meter.
- When the special meter reaches 100%, use Rin's cinematic **Azure Cage Rush**. It is a multi-hit anime MMA combo that deals strong damage, but it no longer instantly defeats the opponent.

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

## Combo

Land this sequence quickly to trigger a stronger finisher:

```text
Punch, Punch, Kick
J, J, K
```

If the combo lands in time, the game shows combo text and automatically fires a stronger spirit combo finisher.

## Current Prototype Features

- Title screen with an anime/MMA presentation.
- Dark neon cage arena with fence pattern, arena lights, floor markings, and crowd silhouettes.
- More detailed canvas fighters with heads, hair, face details, torsos, shorts, gloves/wraps, legs, shoes, and different silhouettes.
- Player versus active AI opponent that follows consistently, manages distance, blocks, backs up, dashes in, punches, and kicks.
- Health, stamina, and special meter UI.
- Punch, kick, dash, hop, block, special attack, and combo finisher.
- Improved dash with stamina cost, cooldown, speed lines, dust burst, and afterimages.
- Slower stamina regeneration with clear low-stamina feedback.
- Cinematic special attack with aura charge-up, screen flash, speed lines, hit pause, multi-hit impacts, final burst, camera shake, and move-name text.
- Knockback, hit reactions, guard sparks, dust, aura particles, floating damage numbers, and screen shake.
- End-of-match overlay with a restart button.

## Beginner Editing Guide

Open `game.js` and look near the top for:

- `STATS` to edit health, stamina, movement speed, dash cost, dash cooldown, regeneration, and guard settings.
- `ATTACKS` to edit punch, kick, combo, and special damage, range, stamina cost, knockback, and timing.
- `COLORS` to edit the player and enemy fighter colors.

These values are grouped together so new developers can experiment without digging through the full game loop.

## Ideas for Future Updates

- Add character select with different fighters and stats.
- Add more combo routes and special moves.
- Add sound effects and music.
- Add a training mode with input display.
- Add best-of-three rounds.
- Add mobile touch controls.
- Replace shape fighters with sprite art or frame-by-frame animations.
- Add more arenas, entrances, and anime-style victory poses.
