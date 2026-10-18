import React, { useState } from 'react';
import { X, Flame, ShieldAlert, Skull, Trophy, Zap, Swords } from 'lucide-react';
import { BossRaidState, InventoryState } from '../types';

interface BossRaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  bossRaid: BossRaidState;
  onStartRaid: (difficultyPercent: number) => void;
  inventory: InventoryState;
}

export const BossRaidModal: React.FC<BossRaidModalProps> = ({
  isOpen,
  onClose,
  bossRaid,
  onStartRaid,
  inventory
}) => {
  const [difficulty, setDifficulty] = useState<number>(50);

  if (!isOpen) return null;

  // Calculate difficulty projections based on difficulty percentage (10% to 100%)
  const isExtreme = difficulty > 80;

  let projectedHp = 500;
  let projectedTime = 60;
  let projectedRewardMoney = 25000000;
  let projectedRewardCpo = 3;
  let rankName = 'Mudah';
  let rankColor = 'text-emerald-400';
  let bgGradient = 'from-emerald-950/40 to-slate-900';

  if (difficulty <= 40) {
    projectedHp = Math.round(300 + (difficulty / 40) * 700);
    projectedTime = Math.round(60 - (difficulty / 40) * 15);
    projectedRewardMoney = Math.round(15000000 + (difficulty / 40) * 35000000);
    projectedRewardCpo = Math.round(2 + (difficulty / 40) * 3);
    rankName = 'Latihan / Mudah';
    rankColor = 'text-emerald-400';
  } else if (difficulty <= 80) {
    const ratio = (difficulty - 40) / 40;
    projectedHp = Math.round(1000 + ratio * 9000);
    projectedTime = Math.round(45 - ratio * 15);
    projectedRewardMoney = Math.round(50000000 + ratio * 450000000);
    projectedRewardCpo = Math.round(5 + ratio * 20);
    rankName = 'Heroik / Sangat Sulit';
    rankColor = 'text-amber-400';
    bgGradient = 'from-amber-950/40 to-slate-900';
  } else {
    // >80% SULTAN EKSTREM
    const ratio = (difficulty - 80) / 20;
    projectedHp = Math.round(10000 + ratio * 90000); // 10,000 to 100,000 HP
    projectedTime = Math.round(30 - ratio * 10); // 30s to 20s
    projectedRewardMoney = Math.round(500000000 + ratio * 4500000000); // Rp 500M to 5 Miliar!
    projectedRewardCpo = Math.round(25 + ratio * 175); // 25 to 200 Ton CPO
    rankName = '👑 SULTAN EKSTREM (>80%)';
    rankColor = 'text-rose-400';
    bgGradient = 'from-rose-950/60 via-amber-950/40 to-slate-950';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-xl bg-slate-900 border-2 ${isExtreme ? 'border-amber-400 ring-4 ring-rose-500/30' : 'border-slate-700'} rounded-3xl p-6 shadow-2xl overflow-hidden text-white flex flex-col gap-5 bg-gradient-to-b ${bgGradient}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isExtreme ? 'bg-rose-500/20 text-rose-400 border border-rose-400/40' : 'bg-amber-500/20 text-amber-400 border border-amber-400/40'}`}>
              <Skull className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Raid Boss King Oryctes</span>
                {isExtreme && (
                  <span className="text-3xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    MODE IMPOSSIBLE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Atur tingkat kesulitan raid boss untuk melipatgandakan reward & benefit!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boss Status Active Warning */}
        {bossRaid.active ? (
          <div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-2xl text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-rose-300 font-black text-sm">
              <ShieldAlert className="w-5 h-5 animate-spin" />
              <span>RAID BOSS SEDANG AKTIF DI KEBUAN!</span>
            </div>
            <p className="text-xs text-slate-200">
              HP: {bossRaid.hp} / {bossRaid.maxHp} | Sisa Waktu: {bossRaid.timeRemaining}s
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all"
            >
              ⚔️ LANJUTKAN COMBAT DI LAPANGAN
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Difficulty Percentage Slider */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${rankColor}`} />
                  <span>Tingkat Kesulitan Raid Boss:</span>
                </label>
                <span className={`text-base font-black ${rankColor}`}>
                  {difficulty}%
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex items-center justify-between text-3xs font-bold text-slate-400">
                <span>10% (Mudah)</span>
                <span>50% (Sedang)</span>
                <span>80% (Sangat Sulit)</span>
                <span className="text-rose-400">100% (Sultan)</span>
              </div>
            </div>

            {/* Extreme >80% Banner */}
            {isExtreme && (
              <div className="bg-gradient-to-r from-rose-900/60 via-amber-900/60 to-rose-900/60 border-2 border-amber-400/80 p-3.5 rounded-2xl text-center space-y-1 shadow-lg animate-pulse">
                <div className="flex items-center justify-center gap-1.5 text-amber-300 font-extrabold text-xs">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>PERINGATAN SULTAN EKSTREM (&gt;80%)</span>
                </div>
                <p className="text-3xs text-amber-100 font-medium leading-relaxed">
                  Tingkat kesulitan di atas 80% menjadikan King Oryctes sangat tebal ({projectedHp.toLocaleString('id-ID')} HP) &amp; hampir mustahil dikalahkan! Namun jika berhasil, benefitnya luar biasa fantastis!
                </p>
              </div>
            )}

            {/* Projected Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-3xs font-bold text-slate-400 block uppercase">Peringkat</span>
                <span className={`text-xs font-black ${rankColor} block mt-0.5 truncate`}>
                  {rankName}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-3xs font-bold text-slate-400 block uppercase">Darah (HP)</span>
                <span className="text-xs font-black text-rose-400 block mt-0.5">
                  {projectedHp.toLocaleString('id-ID')} HP
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-3xs font-bold text-slate-400 block uppercase">Batas Waktu</span>
                <span className="text-xs font-black text-amber-400 block mt-0.5">
                  {projectedTime} Detik
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-3xs font-bold text-slate-400 block uppercase">Reward CPO</span>
                <span className="text-xs font-black text-emerald-400 block mt-0.5">
                  +{projectedRewardCpo} Ton
                </span>
              </div>
            </div>

            {/* Total Benefit Money Reward */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <span className="text-3xs font-extrabold text-amber-300 uppercase tracking-wider block">
                    TOTAL HADIAH UANG PANEN
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-400">
                    +Rp {projectedRewardMoney.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              {isExtreme && (
                <span className="text-3xs font-black bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 px-2.5 py-1 rounded-xl shadow">
                  BENEFIT SULTAN x{Math.round(projectedRewardMoney / 25000000)}
                </span>
              )}
            </div>

            {/* Launch Button */}
            <button
              onClick={() => {
                onStartRaid(difficulty);
                onClose();
              }}
              className={`w-full py-3.5 px-4 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all ${
                isExtreme
                  ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white border-2 border-amber-300 ring-2 ring-rose-500/50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border border-amber-400'
              }`}
            >
              <Swords className="w-5 h-5" />
              <span>MULAI RAID BOSS SAWIT ({difficulty}%)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
