import { useEffect, useMemo, useState } from "react";
import {
  advanceDay,
  createInitialState,
  harvestPalm,
  loadGame,
  plantSeed,
  processFreshFruitBunches,
  saveGame,
  sellCpo,
  waterPlot,
} from "../core/palm-simulation.mjs";
import "../offline-prototype.css";

type Weather = "sunny" | "rainy" | "stormy";

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function OfflinePrototype() {
  const [game, setGame] = useState(() => loadGame());
  const [weather, setWeather] = useState<Weather>("rainy");
  const [notice, setNotice] = useState("Selamat datang di Tunaswangi. Coba rawat petak warisan Pak Karto.");
  const [savedAt, setSavedAt] = useState("Belum ada perubahan");

  useEffect(() => {
    try {
      saveGame(game);
      setSavedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setNotice("Penyimpanan lokal tidak tersedia di browser ini.");
    }
  }, [game]);

  const totals = useMemo(() => ({
    planted: game.plots.filter((plot: any) => plot.palm).length,
    mature: game.plots.filter((plot: any) => plot.palm && plot.palm.ageDays >= 30 && plot.palm.growth >= 95).length,
  }), [game]);

  const act = (operation: () => unknown, success: string) => {
    try {
      const next = operation();
      if (next && typeof next === "object") setGame(next as typeof game);
      setNotice(success);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Aksi belum bisa dilakukan.");
    }
  };

  const advance = () => act(() => advanceDay(game, weather), `Hari berganti. Cuaca: ${weather === "rainy" ? "hujan" : weather === "stormy" ? "badai ringan" : "cerah"}.`);
  const process = () => act(() => processFreshFruitBunches(game, game.inventory.tbsKg), "TBS berhasil diproses menjadi CPO dan kernel.");
  const sell = () => act(() => sellCpo(game, game.inventory.cpoKg), "CPO berhasil dikirim ke pembeli lokal.");

  return (
    <main className="offline-game">
      <div className="portrait-warning"><span>↻</span><strong>Putar perangkatmu ke posisi landscape</strong><small>Sawit Legend dirancang untuk layar tidur.</small></div>
      <div className="game-sky"><div className="game-sun" /><div className="game-hill hill-one" /><div className="game-hill hill-two" /></div>
      <div className="game-ground"><div className="game-road" /><div className="game-mill"><span>MINI MILL</span></div>
        {game.plots.map((plot: any, index: number) => (
          <div className={`game-palm palm-${index + 1} ${plot.palm ? "planted" : "empty"}`} key={plot.id}>
            <i className="palm-trunk" /><i className="palm-crown" /><i className="palm-frond f-a" /><i className="palm-frond f-b" /><i className="palm-frond f-c" /><i className="palm-frond f-d" /><i className="palm-frond f-e" />
            <span className="plot-label">{plot.label}</span>
          </div>
        ))}
        <div className="game-player"><i /><b /></div>
      </div>

      <header className="game-topbar">
        <div className="game-brand"><div className="game-emblem">🌴</div><div><b>SAWIT LEGEND</b><small>THE KING OF NUSANTARA</small></div></div>
        <div className="game-resources">
          <div><b>{money(game.money)}</b><small>UANG</small></div>
          <div><b>{game.inventory.seeds} ✦</b><small>BIBIT</small></div>
          <div><b>{game.inventory.tbsKg} kg</b><small>TBS</small></div>
          <div><b>{game.inventory.cpoKg} kg</b><small>CPO</small></div>
        </div>
      </header>

      <aside className="game-quest">
        <small>BAB 01 · AWAL SEBUAH TUNAS</small>
        <strong>Warisan Pak Karto</strong>
        <p>Bangun kembali kebun kecil ini. Rawat tanahnya, pelajari prosesnya, dan bantu kampung berkembang.</p>
        <div className="quest-stats"><span>{totals.planted}/3 petak ditanami</span><span>{totals.mature} siap panen</span></div>
      </aside>

      <section className="game-status">
        <span className="weather-icon">{weather === "rainy" ? "🌧" : weather === "stormy" ? "⛈" : "☀"}</span>
        <div><b>Hari ke-{game.day} · Tunaswangi</b><small>Cuaca memengaruhi kelembapan tanah</small></div>
      </section>

      <section className="game-action-panel">
        <div className="panel-heading"><div><small>KEBUN WARISAN</small><strong>Kelola perkebunan</strong></div><span className="save-pill">● OFFLINE SAVE</span></div>
        <div className="plot-list">
          {game.plots.map((plot: any) => (
            <article className="plot-card" key={plot.id}>
              <div className="plot-card-title"><b>{plot.label}</b><span>{plot.palm ? `Umur ${plot.palm.ageDays} hari` : "Lahan kosong"}</span></div>
              <div className="plot-meters"><span>Air <b>{Math.round(plot.moisture)}%</b></span><span>Nutrisi <b>{Math.round(plot.nutrients)}%</b></span><span>Tumbuh <b>{Math.round(plot.palm?.growth ?? 0)}%</b></span></div>
              <div className="meter-track"><i style={{ width: `${plot.palm?.growth ?? 0}%` }} /></div>
              <div className="plot-actions">
                {!plot.palm ? <button onClick={() => act(() => plantSeed(game, plot.id), `Bibit ditanam di ${plot.label}.`)} disabled={game.inventory.seeds < 1}>Tanam bibit</button> : <>
                  <button className="secondary" onClick={() => act(() => waterPlot(game, plot.id, 22), `Air ditambahkan ke ${plot.label}.`)}>Siram</button>
                  <button onClick={() => act(() => harvestPalm(game, plot.id), `Panen berhasil dari ${plot.label}.`)} disabled={plot.palm.ageDays < 30 || plot.palm.growth < 95}>Panen TBS</button>
                </>}
              </div>
            </article>
          ))}
        </div>
        <div className="day-controls">
          <label>Cuaca berikutnya<select value={weather} onChange={(event) => setWeather(event.target.value as Weather)}><option value="sunny">Cerah</option><option value="rainy">Hujan</option><option value="stormy">Badai ringan</option></select></label>
          <button className="advance-button" onClick={advance}>Lewati 1 hari →</button>
        </div>
      </section>

      <section className="mill-panel">
        <div className="mill-title"><span>🏭</span><div><small>INDUSTRI NUSANTARA</small><b>Mini Mill Tunaswangi</b></div></div>
        <p>Ubah hasil panen menjadi bahan bernilai tambah.</p>
        <div className="mill-stock"><span>TBS <b>{game.inventory.tbsKg} kg</b></span><span>CPO <b>{game.inventory.cpoKg} kg</b></span><span>Kernel <b>{game.inventory.kernelKg} kg</b></span></div>
        <div className="mill-actions"><button onClick={process} disabled={game.inventory.tbsKg < 1}>Proses TBS</button><button className="secondary" onClick={sell} disabled={game.inventory.cpoKg < 1}>Jual CPO</button></div>
      </section>

      <div className="game-notice" role="status">{notice}</div>
      <footer className="game-footer"><span>PROTOTIPE OFFLINE · TUNASWANGI DISTRICT</span><span>Autosave lokal · {savedAt}</span></footer>
    </main>
  );
}
