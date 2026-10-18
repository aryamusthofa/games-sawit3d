import React from 'react';
import { CharacterItem, InventoryState } from '../types';
import { X, Users, Check, Sparkles, Award } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CharacterRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterItem[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
  onUnlockCharacter: (id: string) => void;
  inventory: InventoryState;
}

export const CharacterRosterModal: React.FC<CharacterRosterModalProps> = ({
  isOpen,
  onClose,
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onUnlockCharacter,
  inventory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-400/30 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-indigo-300">Roster Karakter & Avatar Sawit</h2>
              <p className="text-xs text-slate-400">Beli dan pilih karakter dengan bonus skill eksklusif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Grid Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
          {characters.map(char => {
            const isSelected = selectedCharacterId === char.id;
            const canAfford = inventory.money >= char.price;

            return (
              <div
                key={char.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden h-full ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-lg ring-1 ring-indigo-400'
                    : char.unlocked
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-900/80 border-slate-800 opacity-90'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-2.5 bg-slate-900 rounded-2xl border border-slate-700 shadow-inner shrink-0">
                      {char.avatarEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{char.name}</span>
                        {char.id === 'lord_sawit' && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </h3>
                      <span className="inline-block text-2xs font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30 truncate max-w-full">
                        {char.role}
                      </span>
                    </div>
                  </div>

                  <p className="text-2xs text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60 font-medium leading-relaxed break-words">
                    ⚡ {char.perkText}
                  </p>

                  <div className="space-y-1.5 text-2xs">
                    {char.specialSkill && (
                      <div className="bg-indigo-950/80 p-2 rounded-xl border border-indigo-500/30 text-indigo-200 leading-snug break-words">
                        <span className="font-bold text-amber-300">🔥 Skill Khusus:</span> {char.specialSkill}
                      </div>
                    )}
                    {char.quote && (
                      <p className="italic text-slate-400 text-3xs px-1 leading-normal break-words">
                        "{char.quote}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 mt-auto">
                  {char.unlocked ? (
                    isSelected ? (
                      <span className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-inner">
                        <Check className="w-4 h-4" /> SEDANG DIGUNAKAN
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          soundFx.playCoin();
                          onSelectCharacter(char.id);
                        }}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        PILIH KARAKTER
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          soundFx.playCoin();
                          onUnlockCharacter(char.id);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <span>BELI (Rp {char.price.toLocaleString('id-ID')})</span>
                    </button>
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
