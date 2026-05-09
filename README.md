# Cage Spirit

**Cage Spirit** is a polished vanilla HTML/CSS/JavaScript anime MMA arcade fighting game built to run directly from `index.html`, including on GitHub Pages. It uses only original fighters and non-graphic combat feedback: aura bursts, sparks, shockwaves, afterimages, camera shake, and Final Clash lighting instead of blood or gore.

## Game Overview

Pick an original tournament fighter, choose a Timed or Untimed match, watch the VS reveal, then fight inside a neon cage arena. Every fighter has a different stat spread, role, AI style, special move, strengths, weaknesses, and visual energy theme.

Main flow:

```text
Title Screen → Character Select → Match Options → VS Screen → Fight → Win/Lose Screen
```

## Controls

| Action | Key |
| --- | --- |
| Move | `A` / `D` |
| Hop | `W` |
| Dash | `Shift` |
| Punch | `J` |
| Kick | `K` |
| Block | `L` |
| Special | `I` when meter is full |
| Pause / Resume menu | `P` |
| Final Clash meter | Tap `Space` during Final Clash |

## Match Types

### Timed Match

- 75-second round timer.
- Final Clash triggers once in the final 10 seconds.
- If time expires, the winner is decided by remaining health.
- Close health totals can produce a draw.
- Result text reports **Won by KO**, **Won by Decision**, or **Draw**.

### Untimed Match

- No timer.
- No Final Clash.
- Match ends only by KO.

## Final Clash

Final Clash is a Timed Match comeback sequence in the last 10 seconds.

- The screen announces **FINAL CLASH!**
- Press `Space` repeatedly to build the player clash meter.
- The AI builds its meter automatically based on difficulty, stamina, health, and fighter style.
- Spacebar taps are rate-limited so holding the key cannot break the sequence.
- Final Clash damage is capped around 10–25 and can finish only a low-health opponent.
- If the meters are close, both fighters are pushed back and the round continues to decision.

## Randomiser Options

- **Random Fighter** chooses a random player fighter, updates the preview panel, and keeps the player on character select so they can change their mind.
- **Random Match** chooses a random player fighter, random opponent, and random Timed/Untimed rules, then shows the generated matchup on the Match Options/VS flow before the fight starts.
- Random opponents avoid mirroring the selected player fighter when possible.

## Roster and Specials

All characters are original anime MMA fighters created for Cage Spirit.

| Fighter | OVR | Role | Difficulty | Special |
| --- | ---: | --- | --- | --- |
| Spirit Brawler | 84 | Balanced all-rounder | Easy | **Spirit Rush** — blue spirit streaks and a reliable forward multi-hit combo. |
| Storm Boxer | 86 | Fast lightning striker | Medium | **Lightning Step** — yellow electric dash-through afterimages into rapid punches. |
| Iron Wrestler | 85 | Heavy grappler | Medium | **Titan Clinch** — close steel impact with big knockback, weaker if too far. |
| Flame Kicker | 85 | Kick pressure fighter | Medium | **Inferno Roundhouse** — orange fire arc and short kick shockwave. |
| Shadow Counter | 87 | Defensive counter fighter | Hard | **Phantom Reversal** — strong if timed during an enemy attack, weaker if mistimed. |
| Gravity Monk | 86 | Control fighter | Hard | **Heavy Field** — violet gravity ring that slows the opponent and raises stamina costs. |
| Frost Judoka | 84 | Defensive throw specialist | Medium | **Frozen Sweep** — ice burst defensive sweep that slows the opponent. |
| Neon Assassin | 88 | Fast combo fighter | Hard | **Afterimage Barrage** — cyan/pink duplicates join a fast multi-hit combo. |
| Crimson Oni | 87 | Aggressive power fighter | Medium | **Oni Breaker** — crimson guard-breaking burst with strong knockback and recovery risk. |
| Solar Champion | 86 | Technical striker | Medium | **Solar Flare Combo** — gold flash feint into a clean precise combo. |
| Vortex Ninja | 85 | Evasive movement fighter | Hard | **Cyclone Step** — teal wind spiral movement attack that slips past the opponent. |
| Dragon Guard | 86 | Tank/blocking fighter | Medium | **Dragon Shell** — green guard aura that improves defense and rewards blocking. |

## Fighting System

- Punches are quick, low-cost, and good for combo pressure.
- Kicks are slower, stronger, and animate the existing leg instead of creating extra limbs.
- Dashes cost stamina, have cooldown, and create dust/trail effects.
- Blocking reduces damage, costs stamina, shows guard sparks, and can be guard-broken under pressure.
- Specials require a full `100 / 100` meter and reset after use.
- Health, stamina, special, position, and timer values are clamped to prevent NaN or invalid UI bars.
- Effects are capped and cleaned up to keep performance smooth.

## Pause, Rematch, and Navigation

During a fight, use `P` or the **Pause** button to open the pause menu.

Pause and result screens support:

- **Resume** from pause.
- **Rematch** with the same fighters and match type.
- **Back to Character Select** to pick a new fighter.
- **Main Menu** to return to the title screen.

## How to Run

Open `index.html` in a browser, or serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

No npm install, build step, external library, React, Phaser, or bundler is required.

## Beginner Editing Guide

Open `game.js` and look near the top for:

- `FIGHTERS` to edit roster data, stats, colors, personalities, ratings, special names, and AI behavior.
- `STATS` to tune movement, dash, hop, blocking, arena bounds, and stamina settings.
- `ATTACKS` to tune punch, kick, combo, and baseline special timing/range.
- `ROUND_TIME_SECONDS` to change the Timed Match round length.

## Future Update Ideas

- Add sound effects and music toggles.
- Add best-of-three rounds.
- Add a training mode with hitboxes and input display.
- Add mobile touch controls.
- Add more arenas and entrance animations.
- Add more combo routes and tutorial missions.
