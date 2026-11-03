# Flappy Bird 2 — Next-Gen Arcade Game

A feature-rich recreation and expansion of Flappy Bird titled **Flappy Bird 2**, featuring the exact user-provided visual assets, identical home screen UI layout, multi-theme progressive levels with new dynamic obstacles, audio synthesis for bird chirps and arcade music, and a high-score leaderboard system.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were dismissed without selections; the recommended arcade defaults have been locked in to deliver the best gameplay experience:
> 
> - **Level Progression**: Progressive stage mechanics across 3 vibrant biomes (Day Sky, Sunset Skyline, and Night Glow) with milestone transitions every 10 points.
> - **New Obstacles**: Sliding vertical pipes, floating wind hazard barriers, and collectible golden feather/coin rings for bonus multiplier score.
> - **Audio System**: Procedural Web Audio API engine providing ambient forest bird chirping, dynamic wing flapping flutter sounds, point rings chimes, and an optional playful melody toggle without external audio dependency issues.
> - **Visual Assets**: Direct integration of user-supplied assets:
>   - Player Bird: `/public/assets/aistudio/Screenshot_2026-11-01_135323_99dfb07e.png`
>   - Roadside Tree: `/public/assets/aistudio/Screenshot_2026-11-01_140039_dee9a895.png`
>   - Background City House: `/public/assets/aistudio/Screenshot_2026-11-01_140532_fee7ffbc.png`
>   - Title/Menu Layout: Exact match of `/public/assets/aistudio/Screenshot_2026-11-01_171443_4e8d6bbb.png`

---

### 1. Overview & Core Concept

- **What It Does**: A browser-based arcade game where players tap or press Space to guide a bird through pipe obstacles, collect coins, conquer moving environmental hazards, and progress through themed levels with real-time scoring.
- **Target Audience**: Casual arcade gamers and fans of Flappy Bird seeking fresh obstacles, responsive physics, and competitive high-score tracking.
- **Key Value**: Delivers the visual charm of the original reference image combined with modernized obstacle mechanics, responsive mobile/desktop controls, and zero-asset latency via canvas rendering.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme Matching
- **Home Menu (Matched to Screenshot)**:
  - Lush cartoon landscape with blue sky, fluffy white clouds, waterfall, radiant sun rays, and blooming flower foreground.
  - Wooden banner title with 3D bold lettering "Flappy Bird 2" flanked by white angel wings and green leaf accents.
  - Floating character bird hovering with gentle idle bobbing animation.
  - Large glossy emerald-green **PLAY** button with white play arrow, bevel highlight, and tactile press animation.
  - Bottom row with 3 rounded square icon buttons matching the reference:
    - **LEADERBOARD** (Gold/Orange gradient, trophy icon, bold label)
    - **SETTINGS** (Cyan/Blue gradient, gear icon, bold label)
    - **SHARE** (Magenta/Purple gradient, share icon, bold label)

#### Key User Flows
1. **Title Screen**: User lands on the menu; ambient bird song gently activates upon first interaction; user can open Leaderboard, Settings, or press Play.
2. **Gameplay Transition**: Pressing Play triggers a 3-2-1 countdown overlay with "Tap / Space to Flap" prompt.
3. **In-Game Flow**:
   - Canvas renders 60fps parallax background: far clouds, apartment buildings (`Screenshot_...140532`), roadside trees (`Screenshot_...140039`), and moving ground turf.
   - Smooth bird rotation: tilts up on flap (+25°), gracefully dives down as velocity builds (-70°).
   - Real-time HUD: Large arcade score numbers centered at the top, current Level/Stage banner, and active score multiplier.
4. **Game Over Modal**:
   - High-score badge, medals (Bronze $\ge 10$, Silver $\ge 25$, Gold $\ge 50$, Platinum $\ge 100$).
   - Quick "Play Again" button and "Home" button.

#### Level & Obstacle Variety
- **Level 1 (Dawn Meadow)**: Standard classic green pipes + roadside trees in parallax; steady speed; introduces golden coin rings.
- **Level 2 (Sunset Canopy)**: Pipes slide vertically up and down in harmonic oscillation; orange sky; apartment buildings in background.
- **Level 3 (Twilight Storm & Hazard)**: Floating wind gusts that push the bird up or down, narrower pipe gaps, sparkling stars.

---

### 3. Key Product Decisions & Trade-Offs

- **Rendering Engine**: HTML5 Canvas with `requestAnimationFrame` instead of pure DOM elements.
  - *Why*: Guarantees rock-solid 60 FPS across both desktop and mobile, pixel-perfect collision detection (AABB + circle hitboxes), and smooth particle effects (feathers on flap, coin sparkles).
- **Sound Architecture**: Native Web Audio API procedural synthesis.
  - *Why*: Eliminates broken audio CDNs, requires zero external asset downloads, and allows exact pitch/envelope shaping for wing flaps, coin pings, hit thuds, and charming rhythmic bird chirps.
- **State & Leaderboard Persistence**: Client-side `localStorage` with initial default high scores and top-10 record storage.
  - *Why*: Instant loading, zero server friction, persists best scores and settings (sound/music toggles) across page reloads.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      App Container                     │
│  (Window Resize Observer, Keyboard/Touch Event Bus)    │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
┌───────────▼───────────┐        ┌───────────▼───────────┐
│       UI Views        │        │      Canvas Game      │
│ ┌───────────────────┐ │        │ ┌───────────────────┐ │
│ │  Home Menu View   │ │        │ │ Game Loop (60fps) │ │
│ │  (Exact Layout)   │ │        │ ├───────────────────┤ │
│ ├───────────────────┤ │        │ │ Parallax Backdrop │ │
│ │ Leaderboard Modal │ │        │ │ (House & Trees)   │ │
│ ├───────────────────┤ │        │ ├───────────────────┤ │
│ │  Settings Modal   │ │        │ │ Obstacle Manager  │ │
│ ├───────────────────┤ │        │ │ (Pipes, Coins)    │ │
│ │  Game Over Modal  │ │        │ ├───────────────────┤ │
│ └───────────────────┘ │        │ │ Bird Physics & FX │ │
│                       │        │ └───────────────────┘ │
└───────────┬───────────┘        └───────────┬───────────┘
            │                                │
┌───────────▼────────────────────────────────▼───────────┐
│               Audio & Storage Managers                 │
│  - Web Audio API Bird Chirps & Music Synth             │
│  - LocalStorage Scores & Settings Storage              │
└────────────────────────────────────────────────────────┘
```

#### Core Components & Modules
- `src/types/game.ts`: Game state machine (`MENU`, `COUNTDOWN`, `PLAYING`, `PAUSED`, `GAMEOVER`), Level definitions, obstacle structs, and high-score records.
- `src/utils/audio.ts`: Web Audio API procedural audio engine generating ambient chirping, flap whooshes, point pings, crash thuds, and background arcade rhythm.
- `src/utils/storage.ts`: High-score retrieval, leaderboard sorting, sound volume preferences.
- `src/components/GameCanvas.tsx`: Canvas rendering pipeline with layered parallax backgrounds (buildings, trees, ground), bird rotation physics, obstacle generation, particle emitters, and touch/tap/keyboard handlers.
- `src/components/HomeMenu.tsx`: Exact replica of the reference home screen with shiny 3D Play button, wood title with wings, and Leaderboard/Settings/Share buttons.
- `src/components/Modals.tsx`: Leaderboard popup, Settings drawer, and Game Over summary.
