import React, { useEffect } from 'react';
import { JumpscareState } from '../types';
import { soundFx } from '../utils/audio';

interface JumpscareModalProps {
  jumpscare: JumpscareState;
  onDodge: () => void;
  onFail: () => void;
}

export const JumpscareModal: React.FC<JumpscareModalProps> = ({
  jumpscare,
  onDodge,
  onFail
}) => {
  useEffect(() => {
    if (jumpscare.active) {
      if (jumpscare.sound === 'snake') {
        soundFx.playSnakeHiss();
      } else {
        soundFx.playJumpscare();
      }
    }
  }, [jumpscare.active, jumpscare.sound]);

  if (!jumpscare.active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none animate-pulse overflow-hidden">
      {/* Flashing Red Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-transparent to-red-900/80 pointer-events-none animate-ping opacity-30" />

      <div className="relative bg-gradient-to-b from-red-950 via-slate-950 to-red-950 border-4 border-red-600 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-[0_0_80px_rgba(220,38,38,0.8)] animate-bounce">
        <div className="text-7xl sm:text-8xl mb-3 animate-spin">
          {jumpscare.emoji}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-red-500 tracking-wider mb-1 uppercase drop-shadow-[0_4px_12px_rgba(255,0,0,0.8)]">
          🚨 {jumpscare.title}
        </h1>

        <p className="text-sm sm:text-base text-amber-200 font-bold mb-4">
          {jumpscare.subtitle}
        </p>

        <div className="bg-red-900/40 border border-red-500/60 rounded-2xl p-3 mb-6">
          <div className="flex justify-between text-xs text-red-200 font-bold mb-1">
            <span>WAKTU REAKSI REFLEKS:</span>
            <span className="text-amber-300 font-mono text-sm">{jumpscare.timeRemaining.toFixed(1)} Detik</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-red-500/40">
            <div
              className="bg-gradient-to-r from-amber-400 to-red-500 h-full transition-all duration-100"
              style={{ width: `${Math.max(0, (jumpscare.timeRemaining / 3.0) * 100)}%` }}
            />
          </div>
        </div>

        <button
          onClick={onDodge}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-2xl border-2 border-white hover:scale-105 active:scale-95 transition-all animate-pulse"
        >
          💥 REAKSI CEPAT: LOMPAT / ELAKKAN!
        </button>

        <p className="text-2xs text-red-300/80 mt-3 font-semibold">
          *Gagal merespon akan mengakibatkan denda Rp {jumpscare.penaltyMoney.toLocaleString('id-ID')} & kerugian TBS!
        </p>
      </div>
    </div>
  );
};
