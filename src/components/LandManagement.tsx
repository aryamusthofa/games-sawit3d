import React from 'react';
import { LandPlot, InventoryState } from '../types';
import { X, Sprout, Droplets, Sparkles, TrendingUp, DollarSign, Factory } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LandManagementProps {
  isOpen: boolean;
  onClose: () => void;
  plots: LandPlot[];
  inventory: InventoryState;
  setInventory: React.Dispatch<React.SetStateAction<InventoryState>>;
  setPlots: React.Dispatch<React.SetStateAction<LandPlot[]>>;
}

export const LandManagement: React.FC<LandManagementProps> = ({
  isOpen,
  onClose,
  plots,
  inventory,
  setInventory,
  setPlots
}) => {
  if (!isOpen) return null;

  // Process TBS into CPO at Factory
  const handleProcessPKS = () => {
    if (inventory.tbsTons < 1) return;

    const processedTbs = inventory.tbsTons;
    const gainedCPO = processedTbs * 0.22; // 22% CPO extraction rate
    const gainedKernel = processedTbs * 0.05; // 5% Kernel yield

    setInventory(prev => ({
      ...prev,
      tbsTons: 0,
      cpoTons: prev.cpoTons + gainedCPO,
      kernelTons: prev.kernelTons + gainedKernel
    }));

    soundFx.playCoin();
  };

  // Sell CPO for money
  const handleSellCPO = () => {
    if (inventory.cpoTons <= 0) return;

    const cpoPricePerTon = 14500000; // Rp 14.500.000 / Ton CPO
    const totalEarnings = Math.round(inventory.cpoTons * cpoPricePerTon);

    setInventory(prev => ({
      ...prev,
      cpoTons: 0,
      money: prev.money + totalEarnings
    }));

    soundFx.playCoin();
  };

  // Fertilize plot
  const handleFertilizePlot = (plotId: number) => {
    if (inventory.money < 500000) return;

    setInventory(prev => ({ ...prev, money: prev.money - 500000 }));
    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return { ...p, fertilizerLevel: Math.min(100, p.fertilizerLevel + 35) };
      }
      return p;
    }));

    soundFx.playCoin();
  };

  // Unlock new plot
  const handleUnlockPlot = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || inventory.money < plot.unlockCost) return;

    setInventory(prev => ({ ...prev, money: prev.money - plot.unlockCost }));
    setPlots(prev => prev.map(p => p.id === plotId ? { ...p, unlocked: true } : p));
    soundFx.playCoin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-4xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900/60 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-emerald-300">Simulasi Manajemen Perkebunan Sawit</h2>
              <p className="text-xs text-slate-400">Kelola lahan, nutrisi tanah & olah hasil panen di Pabrik CPO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Top Factory & Revenue Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Refinery Processing (PKS) */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Factory className="w-5 h-5" />
                  <span>Pabrik Kelapa Sawit (PKS)</span>
                </div>
                <span className="text-xs text-slate-400">Rendemen: 22% CPO</span>
              </div>

              <div className="space-y-2 mb-4 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Stok TBS (Tandan Buah Segar):</span>
                  <span className="font-bold text-amber-300">{inventory.tbsTons.toFixed(2)} Ton</span>
                </div>
                <div className="flex justify-between">
                  <span>Stok CPO (Crude Palm Oil):</span>
                  <span className="font-bold text-emerald-300">{inventory.cpoTons.toFixed(2)} Ton</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleProcessPKS}
                  disabled={inventory.tbsTons < 0.1}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md"
                >
                  Olah TBS Ke CPO
                </button>
                <button
                  onClick={handleSellCPO}
                  disabled={inventory.cpoTons <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md"
                >
                  Jual CPO Pasar
                </button>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <TrendingUp className="w-5 h-5" />
                  <span>Neraca Perkebunan</span>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Pasar Stabil
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl">
                  <span className="text-slate-400">Kas Tunai:</span>
                  <span className="font-bold text-amber-400 text-sm">
                    Rp {inventory.money.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Harga CPO Dunia:</span>
                  <span className="font-semibold text-emerald-400">Rp 14.500.000 / Ton</span>
                </div>
              </div>

              <div className="text-2xs text-slate-400 bg-slate-900/40 p-2 rounded-xl border border-slate-700/50">
                💡 Tip: Lakukan pemupukan berkala untuk menjaga nutrisi tanah di atas 70% agar hasil panen melimpah!
              </div>
            </div>
          </div>

          {/* Plantation Plots Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Daftar Blok Lahan Perkebunan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plots.map(plot => (
                <div
                  key={plot.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    plot.unlocked
                      ? 'bg-slate-800/90 border-emerald-500/30'
                      : 'bg-slate-900/40 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{plot.name}</h4>
                      <p className="text-2xs text-emerald-400 font-medium">{plot.seedType} • {plot.palmCount} Pohon</p>
                    </div>
                    {plot.unlocked ? (
                      <span className="text-2xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Aktif Panen
                      </span>
                    ) : (
                      <span className="text-2xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        Terkunci
                      </span>
                    )}
                  </div>

                  {plot.unlocked ? (
                    <div className="space-y-3 mt-3">
                      <div>
                        <div className="flex justify-between text-2xs mb-1 text-slate-300">
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-sky-400" />
                            Nutrisi & Pupuk:
                          </span>
                          <span className="font-bold text-emerald-400">{plot.fertilizerLevel}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${plot.fertilizerLevel}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleFertilizePlot(plot.id)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs py-2 rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        Pupuk NPK (Rp 500.000)
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-2xs text-slate-400 mb-2">Buka blok lahan baru untuk ekspansi hasil panen sawit!</p>
                      <button
                        onClick={() => handleUnlockPlot(plot.id)}
                        disabled={inventory.money < plot.unlockCost}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-xl transition-all"
                      >
                        Buka Lahan (Rp {plot.unlockCost.toLocaleString('id-ID')})
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
