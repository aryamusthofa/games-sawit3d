# Implementation Plan: Sawit Legend Foundation

## Overview
Turn the existing React + Three.js prototype into an offline-first, Android-landscape adventure and palm-industry simulator while preserving the existing code and multiplayer experiments.

## Architecture decisions
- Keep the existing React/Three.js base for the first playable browser prototype; evaluate Godot/native packaging after the vertical slice is validated.
- Separate deterministic game rules into pure modules so they can be tested without rendering or a server.
- Local save is the source of truth for offline campaign progress.
- Multiplayer is isolated from campaign progression and remains optional.
- Repeated environment assets should be instanced or low-poly; quality settings must scale by device.
- Keep credentials and server-only secrets out of browser/mobile bundles.

## Task list

### Phase 1 — Foundation
- [x] Inspect existing repository and preserve current work.
- [x] Create isolated feature branch.
- [x] Write product GDD and acceptance plan.
- [x] Add offline simulation tests and core module.
- [ ] Add landscape-first HUD and controls to the playable scene.
- [ ] Add offline save/load integration to the app state.
- [ ] Add a small interactable plantation district.

### Checkpoint: Foundation
- [ ] Tests pass in CI.
- [ ] Build succeeds.
- [ ] Offline new-game → plant → grow → harvest → process → save/load flow works.

### Phase 2 — Core experience
- [ ] Add NPC dialogue, quest flags and a first story chapter.
- [ ] Add soil/nutrient/weather feedback and tutorial.
- [ ] Add mill stations and simplified processing chain.
- [ ] Add accessible settings and graphics presets.

### Phase 3 — World and polish
- [ ] Add more Tunaswangi landmarks, ambient audio and day/night.
- [ ] Add puzzle and relaxed fantasy encounter framework.
- [ ] Profile mobile performance and memory.
- [ ] Reduce asset weight and verify actual install size.

### Phase 4 — Optional multiplayer and release
- [ ] Audit existing Socket.IO experiment; isolate it from offline save/progression.
- [ ] Add optional co-op and relaxed PvP only after offline campaign quality is stable.
- [ ] Test Android packaging, orientation lock and touch UX on physical devices.
- [ ] Prepare release checklist and privacy/security review.

## Risks and mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Scope too large for solo developer | High | Ship one polished vertical slice at a time |
| 3D assets exceed size budget | High | Low-poly, instancing, compressed textures/audio, measured builds |
| Entry-level Android overheating/low FPS | High | Small active area, low shadows, capped effects, adaptive resolution |
| Offline and online state conflict | High | Local-first state; multiplayer is optional and separate |
| AI-generated assets inconsistent | Medium | Art direction sheet and reusable modular asset rules |
| Industrial simulation becomes inaccurate | Medium | Clearly label simplified game mechanics; validate educational content |

## Open questions
- Final native packaging path (Godot versus web/PWA wrapper) after prototype performance review.
- Android minimum OS and exact device performance target.
