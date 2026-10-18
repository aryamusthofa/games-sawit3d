import React from 'react';
import { UpgradesState, InventoryState } from '../types';
import { X, Wrench, Scissors, Truck, Zap, Check, Users, Sparkles, ArrowUpRight, Crown } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface EquipmentUpgradesProps {
  isOpen: boolean;
  onClose: () => void;
  upgrades: UpgradesState;
  setUpgrades: React.Dispatch<React.SetStateAction<UpgradesState>>;
  inventory: InventoryState;
  setInventory: React.Dispatch<React.SetStateAction<InventoryState>>;
}

export const EquipmentUpgrades: React.FC<EquipmentUpgradesProps> = ({
  isOpen,
  onClose,
  upgrades,
  setUpgrades,
  inventory,
  setInventory
}) => {
  if (!isOpen) return null;

  // Stages definition (1 to 5)
  const egrekStages = [
    { stage: 1, name: 'Egrek Carbon Standard', baseCost: 10000000, desc: 'Pisau baja carbon tajam panen pelepah standar.' },
    { stage: 2, name: 'Egrek Titanium Heavy Duty', baseCost: 250000000, desc: 'Mata arit titanium tebal anti tumpul.' },
    { stage: 3, name: 'Egrek Cyber Electric Saw', baseCost: 5000000000, desc: 'Gergaji listrik cyber memotong TBS 3x lebih cepat!' },
    { stage: 4, name: 'Egrek Quantum Laser Plasma', baseCost: 75000000000, desc: 'Sinar laser plasma memotong pelepah seketika!' },
    { stage: 5, name: 'Egrek Sultan Anti-Gravity Gold', baseCost: 1000000000000, desc: 'Teknologi Sultan memotong buah sawit otomatis!' }
  ];

  const workerStages = [
    { stage: 1, name: 'Tim Buruh Panen Harian', baseCost: 35000000, desc: 'Karyawan buruh memanen TBS otomatis di kebun.' },
    { stage: 2, name: 'Armada Sopir & Kontraktor', baseCost: 800000000, desc: 'Tim armada truk panen profesional.' },
    { stage: 3, name: 'Drone Panen Otonom AI', baseCost: 20000000000, desc: 'Drone pemotong otomatis dari udara!' },
    { stage: 4, name: 'Helikopter Sky-Transport Sawit', baseCost: 250000000000, desc: 'Helikopter angkut mengumpulkan ribuan janjang!' },
    { stage: 5, name: 'Satelit Komando AI Sultan Sawit', baseCost: 2000000000000, desc: 'Komando satelit memanen seluruh kebun tanpa henti!' }
  ];

  const tractorStages = [
    { stage: 1, name: 'Traktor Mini Capit Loader', baseCost: 15000000, desc: 'Pompa hidrolik capit janjang ke truk.' },
    { stage: 2, name: 'Traktor Hydro Heavy Monster', baseCost: 400000000, desc: 'Tenaga hidrolik monster angkut 3 janjang sekali capit!' },
    { stage: 3, name: 'Traktor Cyber Electric Spider', baseCost: 8000000000, desc: 'Mesin listrik turbo akselerasi kilat.' },
    { stage: 4, name: 'Traktor Titan Capit Dual Arm', baseCost: 120000000000, desc: 'Capit ganda raksasa memuat seluruh janjang!' },
    { stage: 5, name: 'Traktor Sultan Maglev Hovercraft', baseCost: 1500000000000, desc: 'Traktor melayang anti-gravitasi bebas hambatan!' }
  ];

  const fertilizerStages = [
    { stage: 1, name: 'Formula NPK Granul Super', baseCost: 12000000, desc: 'Mempercepat regenerasi pertumbuhan buah sawit.' },
    { stage: 2, name: 'Bio-Enzyme Gold Organik', baseCost: 200000000, desc: 'Melipatgandakan bobot janjang hingga +100%.' },
    { stage: 3, name: 'Nano-Nutrisi Molekuler', baseCost: 4000000000, desc: 'Pohon sawit berbuah 2x lebih cepat!' },
    { stage: 4, name: 'Serum Quantum Plasma Akar', baseCost: 50000000000, desc: 'Kualitas buah otomatis kelas super eksklusif.' },
    { stage: 5, name: 'Pupuk Sultan Ajaib Infinity', baseCost: 500000000000, desc: 'Pohon sawit berbuah abadi tanpa henti!' }
  ];

  const sprayerStages = [
    { stage: 1, name: 'Sprayer Manual Knapsack', baseCost: 8000000, desc: 'Penyemprotan herbisida gulma & hama dasar.' },
    { stage: 2, name: 'Pompa Irigasi Kebun Gambut', baseCost: 120000000, desc: 'Mencegah kekeringan lahan gambut saat kemarau.' },
    { stage: 3, name: 'Truk Fogging Hama & Gulma', baseCost: 1500000000, desc: 'Penyemprotan masal membasmi ulat api & gulma.' },
    { stage: 4, name: 'Drone Fogging Agro-Tech', baseCost: 25000000000, desc: 'Penyemprotan otomatis udara skala ribuan hektar.' },
    { stage: 5, name: 'Bio-Sistem Nanotech Anti-Hama', baseCost: 350000000000, desc: 'Perlindungan total lahan dari penyakit & kemarau!' }
  ];

  const safetyGearStages = [
    { stage: 1, name: 'Boot Karet Anti-Ular', baseCost: 5000000, desc: 'Mengurangi kerugian jika terkena serangan ular.' },
    { stage: 2, name: 'Helm & Baju Pelindung Mandor', baseCost: 80000000, desc: 'Mengurangi efek jumpscare & denda kecelakaan.' },
    { stage: 3, name: 'Armor Kevlar Pekerja Sawit', baseCost: 1000000000, desc: 'Perlindungan dari serangan Kumbang Oryctes & Hewan Liar.' },
    { stage: 4, name: 'Suit Cyber Shield Mandor', baseCost: 15000000000, desc: 'Sistem perisai energi menolak semua serangan liar.' },
    { stage: 5, name: 'Exoskeleton Anti-Jumpscare Sultan', baseCost: 200000000000, desc: 'Baju mekanik Sultan kebal denda & refleksi otomatis!' }
  ];

  type CategoryType = 'egrek' | 'worker' | 'tractor' | 'fertilizer' | 'sprayer' | 'safetyGear';

  const getStageInfo = (type: CategoryType) => {
    switch (type) {
      case 'egrek':
        return egrekStages[(upgrades.egrekStage || 1) - 1] || egrekStages[4];
      case 'worker':
        return workerStages[(upgrades.workerStage || 1) - 1] || workerStages[4];
      case 'tractor':
        return tractorStages[(upgrades.tractorStage || 1) - 1] || tractorStages[4];
      case 'fertilizer':
        return fertilizerStages[(upgrades.fertilizerStage || 1) - 1] || fertilizerStages[4];
      case 'sprayer':
        return sprayerStages[(upgrades.sprayerStage || 1) - 1] || sprayerStages[4];
      case 'safetyGear':
        return safetyGearStages[(upgrades.safetyGearStage || 1) - 1] || safetyGearStages[4];
    }
  };

  const calculateCost = (level: number, baseCost: number) => {
    return Math.floor(baseCost * Math.pow(1.65, level));
  };

  const handleLevelUpgrade = (
    lvlKey: keyof UpgradesState,
    stageKey: keyof UpgradesState,
    type: CategoryType
  ) => {
    const curLvl = (upgrades[lvlKey] as number) || 0;
    const info = getStageInfo(type);

    if (curLvl >= 15) return; // Max level 15 for deep progression

    const cost = calculateCost(curLvl, info.baseCost);
    if (inventory.money < cost) return;

    setInventory(prev => ({ ...prev, money: prev.money - cost }));
    setUpgrades(prev => ({ ...prev, [lvlKey]: curLvl + 1 }));
    soundFx.playCoin();
  };

  const handleEvolveStage = (
    lvlKey: keyof UpgradesState,
    stageKey: keyof UpgradesState,
    type: CategoryType
  ) => {
    const curStage = (upgrades[stageKey] as number) || 1;
    if (curStage >= 5) return;

    const stagesList = type === 'egrek' ? egrekStages :
                       type === 'worker' ? workerStages :
                       type === 'tractor' ? tractorStages :
                       type === 'fertilizer' ? fertilizerStages :
                       type === 'sprayer' ? sprayerStages : safetyGearStages;

    const nextInfo = stagesList[curStage];
    const evolveCost = nextInfo.baseCost * 2.5;

    if (inventory.money < evolveCost) return;

    setInventory(prev => ({ ...prev, money: prev.money - evolveCost }));
    setUpgrades(prev => ({
      ...prev,
      [stageKey]: curStage + 1,
      [lvlKey]: 0 // reset level for new stage
    }));
    soundFx.playLevelUp();
  };

  const categories = [
    {
      type: 'egrek' as const,
      lvlKey: 'egrekSharpness' as keyof UpgradesState,
      stageKey: 'egrekStage' as keyof UpgradesState,
      icon: Scissors,
      lvl: upgrades.egrekSharpness || 1,
      stage: upgrades.egrekStage || 1
    },
    {
      type: 'worker' as const,
      lvlKey: 'autoHarvesterBots' as keyof UpgradesState,
      stageKey: 'workerStage' as keyof UpgradesState,
      icon: Users,
      lvl: upgrades.autoHarvesterBots || 0,
      stage: upgrades.workerStage || 1
    },
    {
      type: 'tractor' as const,
      lvlKey: 'tractorHydraulics' as keyof UpgradesState,
      stageKey: 'tractorStage' as keyof UpgradesState,
      icon: Truck,
      lvl: upgrades.tractorHydraulics || 1,
      stage: upgrades.tractorStage || 1
    },
    {
      type: 'fertilizer' as const,
      lvlKey: 'fertilizerBoost' as keyof UpgradesState,
      stageKey: 'fertilizerStage' as keyof UpgradesState,
      icon: Sparkles,
      lvl: upgrades.fertilizerBoost || 1,
      stage: upgrades.fertilizerStage || 1
    },
    {
      type: 'sprayer' as const,
      lvlKey: 'sprayerLevel' as keyof UpgradesState,
      stageKey: 'sprayerStage' as keyof UpgradesState,
      icon: Zap,
      lvl: upgrades.sprayerLevel || 0,
      stage: upgrades.sprayerStage || 1
    },
    {
      type: 'safetyGear' as const,
      lvlKey: 'safetyGearLevel' as keyof UpgradesState,
      stageKey: 'safetyGearStage' as keyof UpgradesState,
      icon: Crown,
      lvl: upgrades.safetyGearLevel || 0,
      stage: upgrades.safetyGearStage || 1
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-3xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-400/30">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">Bengkel Equip & Tim Karyawan Sultan</h2>
              <p className="text-xs text-slate-400">Upgrade hingga Stage 5 Evolution & pekerjakan ribuan buruh sawit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upgrade Items list */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {categories.map(cat => {
            const Icon = cat.icon;
            const stageInfo = getStageInfo(cat.type);
            const isMaxLvl = cat.lvl >= 15;
            const isMaxStage = cat.stage >= 5;
            const lvlCost = calculateCost(cat.lvl, stageInfo.baseCost);
            const canAffordLvl = inventory.money >= lvlCost;

            const stagesList = cat.type === 'egrek' ? egrekStages :
                               cat.type === 'worker' ? workerStages :
                               cat.type === 'tractor' ? tractorStages :
                               cat.type === 'fertilizer' ? fertilizerStages :
                               cat.type === 'sprayer' ? sprayerStages : safetyGearStages;

            const nextStageInfo = cat.stage < 5 ? stagesList[cat.stage] : null;

            const evolveCost = nextStageInfo ? nextStageInfo.baseCost * 2.5 : 0;
            const canAffordEvolve = inventory.money >= evolveCost;

            return (
              <div
                key={cat.type}
                className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-amber-400 mt-1 sm:mt-0 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-white truncate">{stageInfo.name}</h3>
                      <span className="text-3xs font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1 shrink-0">
                        <Crown className="w-3 h-3 text-amber-400" /> Tahap {cat.stage} / 5
                      </span>
                      <span className="text-3xs font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
                        Lvl {cat.lvl} / 15
                      </span>
                    </div>

                    <p className="text-2xs text-slate-300 mt-1 leading-relaxed break-words">{stageInfo.desc}</p>

                    {/* Progress Bar */}
                    <div className="w-full sm:w-48 bg-slate-900 h-2.5 rounded-full overflow-hidden mt-2.5 border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (cat.lvl / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-col gap-2">
                  {!isMaxLvl ? (
                    <button
                      onClick={() => handleLevelUpgrade(cat.lvlKey, cat.stageKey, cat.type)}
                      disabled={!canAffordLvl}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all w-full justify-center ${
                        canAffordLvl
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                      }`}
                    >
                      <span>Upgrade (Rp {lvlCost.toLocaleString('id-ID')})</span>
                    </button>
                  ) : !isMaxStage ? (
                    <button
                      onClick={() => handleEvolveStage(cat.lvlKey, cat.stageKey, cat.type)}
                      disabled={!canAffordEvolve}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all w-full justify-center ${
                        canAffordEvolve
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg animate-pulse active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>EVOLUSI TAHAP {cat.stage + 1} (Rp {evolveCost.toLocaleString('id-ID')})</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl border border-amber-500/40 text-center flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> TAHAP MAX SULTAN
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

