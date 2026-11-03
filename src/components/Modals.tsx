import React, { useState } from 'react';
import { Trophy, Settings, Share2, X, Volume2, VolumeX, Music, Award, RotateCcw, Home, Sparkles, Volume1, Download } from 'lucide-react';
import { LeaderboardEntry, GameSettings } from '../types/game';
import { soundManager } from '../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  onClear: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 border-4 border-amber-500 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playFlap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl border-2 border-amber-600 shadow-md mb-2">
            <Trophy className="w-8 h-8 text-amber-900" />
          </div>
          <h2 className="text-3xl font-cartoon text-amber-900 text-stroke-sm tracking-wide">
            LEADERBOARD
          </h2>
          <p className="text-xs font-game text-amber-700">Top Aviators of Flappy Bird 2</p>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-amber-800/70 font-game">
              No flight records yet. Go set the first record!
            </div>
          ) : (
            entries.map((item, idx) => {
              const isTop3 = idx < 3;
              const rankColor =
                idx === 0
                  ? 'bg-yellow-400 text-yellow-950 border-yellow-500'
                  : idx === 1
                  ? 'bg-slate-300 text-slate-900 border-slate-400'
                  : idx === 2
                  ? 'bg-amber-600 text-amber-50 border-amber-700'
                  : 'bg-amber-200/80 text-amber-900 border-amber-300';

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                    idx === 0
                      ? 'bg-yellow-100/90 border-yellow-400 shadow-sm'
                      : 'bg-white/80 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-cartoon text-sm border ${rankColor}`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-cartoon text-base text-slate-800 flex items-center gap-1.5">
                        {item.name}
                        {idx === 0 && <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />}
                      </div>
                      <div className="text-[11px] font-game text-slate-500">
                        Level {item.level} · {item.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-cartoon text-amber-800 text-stroke-sm">
                      {item.score}
                    </div>
                    <div className="text-[10px] font-game uppercase tracking-wider text-amber-600 font-bold">
                      PTS
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reset button */}
        <div className="mt-5 pt-3 border-t border-amber-200 flex justify-between items-center">
          <button
            onClick={() => {
              if (confirm('Reset high scores to default?')) {
                onClear();
              }
            }}
            className="text-xs font-game text-amber-700 hover:text-rose-600 underline"
          >
            Reset Scores
          </button>
          <button
            onClick={() => {
              soundManager.playFlap();
              onClose();
            }}
            className="px-5 py-2 font-cartoon text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow border-2 border-amber-600"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdate: (updated: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-sky-50 to-blue-100 rounded-3xl p-6 border-4 border-sky-500 shadow-2xl">
        <button
          onClick={() => {
            soundManager.playFlap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-sky-400 to-blue-500 rounded-2xl border-2 border-sky-600 shadow-md mb-2">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-cartoon text-sky-950 text-stroke-sm tracking-wide">
            SETTINGS
          </h2>
          <p className="text-xs font-game text-sky-700">Audio, Controls & Difficulty</p>
        </div>

        <div className="space-y-4">
          {/* Bird Chirp & SFX */}
          <div className="bg-white/85 p-3.5 rounded-2xl border-2 border-sky-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-cartoon text-slate-800 flex items-center gap-2 text-sm">
                <Volume2 className="w-4 h-4 text-sky-600" />
                Bird Chirps & Sound FX
              </span>
              <button
                onClick={() => {
                  const newState = soundManager.toggleSfx();
                  onUpdate({ sfxVolume: newState ? 0.8 : 0 });
                  if (newState) soundManager.playBirdChirp(1.2);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-cartoon border-2 transition-all ${
                  soundManager.sfxEnabled
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-300 text-slate-700 border-slate-400'
                }`}
              >
                {soundManager.sfxEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => soundManager.playBirdChirp(1.3)}
                className="px-2.5 py-1 text-xs font-game bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg border border-sky-300 flex items-center gap-1 shrink-0"
              >
                <Volume1 className="w-3.5 h-3.5" />
                Play Chirp 🎵
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundManager.volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  soundManager.setVolume(v);
                  onUpdate({ sfxVolume: v });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Background Melody */}
          <div className="bg-white/85 p-3.5 rounded-2xl border-2 border-sky-200">
            <div className="flex items-center justify-between">
              <span className="font-cartoon text-slate-800 flex items-center gap-2 text-sm">
                <Music className="w-4 h-4 text-sky-600" />
                Background Game Music
              </span>
              <button
                onClick={() => {
                  const newState = soundManager.toggleMusic();
                  onUpdate({ musicVolume: newState ? 0.8 : 0 });
                }}
                className={`px-3 py-1 rounded-xl text-xs font-cartoon border-2 transition-all ${
                  soundManager.musicEnabled
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-300 text-slate-700 border-slate-400'
                }`}
              >
                {soundManager.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white/85 p-3.5 rounded-2xl border-2 border-sky-200">
            <div className="font-cartoon text-slate-800 text-sm mb-2">DIFFICULTY LEVEL</div>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'NORMAL', 'HARD'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    soundManager.playFlap();
                    onUpdate({ difficulty: diff });
                  }}
                  className={`py-2 rounded-xl text-xs font-cartoon border-2 transition-all ${
                    settings.difficulty === diff
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Player Name */}
          <div className="bg-white/85 p-3.5 rounded-2xl border-2 border-sky-200">
            <label className="block font-cartoon text-slate-800 text-sm mb-1.5">
              PILOT NICKNAME
            </label>
            <input
              type="text"
              maxLength={12}
              value={settings.playerName}
              onChange={(e) => onUpdate({ playerName: e.target.value })}
              className="w-full px-3 py-2 text-sm font-game bg-white border-2 border-sky-300 rounded-xl focus:outline-none focus:border-sky-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Download Project ZIP */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-2xl border-2 border-emerald-300 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-cartoon text-emerald-950 flex items-center gap-2 text-sm">
                <Download className="w-4 h-4 text-emerald-600" />
                PROJECT SOURCE CODE (.ZIP)
              </span>
              <span className="text-[10px] font-cartoon bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-400">
                1.07 MB
              </span>
            </div>
            <p className="text-[11px] font-game text-emerald-800 mb-2.5">
              Complete React + TypeScript source code, assets, audio aur styling files.
            </p>
            <a
              href="/flappy-bird-2.zip"
              download="flappy-bird-2.zip"
              onClick={() => soundManager.playCoin()}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-cartoon text-xs flex items-center justify-center gap-2 shadow border-2 border-emerald-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PROJECT ZIP FILE</span>
            </a>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={() => {
              soundManager.playFlap();
              onClose();
            }}
            className="w-full py-2.5 font-cartoon text-base text-white bg-sky-500 hover:bg-sky-600 rounded-2xl shadow border-2 border-sky-600"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestScore: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, bestScore }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleShare = async () => {
    soundManager.playCoin();
    const shareText = `🐦 I scored ${bestScore} pts in Flappy Bird 2! Can you beat my high score? Play now!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flappy Bird 2',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-pink-50 to-purple-100 rounded-3xl p-6 border-4 border-pink-500 shadow-2xl text-center">
        <button
          onClick={() => {
            soundManager.playFlap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-2xl border-2 border-purple-600 shadow-md mb-2">
          <Share2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-cartoon text-purple-950 text-stroke-sm tracking-wide">
          SHARE GAME
        </h2>
        <p className="text-xs font-game text-purple-700 mb-4">
          Challenge your friends to beat your flight record!
        </p>

        {/* Badge Card */}
        <div className="bg-white/90 p-4 rounded-2xl border-2 border-pink-300 shadow-sm mb-4">
          <div className="text-xs font-game text-slate-500 uppercase tracking-wider font-bold">
            YOUR BEST RECORD
          </div>
          <div className="text-4xl font-cartoon text-purple-800 text-stroke-sm my-1">
            {bestScore} <span className="text-sm">PTS</span>
          </div>
          <div className="text-xs font-game text-slate-600">
            Flappy Bird 2 · Multi-level Flight
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-3 font-cartoon text-base text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg border-2 border-purple-700 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          {copied ? 'COPIED TO CLIPBOARD!' : 'SHARE TO FRIENDS'}
        </button>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  bestScore: number;
  level: number;
  isNewHigh: boolean;
  coinsEarned: number;
  totalCoins: number;
  onPlayAgain: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
  onOpenGarage: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  level,
  isNewHigh,
  coinsEarned,
  totalCoins,
  onPlayAgain,
  onHome,
  onOpenLeaderboard,
  onOpenGarage,
}) => {
  // Medal determination
  const getMedal = () => {
    if (score >= 40) return { label: 'PLATINUM', color: 'from-cyan-300 to-blue-400 border-cyan-500' };
    if (score >= 25) return { label: 'GOLD', color: 'from-yellow-300 to-amber-500 border-yellow-600' };
    if (score >= 12) return { label: 'SILVER', color: 'from-slate-200 to-slate-400 border-slate-500' };
    if (score >= 5) return { label: 'BRONZE', color: 'from-amber-600 to-amber-800 border-amber-900' };
    return null;
  };

  const medal = getMedal();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 border-4 border-amber-500 shadow-2xl text-center">
        {/* Game Over Title */}
        <h2 className="text-4xl font-cartoon text-red-500 text-stroke-md tracking-wider mb-2 animate-bounce">
          GAME OVER
        </h2>

        {/* Scorecard Box */}
        <div className="bg-white/90 rounded-2xl p-4 border-3 border-amber-400 shadow-inner mb-3">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="text-left">
              <span className="text-xs font-game uppercase font-bold text-amber-700">MEDAL</span>
              <div className="mt-1 flex items-center gap-1.5">
                {medal ? (
                  <div
                    className={`px-2.5 py-1 rounded-xl bg-gradient-to-tr ${medal.color} text-white font-cartoon text-xs border shadow-sm flex items-center gap-1`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    {medal.label}
                  </div>
                ) : (
                  <span className="text-xs font-game text-slate-400">None</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-game uppercase font-bold text-amber-700">SCORE</div>
              <div className="text-3xl font-cartoon text-slate-800 text-stroke-sm">{score}</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-amber-100">
            <div className="text-left">
              <div className="text-xs font-game uppercase font-bold text-amber-700">LEVEL REACHED</div>
              <div className="text-sm font-cartoon text-sky-700">Level {level}</div>
            </div>

            <div className="text-right">
              <div className="text-xs font-game uppercase font-bold text-amber-700 flex items-center justify-end gap-1">
                BEST
                {isNewHigh && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-md text-[9px] font-cartoon">
                    NEW!
                  </span>
                )}
              </div>
              <div className="text-xl font-cartoon text-amber-900 text-stroke-sm">
                {bestScore}
              </div>
            </div>
          </div>

          {/* Coins Earned Banner */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-left">
              <span className="text-[11px] font-game text-slate-500 uppercase font-bold">COINS CLAIMED</span>
              <div className="text-base font-cartoon text-amber-600 flex items-center gap-1">
                +{coinsEarned} 🪙
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-game text-slate-500 uppercase font-bold">TOTAL WALLET</span>
              <div className="text-base font-cartoon text-amber-900">
                {totalCoins} 🪙
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playFlap();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-2xl font-cartoon text-xl text-white text-stroke-sm btn-3d-green tracking-wider uppercase transition-transform flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5 stroke-[3]" />
            PLAY AGAIN
          </button>


          <button
            onClick={() => {
              soundManager.playFlap();
              onOpenGarage();
            }}
            className="w-full py-2.5 rounded-2xl font-cartoon text-base text-white text-stroke-sm btn-3d-blue tracking-wide uppercase transition-transform flex items-center justify-center gap-2 shadow"
          >
            🛒 FLAPPY GARAGE (SHOP)
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundManager.playFlap();
                onHome();
              }}
              className="py-2.5 rounded-xl font-cartoon text-sm text-white text-stroke-sm btn-3d-orange flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              HOME
            </button>
            <button
              onClick={() => {
                soundManager.playFlap();
                onOpenLeaderboard();
              }}
              className="py-2.5 rounded-xl font-cartoon text-sm text-white text-stroke-sm btn-3d-blue flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              SCORES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
