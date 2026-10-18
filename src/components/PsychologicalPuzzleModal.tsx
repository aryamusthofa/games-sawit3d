import React, { useState } from 'react';
import { PsychologicalPuzzle } from '../types';
import { Brain, Sparkles, X, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PsychologicalPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PsychologicalPuzzle | null;
  onSolve: (isCorrect: boolean, puzzle: PsychologicalPuzzle) => void;
}

export const PsychologicalPuzzleModal: React.FC<PsychologicalPuzzleModalProps> = ({
  isOpen,
  onClose,
  puzzle,
  onSolve
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  if (!isOpen || !puzzle) return null;

  const handleChoose = (idx: number) => {
    if (submitted) return;
    soundFx.playClick();
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || submitted) return;
    setSubmitted(true);
    const chosen = puzzle.options[selectedIdx];
    if (chosen.isCorrect) {
      soundFx.playPuzzleSuccess();
    } else {
      soundFx.playPuzzleWrong();
    }
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    const chosen = puzzle.options[selectedIdx];
    onSolve(chosen.isCorrect, puzzle);
    setSelectedIdx(null);
    setSubmitted(false);
    setShowHint(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl w-full max-w-xl text-white shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/40 animate-pulse">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-purple-200">
                  {puzzle.title}
                </h2>
                <span className="bg-purple-950 border border-purple-400 text-purple-300 text-3xs font-bold px-2 py-0.5 rounded-full">
                  TEKA-TEKI PIKIRAN
                </span>
              </div>
              <p className="text-2xs text-slate-400">Analisis kasus agronomi & keputusan logis sawit</p>
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
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Scenario Box */}
          <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-4 relative">
            <h3 className="text-xs font-bold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <span>📜 KASUS TEKNIS:</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {puzzle.scenario}
            </p>

            {showHint ? (
              <div className="mt-3 bg-indigo-950/80 border border-indigo-400/30 p-2.5 rounded-xl text-2xs text-indigo-200 font-medium">
                💡 <span className="font-bold">PETUNJUK KRITIS:</span> {puzzle.hint}
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="mt-2 text-3xs text-purple-400 hover:text-purple-300 underline flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3 h-3" /> Tampilkan Petunjuk Logika
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">
              PILIH KEPUTUSAN TERBAIK ANDA:
            </label>
            {puzzle.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              let borderStyle = 'border-slate-800 hover:border-purple-500/50 bg-slate-800/60';
              if (isSelected) {
                borderStyle = 'border-purple-400 bg-purple-950/60 ring-1 ring-purple-400';
              }
              if (submitted) {
                if (opt.isCorrect) {
                  borderStyle = 'border-emerald-500 bg-emerald-950/80 ring-1 ring-emerald-400';
                } else if (isSelected && !opt.isCorrect) {
                  borderStyle = 'border-red-500 bg-red-950/80 ring-1 ring-red-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleChoose(idx)}
                  disabled={submitted}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${borderStyle}`}
                >
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-2xs font-bold ${
                    isSelected ? 'bg-purple-500 text-slate-950 border-white' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white leading-snug">
                      {opt.text}
                    </p>
                    {submitted && isSelected && (
                      <p className={`mt-2 text-2xs font-medium p-2 rounded-lg border ${
                        opt.isCorrect
                          ? 'bg-emerald-900/40 text-emerald-200 border-emerald-500/30'
                          : 'bg-red-900/40 text-red-200 border-red-500/30'
                      }`}>
                        {opt.explanation}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-purple-500/20 flex items-center justify-between gap-3">
          <div className="text-2xs text-slate-400">
            <span>HADIAH SOLUSI BENAR: </span>
            <span className="text-amber-300 font-bold">Rp {puzzle.rewardMoney.toLocaleString('id-ID')} & {puzzle.rewardCpo} Ton CPO</span>
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedIdx === null}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-1.5 ${
                selectedIdx !== null
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>EKSEKUSI KEPUTUSAN</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xl active:scale-95"
            >
              LANJUTKAN PETUALANGAN ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
