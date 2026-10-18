import React, { useState } from 'react';
import { RemotePlayer, ChatMessage } from '../types';
import { X, Users, Trophy, Send, Swords, Sparkles, MessageSquare } from 'lucide-react';

interface MultiplayerCompetitionProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onJoinRoom: (newRoomId: string) => void;
  players: RemotePlayer[];
  myScore: number;
  myHarvestCount: number;
  timeLeft: number;
  chatMessages: ChatMessage[];
  onSendChat: (text: string) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

export const MultiplayerCompetition: React.FC<MultiplayerCompetitionProps> = ({
  isOpen,
  onClose,
  roomId,
  onJoinRoom,
  players,
  myScore,
  myHarvestCount,
  timeLeft,
  chatMessages,
  onSendChat,
  playerName,
  setPlayerName
}) => {
  const [inputRoom, setInputRoom] = useState('');
  const [chatInput, setChatInput] = useState('');

  if (!isOpen) return null;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoom.trim()) {
      onJoinRoom(inputRoom.trim().toLowerCase());
    }
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendChat(chatInput.trim());
      setChatInput('');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="bg-slate-900 border border-sky-500/30 rounded-3xl w-full max-w-3xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-sky-950/60 to-slate-900 border-b border-sky-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-400/30">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-sky-300">Adu Panen Sawit Online (Multiplayer)</h2>
              <p className="text-xs text-slate-400">Kompetisi kecepatan memanen TBS real-time dalam batas waktu 3 menit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Room Join & Nickname Config */}
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1">
              <label className="text-2xs text-slate-400 block mb-1">Nama Pemanen Anda:</label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={18}
                className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>

            <form onSubmit={handleJoinSubmit} className="flex gap-2 flex-1 items-end">
              <div className="flex-1">
                <label className="text-2xs text-slate-400 block mb-1">Kode Arena Room:</label>
                <input
                  type="text"
                  placeholder="e.g. arena-sawit-1"
                  value={inputRoom}
                  onChange={e => setInputRoom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all whitespace-nowrap"
              >
                Masuk Room
              </button>
            </form>
          </div>

          {/* Current Room Info & Live Match Timer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leaderboard */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-sky-300">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>Klasemen Poin Arena</span>
                  </div>
                  <span className="text-2xs font-extrabold bg-sky-950 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    Room: {roomId}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sortedPlayers.length === 0 ? (
                    <p className="text-2xs text-slate-400 italic">Belum ada pemanen lain di room ini. Undang teman dengan kode room diatas!</p>
                  ) : (
                    sortedPlayers.map((p, index) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-2xs w-5 h-5 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="font-bold text-white">{p.name}</span>
                        </div>
                        <span className="font-extrabold text-amber-400">{p.score} Pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-400">Sisa Waktu Duel:</span>
                <span className="font-mono font-black text-amber-400 text-base">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Match Chat */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-sky-300 mb-3">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <span>Obrolan Lapangan</span>
                </div>

                <div className="space-y-2 h-36 overflow-y-auto pr-1 mb-3 text-2xs">
                  {chatMessages.length === 0 ? (
                    <p className="text-slate-500 italic">Kirim pesan singkat untuk berkomunikasi dengan pemanen lain!</p>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/40">
                        <span className="font-bold text-sky-400">{msg.senderName}: </span>
                        <span className="text-slate-200">{msg.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleSendSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  maxLength={60}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white font-medium text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
