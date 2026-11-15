# 🛰️ Abandoned but not Forgotten: NASA's Discarded Equipment Across the Solar System

> **"We leave as we came and, God willing, as we shall return, with peace and hope for all mankind."**  
> — *Gene Cernan (Apollo 17 Commander, the last human to walk on the Moon)*

An interactive 3D solar system cartography, extraterrestrial archaeological archive, and educational WebXR storytelling platform dedicated to **25 historic human spaceflight and robotic relics** left across the **Moon, Mars, Venus, Titan, Comet 67P, Asteroid 433 Eros, and Jupiter**.

🔗 **Live Web Application (GitHub Pages):** [https://batuhanklcky.github.io/abandoned-in-space/](https://batuhanklcky.github.io/abandoned-in-space/)

---

## 🌟 Key Platform Features & Architecture

### 1. 🪐 4 Celestial Stages & Outer Solar System (25 Historic Relics)
- **The Moon (10 Missions):** Surveyor 3, Apollo 11 (Eagle Descent Stage & Tranquility Base), Apollo 12, Apollo 13 S-IVB, Apollo 14, Apollo 15 (Lunar Roving Vehicle), Apollo 16, Apollo 17, Lunar Prospector, and LCROSS Centaur.
- **Mars (8 Missions):** Viking 1, Mars Pathfinder & Sojourner, Spirit, Opportunity, Phoenix, Curiosity Sky Crane, InSight, and Perseverance & Ingenuity.
- **Venus (3 Missions):** Soviet **Venera 7** (first telemetry transmission from another planetary surface), **NASA Pioneer Venus Day Probe** (titanium pressure vessel that unexpectedly survived 67.5 minutes on the 467°C surface), and **Venera 13** (first color panoramas and acoustic recordings at 92 atm).
- **Titan & Outer Solar System (4 Missions):** **ESA/NASA Cassini-Huygens** (cryogenic landing on Saturn's moon Titan), **Rosetta & Philae** (landing on Comet 67P/Churyumov–Gerasimenko), **NEAR Shoemaker** (improvised touchdown on Asteroid 433 Eros), and the **Galileo Atmospheric Probe** (descent into Jupiter's 22-bar atmosphere).

---

### 2. ⏳ Cosmic Weathering & Time-Lapse Degradation Simulator (NASA LROC / PBR Model)
- **Interactive Epoch Slider (0 to 100 Years):** Seamlessly integrated into the holographic artifact inspector with 4 key historical time milestones:
  - `✨ Touchdown Day (Day 0)`: Factory-fresh aerospace finishes, unblemished golden Kapton multilayer insulation (MLI) with peak reflectivity, pristine white thermal radiator paint, and 100% solar panel optical clarity.
  - `⏳ +25 Years`: Early solar UV photodegradation, slight material embrittlement, and initial dust settling.
  - `🔬 Present Day (55+ Years — NASA LROC Verified)`: NASA Lunar Reconnaissance Orbiter (LROC) confirmed space weathering: photochemical bleaching of Kapton foil to a silvery-white substrate, electrostatic lunar regolith dust adhesion, thermal cycling fatigue (+120°C to -170°C over 600+ lunar cycles), and Martian ferric oxide (rust) dust accumulation suffocating solar arrays.
  - `🌌 Future Century (+100 Years)`: Long-term extraterrestrial archaeological equilibrium and permanent deep-space preservation.
- **Dynamic Planetary Weathering Physics:** Real-time PBR material recalculation altering metalness, roughness, and color tints specific to the active celestial body (lunar regolith ash gray, Martian ferric rust amber, Venusian supercritical thermal scorching, and Titan organic tholin fog).

---

### 3. 🥽 1:1 Scale Astronaut Surface Walk & Walk-In Spacecraft Cabin (WebXR VR/AR)
- **Immersive 1.75m Astronaut Eye-Level Walk:** Compatible with **Meta Quest 3 / 3S / Pro**, **Apple Vision Pro** (`navigator.xr` WebXR Device API), and desktop/mobile browsers (WASD keyboard / mouse look / touch joystick).
- **Smooth Continuous Deck Climbing & Tangent Collision:** Astronauts can freely jump (low-gravity leap) onto spacecraft decks, lander stages, and rover chassis (`y = 1.45m` to `3.25m`), walk across solar panels and upper decks without freezing, and smoothly step back down onto planetary regolith with full sliding collision.
- **Detailed Walk-In Cabin Interiors (Apollo Crewed Missions):**
  - Walk up the 12-rung exterior EVA ladder (`+4.5m`) into the pressurized cabin.
  - Interactive dual-door airlock system with rotating pressure valve wheels and status indicator lamps.
  - Authentic Apollo Guidance Computer (DSKY) featuring 19 3D sculpted push-button keycaps, 3D toggle switches with safety guards, knurled thumbwheel dials, Attitude Controller Assembly (ACA) 3-axis joystick, thrust throttle, Master Alarm button, and 120 circuit breakers.

---

### 4. 📡 Live Mars Weather & Rover Telemetry (NASA MEDA / REMS)
- Real-time astronomical Sol (Martian day) calculation derived from landing epochs for **Perseverance (Jezero Crater — MEDA)** and **Curiosity (Gale Crater — REMS)**.
- Displays live diurnal temperature ranges, ambient atmospheric pressure (`Pa`), wind speed/direction, and cumulative odometer distance.

---

## 📚 Scientific Data Sources & Academic References

All geographic coordinates, mission dates, and discarded equipment manifests have been cross-referenced with official public NASA and ESA archives:

### 1. Official Catalogues & Monographs
- **NASA Catalogue of Manmade Material on the Moon (2012, NASA HQ / History Program Office):** Inventory data of ~190 metric tons of human-made equipment across 70+ lunar landing and impact sites (`js/data.js` `ARTIFACTS` database).
- **NASA History Series Academic Monographs:**
  - *NASA SP-2024-4559 (Governing the Moon: A History — Stephen S. Buono):* Historical analysis of lunar heritage and Section 9 of the Artemis Accords regarding extraterrestrial cultural heritage preservation.
  - *NASA SP-2026-4239 (NASA's Discovery Program — David W. Brown):* Telemetry and mission data for Mars Pathfinder/Sojourner, Lunar Prospector, and NEAR Shoemaker.
  - *NASA SP-2022-4235 (A History of Near-Earth Objects Research):* Asteroid 433 Eros mission history and Dr. Eugene Shoemaker's lunar burial memorial.
  - *NASA SP-2021-4705 (50 Years of Solar System Exploration — Linda Billings, ed.):* Technical documentation for Viking 1, Pioneer Venus Day Probe, Galileo, and Cassini-Huygens.
- **NASA Planetary Data System (PDS) & Imagery Archives (`images.nasa.gov`):** Authentic orbital and surface photography from LROC, MRO HiRISE, Magellan, and Cassini-Huygens with official PIA/AS catalog identifiers.
- **NASA Open Data Portal (`data.nasa.gov`):** Sol calculation based on the true astronomical Martian day (`1 Sol = 88,775.244 seconds`).

### 2. Software Architecture & Compliance
- **Rendering Engine:** `Three.js (r128)` with `THREE.OrbitControls` and WebGL ACESFilmic tone mapping.
- **Textures:** Public Domain NASA LRO CGI Moon Kit and Viking/MGS Mars global mosaics. All spacecraft materials (Kapton MLI foil, solar cells, CNC isogrid cabin paneling, DSKY keys, and compressed astronaut bootprints) are mathematically generated via HTML5 `Canvas2D` procedural textures.
- **Audio Synthesizer:** Pure Web Audio API procedural synthesis generating authentic 2,525 Hz Apollo Quindar telemetry tones, EVA radio background transmission noise, and low-gravity bootstep soundscapes.
- **Compliance:** Zero official NASA insignia ("Meatball" or "Worm" logos) are utilized. All generated 3D renders carry clear procedural attribution.

---

## 🚀 Running the Project Locally

To run the project locally, start a local HTTP server in the repository directory:

```bash
# Using Python 3 built-in server:
python -m http.server 8000

# Or with Node.js (http-server / npx serve):
npx serve .
```

Open `http://localhost:8000` in your web browser. For WebXR VR/AR, access the URL via the Meta Quest Browser or Apple Vision Pro Safari.

---

## 📄 License
This project is released under the **MIT License**. Spacecraft telemetry, planetary surface cartography, and historical mission metadata are compiled from public NASA and ESA open-access educational archives.
