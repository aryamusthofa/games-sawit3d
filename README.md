# Sawit Legend: The King of Nusantara

**A mobile-first, offline-first 3D adventure and palm-industry life simulator.**

This repository is the development home for Sawit Legend. The current milestone is a small, playable vertical slice in the fictional Tunaswangi district.

## Product pillars
- Adventure first: explore a compact, handcrafted Nusantara-inspired district.
- Offline-first: story, farming, processing, progression and local save work without an account or internet.
- Thinking with heart: readable systems, meaningful choices, gentle humour, character drama and logic challenges.
- Palm economy: seedling → care → fresh fruit bunches (TBS) → mill → crude palm oil (CPO) and kernel → distribution/export.
- Optional play together: co-op and relaxed PvP are later additions, never required for the main campaign.
- Mobile first: landscape orientation, touch-friendly controls and scalable graphics.

## Current prototype
- Existing base: React + TypeScript + Three.js + Vite + Socket.IO.
- Offline palm simulation core: `src/core/palm-simulation.mjs`.
- Automated core tests: `tests/palm-simulation.test.mjs`.
- Visual direction: stylized low-poly 3D, warm earth, layered palm greens and modern Indonesian rural-industrial details.

## Run checks
- `npm install` — install dependencies.
- `npm test` — deterministic offline simulation tests.
- `npm run lint` — TypeScript check.
- `npm run build` — production build.

## Try the offline prototype
Run `npm run dev`, then open `/` for the existing 3D game or `/?mode=offline` for the new offline plantation loop. The offline prototype is designed for landscape screens and stores progress in browser local storage.

## Scope guard
The target install size is under 250 MB (hard stretch ceiling around 300 MB). This is a budget, not a promise until a release build is measured. The first prototype is a web-playable development build; Android packaging and device profiling are separate release gates.

## Project status
See `docs/GAME_DESIGN.md`, `tasks/plan.md` and `tasks/todo.md`.
