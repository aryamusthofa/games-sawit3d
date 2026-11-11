const clone = (value) => structuredClone(value);

export function createInitialState() {
  return {
    version: 1,
    day: 1,
    money: 125600,
    reputation: 12,
    inventory: { seeds: 2, tbsKg: 0, cpoKg: 0, kernelKg: 0 },
    plots: [
      { id: "plot-01", label: "Petak Warisan", moisture: 55, nutrients: 72, palm: null },
      { id: "plot-02", label: "Petak Timur", moisture: 48, nutrients: 65, palm: null },
      { id: "plot-03", label: "Petak Belakang", moisture: 61, nutrients: 80, palm: null },
    ],
    story: { chapter: 1, quest: "Periksa lahan peninggalan Pak Karto", completed: [] },
    stats: { totalTbsKg: 0, totalCpoKg: 0, daysPlayed: 0 },
  };
}

function getPlot(state, plotId) {
  const plot = state.plots.find((item) => item.id === plotId);
  if (!plot) throw new Error("Petak tidak ditemukan.");
  return plot;
}

export function plantSeed(state, plotId) {
  const next = clone(state);
  const plot = getPlot(next, plotId);
  if (plot.palm) throw new Error("Petak ini sudah ditanami.");
  if (next.inventory.seeds < 1) throw new Error("Bibit tidak cukup.");
  next.inventory.seeds -= 1;
  plot.palm = { ageDays: 0, health: 100, growth: 0, lastHarvestDay: null };
  return next;
}

export function waterPlot(state, plotId, amount = 18) {
  const next = clone(state);
  const plot = getPlot(next, plotId);
  const safeAmount = Math.max(0, Math.min(100, Number(amount) || 0));
  plot.moisture = Math.min(100, plot.moisture + safeAmount);
  return next;
}

export function advanceDay(state, weather = "sunny") {
  const next = clone(state);
  next.day += 1;
  next.stats.daysPlayed += 1;
  for (const plot of next.plots) {
    const rain = weather === "rainy" ? 24 : weather === "stormy" ? 32 : 0;
    plot.moisture = Math.max(0, Math.min(100, plot.moisture + rain - (weather === "sunny" ? 12 : 5)));
    if (!plot.palm) continue;
    plot.palm.ageDays += 1;
    const moistureFactor = plot.moisture < 25 ? 0.35 : plot.moisture < 45 ? 0.7 : 1;
    const nutrientFactor = plot.nutrients < 25 ? 0.5 : plot.nutrients < 45 ? 0.8 : 1;
    plot.palm.growth = Math.min(100, plot.palm.growth + moistureFactor * nutrientFactor * 3.5);
    if (plot.moisture < 15) plot.palm.health = Math.max(0, plot.palm.health - 4);
    else if (plot.nutrients < 15) plot.palm.health = Math.max(0, plot.palm.health - 2);
    else plot.palm.health = Math.min(100, plot.palm.health + 1);
  }
  return next;
}

export function harvestPalm(state, plotId) {
  const next = clone(state);
  const plot = getPlot(next, plotId);
  if (!plot.palm || plot.palm.ageDays < 30 || plot.palm.growth < 95) {
    throw new Error("Sawit belum siap panen.");
  }
  if (plot.palm.health < 25) throw new Error("Kondisi sawit belum cukup sehat untuk dipanen.");
  const quality = Math.max(0.5, Math.min(1, plot.palm.health / 100));
  const yieldKg = Math.round((18 + plot.nutrients * 0.18) * quality);
  next.inventory.tbsKg += yieldKg;
  next.stats.totalTbsKg += yieldKg;
  plot.palm.growth = 58;
  plot.palm.lastHarvestDay = next.day;
  plot.nutrients = Math.max(0, plot.nutrients - 8);
  return next;
}

export function processFreshFruitBunches(state, amountKg) {
  const next = clone(state);
  const amount = Math.floor(Number(amountKg));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Jumlah TBS tidak valid.");
  if (amount > next.inventory.tbsKg) throw new Error("TBS tidak cukup.");
  const operationCost = Math.ceil(amount * 85);
  if (next.money < operationCost) throw new Error("Saldo tidak cukup untuk biaya pengolahan.");
  next.money -= operationCost;
  next.inventory.tbsKg -= amount;
  const cpo = Math.floor(amount * 0.22);
  const kernel = Math.floor(amount * 0.05);
  next.inventory.cpoKg += cpo;
  next.inventory.kernelKg += kernel;
  next.stats.totalCpoKg += cpo;
  return next;
}

export function sellCpo(state, amountKg, pricePerKg = 12000) {
  const next = clone(state);
  const amount = Math.floor(Number(amountKg));
  const price = Math.max(0, Math.floor(Number(pricePerKg)));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Jumlah CPO tidak valid.");
  if (amount > next.inventory.cpoKg) throw new Error("Stok CPO tidak cukup.");
  next.inventory.cpoKg -= amount;
  next.money += amount * price;
  next.reputation += Math.min(5, Math.floor(amount / 100) + 1);
  return next;
}

export function saveGame(state, storage = globalThis.localStorage) {
  if (!storage || typeof storage.setItem !== "function") throw new Error("Penyimpanan lokal tidak tersedia.");
  storage.setItem("sawit-legend-save-v1", JSON.stringify(state));
}

export function loadGame(storage = globalThis.localStorage) {
  if (!storage || typeof storage.getItem !== "function") return createInitialState();
  const raw = storage.getItem("sawit-legend-save-v1");
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.plots) || !parsed.inventory) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}
