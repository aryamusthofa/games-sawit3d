import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialState,
  plantSeed,
  waterPlot,
  advanceDay,
  harvestPalm,
  processFreshFruitBunches,
  sellCpo,
  saveGame,
  loadGame,
} from "../src/core/palm-simulation.mjs";

const plotId = "plot-01";

test("new save starts with a small playable plantation", () => {
  const state = createInitialState();
  assert.equal(state.day, 1);
  assert.equal(state.inventory.seeds, 2);
  assert.equal(state.inventory.tbsKg, 0);
  assert.equal(state.plots.length, 3);
});

test("planting consumes one seed and creates a healthy seedling", () => {
  const next = plantSeed(createInitialState(), plotId);
  assert.equal(next.inventory.seeds, 1);
  assert.equal(next.plots[0].palm.ageDays, 0);
  assert.equal(next.plots[0].palm.health, 100);
});

test("cannot plant twice in the same plot", () => {
  const planted = plantSeed(createInitialState(), plotId);
  assert.throws(() => plantSeed(planted, plotId), /sudah ditanami/i);
});

test("watering increases soil moisture but never above 100", () => {
  const planted = plantSeed(createInitialState(), plotId);
  const watered = waterPlot(planted, plotId, 100);
  assert.equal(watered.plots[0].moisture, 100);
});

test("rain and sunny weather advance the offline simulation deterministically", () => {
  const planted = plantSeed(createInitialState(), plotId);
  const sunny = advanceDay(planted, "sunny");
  const rainy = advanceDay(planted, "rainy");
  assert.equal(sunny.day, 2);
  assert.equal(sunny.plots[0].palm.ageDays, 1);
  assert.ok(rainy.plots[0].moisture > planted.plots[0].moisture);
});

test("immature palms cannot be harvested", () => {
  const planted = plantSeed(createInitialState(), plotId);
  assert.throws(() => harvestPalm(planted, plotId), /belum siap panen/i);
});

test("mature palm harvest adds fresh fruit bunches to inventory", () => {
  let state = plantSeed(createInitialState(), plotId);
  for (let day = 0; day < 30; day += 1) state = advanceDay(state, "rainy");
  const harvested = harvestPalm(state, plotId);
  assert.ok(harvested.inventory.tbsKg > 0);
  assert.equal(harvested.plots[0].palm.lastHarvestDay, harvested.day);
});

test("mill processing converts TBS into CPO and kernel while charging operations", () => {
  let state = plantSeed(createInitialState(), plotId);
  for (let day = 0; day < 30; day += 1) state = advanceDay(state, "rainy");
  state = harvestPalm(state, plotId);
  const availableTbs = state.inventory.tbsKg;
  const processed = processFreshFruitBunches(state, availableTbs);
  assert.equal(processed.inventory.tbsKg, 0);
  assert.ok(processed.inventory.cpoKg > 0);
  assert.ok(processed.inventory.kernelKg > 0);
  assert.ok(processed.money < state.money);
});

test("mill refuses to process more TBS than the player owns", () => {
  assert.throws(() => processFreshFruitBunches(createInitialState(), 10), /TBS tidak cukup/i);
});

test("selling CPO increases the player's balance", () => {
  let state = plantSeed(createInitialState(), plotId);
  for (let day = 0; day < 30; day += 1) state = advanceDay(state, "rainy");
  state = harvestPalm(state, plotId);
  state = processFreshFruitBunches(state, state.inventory.tbsKg);
  const sold = sellCpo(state, state.inventory.cpoKg, 12000);
  assert.equal(sold.inventory.cpoKg, 0);
  assert.ok(sold.money > state.money);
});

test("save and load preserve progress without requiring an account or internet", () => {
  const memory = new Map();
  const storage = {
    setItem: (key, value) => memory.set(key, value),
    getItem: (key) => memory.get(key) ?? null,
  };
  const state = plantSeed(createInitialState(), plotId);
  saveGame(state, storage);
  const restored = loadGame(storage);
  assert.deepEqual(restored, state);
  assert.notEqual(restored, state);
});
