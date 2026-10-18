import React from 'react';
import { StoryChapter, QuestItem, InventoryState } from '../types';
import { X, BookOpen, Zap, Award, CheckCircle2, ChevronRight, Gift, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface StoryQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStoryChapter: StoryChapter;
  onClaimChapterReward: () => void;
  quests: QuestItem[];
  inventory: InventoryState;
}

export const StoryQuestModal: React.FC<StoryQuestModalProps> = ({
  isOpen,
  onClose,
  currentStoryChapter,
  onClaimChapterReward,
  quests,
  inventory
}) => {
  if (!isOpen) return null;

  const isChapterReadyToClaim = currentStoryChapter.currentAmount >= currentStoryChapter.targetAmount && !currentStoryChapter.completed;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-400/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">Alur Cerita & Daftar Misi Sawit</h2>
              <p className="text-xs text-slate-400">Ikuti perjalanan dari pemanen muda hingga Sultan Sawit</p>
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
          {/* Active Story Chapter Banner */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-2xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  CHAPTER {currentStoryChapter.chapterNumber}
                </span>
                <span className="text-xs font-bold text-amber-400">{currentStoryChapter.title}</span>
              </div>
              {currentStoryChapter.completed && (
                <span className="text-2xs bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> SELESAI
                </span>
              )}
            </div>

            {/* Story Dialogue Box */}
            <div className="flex items-start gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80 mb-4">
              <div className="text-3xl p-2 bg-slate-800 rounded-2xl border border-slate-700 shrink-0">
                {currentStoryChapter.speakerEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-amber-300">{currentStoryChapter.speakerName}</span>
                  <span className="text-2xs text-slate-400">({currentStoryChapter.speakerRole})</span>
                </div>
                <p className="text-xs italic text-slate-200 mt-1 leading-relaxed">
                  "{currentStoryChapter.dialogue}"
                </p>
              </div>
            </div>

            {/* Story Objective Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Target: {currentStoryChapter.objective}</span>
                <span className="font-bold text-amber-400">
                  {currentStoryChapter.currentAmount.toFixed(1)} / {currentStoryChapter.targetAmount} Ton
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (currentStoryChapter.currentAmount / currentStoryChapter.targetAmount) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Chapter Claim Button */}
            {isChapterReadyToClaim && (
              <button
                onClick={() => {
                  soundFx.playChapterComplete();
                  onClaimChapterReward();
                }}
                className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 animate-bounce border border-white"
              >
                <Gift className="w-4 h-4" />
                <span>KLAIM HADIAH CHAPTER (Rp {currentStoryChapter.rewardMoney.toLocaleString('id-ID')})</span>
              </button>
            )}
          </div>

          {/* Section: Infinite Daily Quests List */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-extrabold text-sm text-slate-200">Misi Harian Tak Terbatas</h3>
            </div>

            <div className="space-y-2.5">
              {quests.map((q, idx) => {
                const isReady = q.currentAmount >= q.targetAmount && !q.completed;
                return (
                  <div
                    key={`${q.id}-${idx}`}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      q.completed
                        ? 'bg-slate-900/60 border-slate-800 opacity-60'
                        : isReady
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{q.type === 'harvest_tbs' ? '🌾' : '🚛'}</span>
                        <h4 className="font-bold text-xs text-white">{q.title}</h4>
                      </div>
                      <span className="text-2xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                        +Rp {q.rewardMoney.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-2xs text-slate-400 mt-1">{q.description}</p>

                    <div className="mt-2.5 flex items-center justify-between gap-3 text-2xs">
                      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (q.currentAmount / q.targetAmount) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="font-bold text-slate-300">
                        {q.currentAmount.toFixed(1)} / {q.targetAmount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
