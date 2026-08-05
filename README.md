# ⚔️ Marcos Adventure — Ultra Edition

> *"Every great hero needs a great villain — and here we have three."*

**[Versão em Português](README-pt-br.md)**

**Marcos Adventure** is a space shooter (shoot 'em up) in the **neon bullet-hell** style, built 100% with HTML5 Canvas, CSS and pure JavaScript — no frameworks, no dependencies.

The player controls **Marcos** and faces **3 epic bosses** (based on the professor's stickers) in increasingly brutal battles, with stages full of enemies, power-ups and visual effects.

> ⚠️ **Warning:** No professor was harmed during the development of this game. Emotionally, maybe.

---

## 🎮 Gameplay

- **3 stages + 3 unique bosses** — each with its own attack patterns
- **Progressive weapon system** — collect power-ups to evolve from level 1 to 4
- **OVERDRIVE (Fury)** — activate Marcos's fury to become temporarily invincible and fire a barrage
- **Varied enemies** — 4 types: basic, weaving, tank and zig-zag
- **Power-ups** — heal, weapon upgrade and fury
- **Visual effects** — particles, explosions, screen-shake, nebulas, parallax stars, CRT scanlines
- **Procedurally generated 8-bit sounds** (no audio files!)
- **Pause, sound on/off, slow aim mode (SHIFT)**
- **100% in the browser** — no installation, just open and play

---

## 🕹️ Controls

| Key | Action |
|---|---|
| `W A S D` / `← ↑ ↓ →` | Move |
| `SPACE` | Fire |
| `SHIFT` | Slow movement (aim) |
| `P` / `ESC` | Pause |
| `M` | Toggle sound |

---

## 🚀 Getting Started

You don't need to install anything. Literally.

```bash
# Clone the repository
git clone https://github.com/ChristopherDond/MarcosAdventure.git
cd MarcosAdventure

# Open index.html in your browser
# (or just drag the file into the browser — that works too)
```

> 💡 **Tip:** Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code for a better development experience.

---

## 📁 Project Structure

```
MarcosAdventure/
├── index.html            # Game entry point
├── css/
│   └── style.css         # Style, HUD, overlays, neon
├── js/
│   ├── config.js         # Central configuration (balancing)
│   ├── audio.js          # Procedural 8-bit sounds
│   ├── input.js          # Keyboard + touch
│   ├── particles.js      # Particles, explosions, rings
│   ├── bullets.js        # Projectiles
│   ├── background.js     # Stars, nebulas, parallax
│   ├── player.js         # Marcos: movement, shooting, fury
│   ├── enemies.js        # Stage enemies
│   ├── bosses.js         # The 3 bosses
│   ├── ui.js             # HUD, screens, camera
│   └── main.js           # Game loop, stages, collisions
└── assets/
    ├── marcos4.png       # Marcos sprite (background removed)
    ├── quecedisse.png    # Boss 1
    ├── quetristeza.png   # Boss 2
    ├── bossAbsoluto.png  # Boss 3
    └── marcos1.gif       # Victory GIF (kept!)
```

---

## 🧑‍🏫 The Bosses

| # | Boss | Difficulty | Attack pattern |
|---|---|---|---|
| 1 | Que Cê Disse? | ⭐ Easy | Bullet fans, aimed shot, ring |
| 2 | Que Tristeza | ⭐⭐ Medium | Rings, double shots, **orbiting ghosts** |
| 3 | Marcos Absoluto | ⭐⭐⭐ Hard | Barrages, **homing missiles**, double rings |

---

## 🛠️ Tech Stack

- **HTML5** — game structure
- **CSS3** — animations and visual style
- **JavaScript (Vanilla)** — game logic, collisions and boss behavior

No external libraries. Zero dependencies. Pure guerrilla front-end.

---

## 📱 Mobile Version

Want to play on your phone? There's a version optimized for mobile devices:

👉 **[Marcos Adventure — Mobile](https://github.com/ChristopherDond/MarcosAdventureMobal)**

---

## 🕹️ Play now

👉 **[Marcos Adventure](https://christopherdond.github.io/MarcosAdventure/)**

---

## 👤 Author

Built with affection (and a touch of student revenge) by **Christopher**.

---

## 📄 License

Free for educational, recreational and controlled tomfoolery use.

*Does the professor know this repository exists? Maybe. Probably. Good luck.*

---

*Made with ☕, pure HTML and lots of student revenge*