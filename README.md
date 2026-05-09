# Cage Spirit

**Cage Spirit** is a complete beginner-friendly 2D browser game prototype about anime-style MMA combat. It mixes side-view cage fighting, arcade attacks, stamina management, blocking, and flashy anime impact effects while staying non-graphic and sports-style.

## How to Run

No installs are required.

1. Download or clone this folder.
2. Open `index.html` directly in any modern web browser.
3. Click **Start Fight**.

The game uses only HTML, CSS, and vanilla JavaScript. It does not require npm, Node, React, Phaser, or external libraries.

## How to Play

You control Rin, the blue fighter on the left. Defeat Kai, the red fighter, by reducing his health to 0 before he defeats you.

Manage your stamina carefully:

- Attacks, blocking, hopping, and dashing cost stamina.
- Stamina regenerates slowly over time.
- Attacks fail if your stamina is too low.
- Blocking reduces damage, but if stamina gets too low while guarding, your guard breaks and you are briefly stunned.
- Landing hits builds your special meter.
- When the special meter reaches 100%, use your anime special attack for big damage and screen shake.

## Controls

| Key | Action |
| --- | --- |
| `A` | Move left |
| `D` | Move right |
| `W` | Quick step / hop |
| `Shift` | Dash |
| `J` | Punch |
| `K` | Kick |
| `L` | Block / guard |
| `I` | Special anime attack when special meter is full |

## Combo

Land this sequence quickly to trigger a stronger finisher:

```text
Punch, Punch, Kick
J, J, K
```

If the combo lands in time, the game shows combo text and automatically fires a stronger spirit combo finisher.

## Beginner Editing Guide

Open `game.js` and look near the top for:

- `STATS` to edit health, stamina, movement speed, dash cost, regeneration, and guard settings.
- `ATTACKS` to edit punch, kick, combo, and special damage, range, stamina cost, knockback, and timing.
- `COLORS` to edit the player and enemy fighter colors.

These values are grouped together so new developers can experiment without digging through the full game loop.

## Current Prototype Features

- Title screen with **Start Fight** button.
- Side-view dark cage arena.
- Player versus AI opponent.
- Health, stamina, and special meter UI.
- Punch, kick, dash, hop, block, special attack, and combo finisher.
- AI movement, distance control, blocking, dashing, and stamina use.
- Knockback, hit pause, screen shake, speed lines, impact flashes, guard break, and floating damage numbers.
- End-of-match overlay with a restart button.

## Ideas for Future Updates

- Add character select with different fighters and stats.
- Add more combo routes and special moves.
- Add sound effects and music.
- Add a training mode with input display.
- Add best-of-three rounds.
- Add mobile touch controls.
- Replace shape fighters with sprite art or frame-by-frame animations.
- Add more arenas, entrances, and anime-style victory poses.
