import React, { useState } from 'react';
import { BotPlayer, InventoryState } from '../types';
import { X, Swords, Trophy, Play, RefreshCw, Zap, Award } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface BotDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDuelActive: boolean;
  duelTimeLeft: number;
  playerScore: number;
  botPlayers: BotPlayer[];
  onStartDuel: (durationSec: number) => void;
  onStopDuel: () => void;
  inventory: InventoryState;
}

export const BotDuelModal: React.FC<BotDuelModalProps> = ({
  isOpen,
  onClose,
  isDuelActive,
  duelTimeLeft,
  playerScore,
  botPlayers,
  onStartDuel,
  onStopDuel,
  inventory
}) => {
  const [selectedDuration, setSelectedDuration] = useState(120);

  if (!isOpen) return null;

  // Combine player and bots for live ranking
  const leaderboard = [
    { id: 'player', name: 'Anda (Pemanen)', score: playerScore, isPlayer: true, color: '#f59e0b' },
    ...botPlayers.map(b => ({ id: b.id, name: b.name, score: b.score, isPlayer: false, color: b.color }))
  ].sort((a, b) => b.score - a.score);

  const playerRank = leaderboard.findIndex(item => item.isPlayer) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-red-500/40 rounded-3xl w-full max-w-xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-2xl border border-red-400/30">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-red-300">Duel Panen VS AI Bot Komputer</h2>
              <p className="text-xs text-slate-400">Bertarung kecepatan panen melawan rival AI offline secara langsung</p>
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
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Duel Status & Timer Bar */}
          {isDuelActive ? (
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-500/50 p-4 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                DUEL DILANGSUNGKAN!
              </div>
              <div className="text-3xl font-black text-amber-300 my-1">
                {Math.floor(duelTimeLeft / 60)}:{(duelTimeLeft % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-2xs text-slate-400">Peringkat Sementara Anda: <span className="text-amber-400 font-extrabold"># {playerRank}</span></p>

              <button
                onClick={onStopDuel}
                className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
              >
                Batalkan Duel
              </button>
            </div>
          ) : (
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl space-y-3">
              <h3 className="font-bold text-xs text-slate-300">Pilih Durasi Pertandingan Duel:</h3>
              <div className="grid grid-cols-3 gap-2">
                {[60, 120, 180].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setSelectedDuration(sec)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      selectedDuration === sec
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {sec / 60} Menit
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  soundFx.playLevelUp();
                  onStartDuel(selectedDuration);
                }}
                className="w-full py-3 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>MULAI BATTLE DUEL PANEN</span>
              </button>
            </div>
          )}

          {/* Leaderboard Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Live Leaderboard Skor Duel
              </span>
              <span className="text-2xs text-slate-400">3 AI Bot Rival Competitors</span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    item.isPlayer
                      ? 'bg-amber-950/60 border-amber-500/60 shadow-md'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-2xs ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      {item.name}
                      {item.isPlayer && <span className="text-2xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">Anda</span>}
                    </span>
                  </div>

                  <span className="font-black text-xs text-amber-400">
                    {item.score} Pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
