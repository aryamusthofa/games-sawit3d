# Sawit Legend: The King of Nusantara
## Game Design Document — v0.1

### High concept
A stylized 3D open-world adventure set in a fictional modern Nusantara region where the player restores a family plantation, learns the palm-oil value chain, helps a living community, and uncovers a story about trust, ambition and stewardship.

### Player promise
“Explore at your own pace, build something meaningful, solve problems, and feel part of a lively Nusantara world.”

### Target platform and constraints
- Primary: Android, landscape only for gameplay.
- Secondary: desktop browser/build where practical.
- Offline-first: campaign, simulation, NPC schedules, puzzles and local saves are playable without internet.
- Online features are optional additions; never block offline progress.
- Visual style: stylized low-poly 3D with strong lighting, colour, sound and environmental storytelling.
- Performance: scalable quality presets, small active scene radius, instanced repeated foliage, simple collision, limited real-time shadows.
- Install budget: target below 250 MB; absolute stretch ceiling about 300 MB. Measure actual release artifacts; do not claim compliance before builds are measured.

### Genre mix
Adventure + action RPG + management simulator + light strategy + environmental puzzles. Combat is optional and designed as low-pressure fantasy encounters; the main progression is exploration, problem-solving and stewardship rather than ranked competition.

### World
**Tunaswangi** is the first compact district:
1. Warisan Estate — family plantation and first tutorial.
2. Kampung Tunaswangi — NPCs, shops, community stories and humour.
3. Mini Mill — TBS weighing, sterilising, threshing and pressing explained through interactive stations.
4. River and laterite road — traversal, weather and logistics.
5. Research outpost — soil, seedlings, pests and sustainable practices.
Later regions can introduce a port, refinery, city, highland, coast and other Indonesian-inspired biomes.

### Core gameplay loop
Explore → talk/observe → accept a problem → plan resources → plant/care/harvest/process → deliver or sell → improve the district → unlock story and new places.

### Palm value-chain simulation
Seed selection → land preparation → planting → water/nutrient care → maturity → harvest TBS → mill processing → CPO + kernel → refinery products → distribution → export.
The prototype uses transparent simplified ratios, not an authoritative industrial engineering simulator. Later balancing must be reviewed against reliable educational sources.

### Systems
- Plantation plots: moisture, nutrients, palm age, growth and health.
- Inventory: seeds, TBS, CPO, kernel and tools/materials.
- Economy: local prices, mill operating costs, delivery contracts and market events.
- Progression: player level, reputation, skills, story chapters and equipment.
- NPCs: daily routines, relationships, dialogue flags and local requests.
- Puzzles: route planning, resource allocation, quality sorting, cause-and-effect and pattern recognition.
- World life: day/night, weather, ambient wildlife, workers, vehicles and district events.
- Save: versioned local save, autosave checkpoints and safe fallback for invalid save data.

### Tone and narrative
Warm, modern, playful and emotionally grounded. Jokes and satire should come from character personality and context. Drama should emerge from understandable motives and consequences, not shock for its own sake. Government figures are fictional composites with fictional names and identities.

### Multiplayer philosophy
Offline solo is complete and primary. Later options: local pass-and-play challenges, LAN co-op, online co-op and relaxed PvP modes (solo/duo/trio/party). No pay-to-win, no forced ranked grind, and no online-only core progression.

### First vertical slice (MVP)
- One compact plantation scene.
- Third-person movement and camera.
- Touch controls for landscape Android.
- Three interactive plots.
- Plant, water, advance day, grow and harvest.
- Small mill interaction: convert TBS to CPO and kernel.
- Local save/load.
- One NPC, one introductory quest and one logic task.
- Settings: sound, sensitivity, graphics preset and left/right hand preference.

### Not in MVP
- Full open world, online matchmaking, clans, tournament system, large vehicle roster, cinematic voice acting, complex ragdoll, realistic industrial physics or high-detail photogrammetry.
These are deferred to protect solo-developer scope, performance and download size.

### Accessibility and comfort
- Clear tutorial, reversible choices where possible, no punishment for taking breaks.
- Adjustable camera sensitivity and UI scale.
- Large touch targets and optional left-handed layout.
- Reduce motion and screen shake settings.
- Landscape gameplay; menus and external sharing can adapt separately.

### Definition of a successful MVP
A new player can launch offline, move around Tunaswangi, interact with a plot, plant and care for a palm, progress time, harvest when mature, process TBS, save, close the app and restore progress — with readable feedback and stable performance.
