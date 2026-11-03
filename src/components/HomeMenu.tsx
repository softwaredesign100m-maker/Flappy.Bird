import React from 'react';
import { Play, Trophy, Settings, Share2, Volume2, VolumeX, ShoppingBag, Coins, Download } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { ALL_SKINS } from '../utils/storage';

interface HomeMenuProps {
  onPlay: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenGarage: () => void;
  bestScore: number;
  coins: number;
  selectedSkinId: string;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
  onPlay,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenShare,
  onOpenGarage,
  bestScore,
  coins,
  selectedSkinId,
}) => {
  const [soundOn, setSoundOn] = React.useState(soundManager.sfxEnabled || soundManager.musicEnabled);

  const currentSkin = ALL_SKINS.find((s) => s.id === selectedSkinId) || ALL_SKINS[0];

  const toggleAllSound = () => {
    const next = !soundOn;
    soundManager.toggleSfx(next);
    soundManager.toggleMusic(next);
    setSoundOn(next);
    if (next) {
      soundManager.playBirdChirp(1.2);
    }
  };

  const handleStartGame = () => {
    soundManager.ensureAudioReady();
    soundManager.playFlap();
    onPlay();
  };

  return (
    <div className="relative w-full h-full max-w-[480px] mx-auto flex flex-col justify-between overflow-hidden shadow-2xl select-none">
      {/* Scenic Background (Matched to Screenshot + User Cloud Asset) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200" />

        {/* Radiant Sun in top left */}
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-yellow-200/90 blur-xl animate-pulse" />
        <div className="absolute top-4 left-6 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-100 shadow-[0_0_50px_rgba(250,204,21,0.85)]" />

        {/* User's Beautiful Cartoon Cloud in Sky */}
        <div className="absolute top-6 right-2 w-36 h-28 pointer-events-none opacity-90 drop-shadow-md">
          <img
            src="/assets/aistudio/Screenshot_2026-11-01_174012-removebg-preview_b7b9a2e3.png"
            alt="Sky Cloud"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute top-28 -left-6 w-32 h-24 pointer-events-none opacity-80 drop-shadow-md scale-x-[-1]">
          <img
            src="/assets/aistudio/Screenshot_2026-11-01_174012-removebg-preview_b7b9a2e3.png"
            alt="Sky Cloud Left"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Distant City and Waterfall Cliff Backdrop */}
        <div className="absolute bottom-28 inset-x-0 h-48 opacity-90">
          {/* Waterfall cliff on left */}
          <div className="absolute bottom-0 left-0 w-28 h-40 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-tr-3xl shadow-lg">
            {/* Waterfall stream */}
            <div className="absolute top-4 right-4 w-6 h-36 bg-gradient-to-b from-sky-100 via-sky-200 to-cyan-300 rounded-b-md opacity-90 animate-pulse" />
          </div>

          {/* Distant skyline buildings */}
          <div className="absolute bottom-0 right-2 flex items-end gap-1.5 opacity-80">
            <div className="w-8 h-28 bg-gradient-to-t from-sky-700 to-sky-500 rounded-t-sm" />
            <div className="w-10 h-36 bg-gradient-to-t from-sky-800 to-sky-600 rounded-t-sm" />
            <div className="w-7 h-24 bg-gradient-to-t from-sky-700 to-sky-500 rounded-t-sm" />
            <div className="w-9 h-32 bg-gradient-to-t from-sky-800 to-sky-600 rounded-t-sm" />
          </div>

          {/* Blue Lake / River */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-cyan-400 to-sky-500 opacity-90" />
        </div>

        {/* Lush Green Foreground with blooming flowers */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-green-700 via-lime-500 to-emerald-400 rounded-t-[40px] shadow-2xl border-t-4 border-lime-300">
          {/* Decorative Flowers */}
          <div className="absolute top-3 left-6 flex items-center gap-1">
            <div className="w-3.5 h-3.5 bg-white rounded-full border border-pink-400 relative">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full absolute inset-0 m-auto" />
            </div>
            <div className="w-4 h-4 bg-pink-400 rounded-full border border-pink-600 relative">
              <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full absolute inset-0 m-auto" />
            </div>
          </div>
          <div className="absolute top-4 right-8 flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full border border-blue-600 relative">
              <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full absolute inset-0 m-auto" />
            </div>
            <div className="w-3 h-3 bg-white rounded-full border border-yellow-400 relative">
              <div className="w-1 h-1 bg-yellow-400 rounded-full absolute inset-0 m-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Header bar with best score badge, ZIP download, coin wallet & sound toggle */}
      <div className="relative z-10 pt-4 px-4 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/40 shadow">
          <Trophy className="w-4 h-4 text-amber-300" />
          <span className="font-cartoon text-xs text-white tracking-wider">
            BEST: <span className="text-yellow-300">{bestScore}</span>
          </span>
        </div>

        {/* Direct Download ZIP button */}
        <a
          href="/flappy-bird-2.zip"
          download="flappy-bird-2.zip"
          title="Download Project ZIP Source"
          onClick={() => soundManager.playCoin()}
          className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white px-2.5 py-1.5 rounded-2xl border-2 border-emerald-300 shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="font-cartoon text-[11px] tracking-wide">ZIP</span>
        </a>

        {/* Clickable Coin Bank / Garage shortcut */}
        <button
          onClick={() => {
            soundManager.playCoin();
            onOpenGarage();
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1.5 rounded-2xl border-2 border-amber-600 shadow-md cursor-pointer transition-transform active:scale-95 hover:scale-105"
        >
          <Coins className="w-4 h-4 text-amber-950 fill-amber-500" />
          <span className="font-cartoon text-xs text-amber-950 text-stroke-sm">
            {coins} 🪙
          </span>
        </button>

        <button
          onClick={toggleAllSound}
          aria-label="Toggle Sound"
          className="w-9 h-9 rounded-2xl bg-white/85 hover:bg-white text-slate-800 border-2 border-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          {soundOn ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </button>
      </div>

      {/* Title Section: Wooden Board with Angel Wings & Leaf Accents */}
      <div className="relative z-10 flex flex-col items-center mt-1 px-4">
        <div className="relative flex items-center justify-center">
          {/* Left Wing */}
          <div className="w-12 h-14 md:w-16 md:h-18 mr-[-12px] z-10 drop-shadow-lg transform -rotate-12">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white stroke-slate-700 stroke-[4]">
              <path d="M90 60 C80 20, 40 10, 10 30 C30 45, 50 60, 60 75 C70 85, 85 80, 90 60 Z" />
              <path d="M75 55 C60 30, 30 25, 15 35" fill="none" stroke="#94a3b8" strokeWidth="3" />
            </svg>
          </div>

          {/* Wooden Sign Plank */}
          <div className="relative px-7 py-3 bg-gradient-to-b from-[#b45309] via-[#92400e] to-[#78350f] rounded-2xl border-4 border-[#451a03] shadow-[0_8px_0_#451a03,0_12px_20px_rgba(0,0,0,0.5)] text-center">
            {/* Green leaves decorating edges */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-lime-500 rounded-tr-xl rounded-bl-xl border-2 border-green-800 rotate-12 shadow" />
            <div className="absolute -top-2 right-2 w-5 h-5 bg-emerald-500 rounded-tl-xl rounded-br-xl border-2 border-green-900 -rotate-45 shadow" />
            <div className="absolute -bottom-2 -left-1 w-5 h-5 bg-lime-400 rounded-tl-xl rounded-br-xl border-2 border-green-900 rotate-45 shadow" />
            <div className="absolute -bottom-3 -right-2 w-6 h-6 bg-lime-500 rounded-tr-xl rounded-bl-xl border-2 border-green-900 -rotate-12 shadow" />

            {/* "Flappy" letters */}
            <div className="font-cartoon text-5xl md:text-6xl text-yellow-300 text-stroke-lg leading-none tracking-wider drop-shadow-[0_4px_0_#ca8a04]">
              Flappy
            </div>
            {/* "Bird 2" letters */}
            <div className="font-cartoon text-4xl md:text-5xl text-white text-stroke-md leading-tight tracking-wider flex items-center justify-center gap-2 drop-shadow-[0_3px_0_#94a3b8]">
              <span>Bird</span>
              <span className="text-amber-400 text-stroke-lg scale-110 drop-shadow-[0_3px_0_#b45309]">
                2
              </span>
            </div>
          </div>

          {/* Right Wing */}
          <div className="w-12 h-14 md:w-16 md:h-18 ml-[-12px] z-10 drop-shadow-lg transform rotate-12 scale-x-[-1]">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white stroke-slate-700 stroke-[4]">
              <path d="M90 60 C80 20, 40 10, 10 30 C30 45, 50 60, 60 75 C70 85, 85 80, 90 60 Z" />
              <path d="M75 55 C60 30, 30 25, 15 35" fill="none" stroke="#94a3b8" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Center Flying Character Bird with Speed Trails and Active Skin */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
        <div className="relative flex items-center animate-gentle-bob cursor-pointer" onClick={() => soundManager.playBirdChirp(1.2)}>
          {/* Speed dash trails */}
          <div className="absolute -left-20 flex flex-col gap-2.5 opacity-90 pointer-events-none">
            <div className="w-16 h-2 bg-gradient-to-r from-transparent via-white/80 to-white rounded-full shadow-sm" />
            <div className="w-20 h-2.5 bg-gradient-to-r from-transparent via-white/90 to-white rounded-full shadow-sm ml-3" />
            <div className="w-14 h-2 bg-gradient-to-r from-transparent via-white/80 to-white rounded-full shadow-sm ml-1" />
          </div>

          {/* Character Bird Image with active skin glow/filter */}
          <div className="relative w-36 h-28 flex items-center justify-center drop-shadow-[0_12px_14px_rgba(0,0,0,0.35)]">
            <img
              src="/assets/aistudio/Screenshot_2026-11-01_135323-removebg-preview_0282861d.png"
              alt="Flappy Bird Character"
              style={{
                filter: currentSkin.hueShift
                  ? `hue-rotate(${currentSkin.hueShift}deg) drop-shadow(0 4px 10px ${currentSkin.glowColor})`
                  : `drop-shadow(0 4px 10px rgba(0,0,0,0.3))`,
              }}
              className="max-w-full max-h-full object-contain filter hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Garage Skin Name Pill & Shortcut */}
        <button
          onClick={() => {
            soundManager.playFlap();
            onOpenGarage();
          }}
          className="mt-1 flex items-center gap-1.5 text-xs font-cartoon text-amber-900 bg-amber-100/90 hover:bg-amber-200 px-3 py-1 rounded-full border border-amber-400 shadow-sm cursor-pointer transition-transform active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
          <span>Aviator: {currentSkin.name}</span>
          <span className="text-[10px] text-amber-600 underline font-bold">CHANGE</span>
        </button>
      </div>

      {/* Action Controls Section */}
      <div className="relative z-10 px-5 pb-6 space-y-3">
        {/* Large 3D Green PLAY Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-3.5 md:py-4 rounded-3xl font-cartoon text-3xl md:text-4xl text-white text-stroke-md tracking-wider uppercase btn-3d-green transition-transform flex items-center justify-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
          </div>
          <span>PLAY</span>
        </button>

        {/* Garage & Bottom Buttons */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* GARAGE (SHOP) */}
          <button
            onClick={() => {
              soundManager.playCoin();
              onOpenGarage();
            }}
            className="relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl btn-3d-orange border-2 border-amber-600 cursor-pointer group"
          >
            <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] font-cartoon px-1 rounded-full border border-white shadow animate-pulse">
              100+
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-cartoon text-[10px] text-white text-stroke-sm tracking-wide">
              GARAGE
            </span>
          </button>

          {/* LEADERBOARD (Yellow/Orange) */}
          <button
            onClick={() => {
              soundManager.playFlap();
              onOpenLeaderboard();
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl btn-3d-orange border-2 border-amber-600 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-cartoon text-[10px] text-white text-stroke-sm tracking-wide">
              RANKS
            </span>
          </button>

          {/* SETTINGS (Cyan/Blue) */}
          <button
            onClick={() => {
              soundManager.playFlap();
              onOpenSettings();
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl btn-3d-blue border-2 border-sky-600 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-cartoon text-[10px] text-white text-stroke-sm tracking-wide">
              SETTINGS
            </span>
          </button>

          {/* SHARE (Magenta/Pink) */}
          <button
            onClick={() => {
              soundManager.playFlap();
              onOpenShare();
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl btn-3d-purple border-2 border-purple-600 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-cartoon text-[10px] text-white text-stroke-sm tracking-wide">
              SHARE
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
