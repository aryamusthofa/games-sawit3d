import React, { useState } from 'react';
import { BiomeInfo, BiomeType, InventoryState, MapWaypoint } from '../types';
import { X, MapPin, Check, Sparkles, Navigation, Map, Compass, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface BiomeTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  biomes: BiomeInfo[];
  activeBiomeId: BiomeType;
  onTravelToBiome: (id: BiomeType) => void;
  onUnlockBiome: (id: BiomeType) => void;
  inventory: InventoryState;
  onTeleportPlayer?: (x: number, z: number) => void;
}

export const BiomeTravelModal: React.FC<BiomeTravelModalProps> = ({
  isOpen,
  onClose,
  biomes,
  activeBiomeId,
  onTravelToBiome,
  onUnlockBiome,
  inventory,
  onTeleportPlayer
}) => {
  const [activeTab, setActiveTab] = useState<'biomes' | 'fast_travel'>('biomes');

  if (!isOpen) return null;

  const waypoints: MapWaypoint[] = [
    { id: 'pks', name: '🏢 Pabrik CPO Utama Mill', x: 0, z: -25, icon: '🏢', description: 'Pabrik pengolahan kelapa sawit & tempat jual TBS.', biomeId: 'gambut_riau' },
    { id: 'mandor', name: '🌴 Pos Mandor Kebun', x: -20, z: -10, icon: '⛺', description: 'Pos pengawasan karyawan & peralatan panen.', biomeId: 'gambut_riau' },
    { id: 'danau', name: '💧 Danau Gambut Irigasi', x: 20, z: -30, icon: '💧', description: 'Sumber air utama untuk menyiram kebun saat kemarau.', biomeId: 'gambut_riau' },
    { id: 'bukit', name: '⛰️ Bukit Panorama Sawit', x: 35, z: 35, icon: '⛰️', description: 'Dataran tinggi dengan pemandangan 360 derajat.', biomeId: 'sumatera_hills' },
    { id: 'traktor', name: '🚜 Garasi Traktor & Loader', x: -30, z: 25, icon: '🚜', description: 'Stasiun pemuatan dan servis traktor capit.', biomeId: 'sumatera_hills' },
    { id: 'boss', name: '🐍 Sarang King Oryctes', x: -40, z: -40, icon: '🐉', description: 'Lokasi kemunculan kumbang sawit raksasa.', biomeId: 'kalimantan_mega' },
    { id: 'sultan', name: '👑 Helipad Sultan Sawit', x: 45, z: -45, icon: '👑', description: 'Wilayah istana sultan dengan bonus panen 3x!', biomeId: 'pulau_legend' }
  ];

  const handleFastTravel = (wp: MapWaypoint) => {
    const parentBiome = biomes.find(b => b.id === wp.biomeId);
    if (!parentBiome || !parentBiome.unlocked) return;

    soundFx.playCoin();
    // Auto switch active biome if needed
    if (activeBiomeId !== wp.biomeId) {
      onTravelToBiome(wp.biomeId);
    }
    if (onTeleportPlayer) {
      onTeleportPlayer(wp.x, wp.z);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-3xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-emerald-300">Peta & Fast Travel World Map</h2>
              <p className="text-xs text-slate-400">Pindah Biome & Teleportasi Instant ala Genshin Impact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('biomes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-extrabold text-xs transition-all ${
              activeTab === 'biomes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>PETA BIOME & WILAYAH</span>
          </button>

          <button
            onClick={() => setActiveTab('fast_travel')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-extrabold text-xs transition-all ${
              activeTab === 'fast_travel'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-950" />
            <span>FAST TRAVEL WAYPOINTS</span>
          </button>
        </div>

        {/* Tab 1: Biome Cards */}
        {activeTab === 'biomes' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
            {biomes.map(biome => {
              const isActive = activeBiomeId === biome.id;
              const canAfford = inventory.money >= biome.unlockCost;

              return (
                <div
                  key={biome.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden h-full ${
                    isActive
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-lg ring-1 ring-emerald-400'
                      : biome.unlocked
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-900/80 border-slate-800 opacity-90'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2.5 bg-slate-900 rounded-2xl border border-slate-700 shadow-inner shrink-0">
                        {biome.bgEmoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{biome.name}</span>
                          {biome.id === 'pulau_legend' && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </h3>
                        <span className="inline-block text-2xs font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 truncate">
                          {biome.treeCount} Pohon Kebun
                        </span>
                      </div>
                    </div>

                    <p className="text-2xs text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60 font-medium leading-relaxed break-words">
                      {biome.description}
                    </p>

                    <div className="space-y-1 text-2xs">
                      {biome.soilType && (
                        <div className="flex items-center justify-between text-amber-300/90 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-amber-500/20 text-3xs sm:text-2xs">
                          <span>🌱 Jenis Tanah:</span>
                          <span className="font-bold truncate ml-1">{biome.soilType}</span>
                        </div>
                      )}
                      {biome.hazardRisk && (
                        <div className="flex items-center justify-between text-rose-300/90 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-rose-500/20 text-3xs sm:text-2xs">
                          <span>⚠️ Risiko Bahaya:</span>
                          <span className="font-bold truncate ml-1">{biome.hazardRisk}</span>
                        </div>
                      )}
                      {biome.specialFeature && (
                        <div className="flex items-center justify-between text-emerald-300/90 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-3xs sm:text-2xs">
                          <span>✨ Keunggulan:</span>
                          <span className="font-bold truncate ml-1">{biome.specialFeature}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 mt-auto">
                    {biome.unlocked ? (
                      isActive ? (
                        <span className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-inner">
                          <Check className="w-4 h-4" /> BIOME AKTIF
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            soundFx.playCoin();
                            onTravelToBiome(biome.id);
                          }}
                          className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>BEPERGIAN KE WILAYAH INI</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            soundFx.playCoin();
                            onUnlockBiome(biome.id);
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <span>BUKA BIOME (Rp {biome.unlockCost.toLocaleString('id-ID')})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Fast Travel Waypoints (Interactive Map) */}
        {activeTab === 'fast_travel' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <p className="text-2xs text-slate-300 font-medium leading-relaxed">
                Pilih Waypoint lokasi di bawah ini untuk <span className="text-amber-300 font-bold">Teleportasi Instant</span>. <br />
                <span className="text-rose-400 text-3xs font-semibold">* Wajib membeli Biome wilayah terlebih dahulu sebelum dapat menggunakan waypoint.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max">
              {waypoints.map(wp => {
                const parentBiome = biomes.find(b => b.id === wp.biomeId);
                const isBiomeUnlocked = parentBiome ? parentBiome.unlocked : false;

                return (
                  <div
                    key={wp.id}
                    className={`border p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                      isBiomeUnlocked
                        ? 'bg-slate-800/90 border-slate-700 hover:border-amber-400 group'
                        : 'bg-slate-900/90 border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-700 shrink-0">
                        {wp.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-white truncate">{wp.name}</h4>
                        <p className="text-3xs text-slate-300 mt-0.5 leading-snug break-words">{wp.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xs text-amber-400/90 font-mono">
                            ({wp.x}, {wp.z})
                          </span>
                          <span className={`text-3xs px-1.5 py-0.2 rounded font-semibold ${isBiomeUnlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'}`}>
                            {parentBiome?.name || 'Biome'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isBiomeUnlocked ? (
                      <button
                        onClick={() => handleFastTravel(wp)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-2xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all whitespace-nowrap shrink-0"
                      >
                        <Zap className="w-3 h-3" />
                        <span>TELEPORT</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('biomes')}
                        className="px-2.5 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 font-bold text-3xs rounded-xl flex items-center gap-1 hover:bg-slate-700 transition-all shrink-0"
                      >
                        <span>🔒 BELI BIOME</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
