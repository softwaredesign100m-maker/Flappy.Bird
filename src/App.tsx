import React, { useState, useEffect } from 'react';
import { GameState, LeaderboardEntry, GameSettings } from './types/game';
import { HomeMenu } from './components/HomeMenu';
import { GameCanvas } from './components/GameCanvas';
import {
  LeaderboardModal,
  SettingsModal,
  ShareModal,
  GameOverModal,
} from './components/Modals';
import { GarageModal } from './components/GarageModal';
import {
  getHighScore,
  saveHighScore,
  getLeaderboard,
  recordScore,
  getSettings,
  saveSettings,
  getTotalCoins,
  setSelectedSkin,
} from './utils/storage';
import { soundManager } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [highScore, setHighScore] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [lastScore, setLastScore] = useState<number>(0);
  const [lastLevel, setLastLevel] = useState<number>(1);
  const [lastCoinsEarned, setLastCoinsEarned] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Modals state
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [showGarage, setShowGarage] = useState<boolean>(false);

  // Settings & Leaderboard
  const [settings, setGameSettings] = useState<GameSettings>(getSettings());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Initialize data on mount
  useEffect(() => {
    setHighScore(getHighScore());
    setTotalCoins(getTotalCoins());
    setLeaderboard(getLeaderboard());

    const handleCoinsEvent = (e: Event) => {
      const custom = e as CustomEvent<{ coins: number }>;
      if (custom.detail?.coins !== undefined) {
        setTotalCoins(custom.detail.coins);
      } else {
        setTotalCoins(getTotalCoins());
      }
    };

    const handleSkinEvent = (e: Event) => {
      const custom = e as CustomEvent<{ skinId: string }>;
      if (custom.detail?.skinId) {
        setGameSettings((prev) => ({ ...prev, selectedSkinId: custom.detail.skinId }));
      }
    };

    window.addEventListener('fb2_coins_updated', handleCoinsEvent);
    window.addEventListener('fb2_skin_selected', handleSkinEvent);

    return () => {
      window.removeEventListener('fb2_coins_updated', handleCoinsEvent);
      window.removeEventListener('fb2_skin_selected', handleSkinEvent);
      soundManager.stopBackgroundAudio();
    };
  }, []);

  // Update Settings handler
  const handleUpdateSettings = (updated: Partial<GameSettings>) => {
    const next = { ...settings, ...updated };
    setGameSettings(next);
    saveSettings(next);
  };

  // Change active skin from Garage
  const handleSkinChanged = (skinId: string) => {
    setSelectedSkin(skinId);
    handleUpdateSettings({ selectedSkinId: skinId });
    setTotalCoins(getTotalCoins());
  };

  // Start game handler
  const handleStartGame = () => {
    setGameState('PLAYING');
  };

  // Game over handler with coins earned
  const handleGameOver = (score: number, levelReached: number, coinsEarned: number) => {
    setLastScore(score);
    setLastLevel(levelReached);
    setLastCoinsEarned(coinsEarned);

    // Coins are banked in real-time, refresh total
    setTotalCoins(getTotalCoins());

    const isNew = saveHighScore(score);
    setIsNewHigh(isNew);
    if (isNew) {
      setHighScore(score);
    }

    // Save to leaderboard
    const updatedLeaderboard = recordScore(settings.playerName, score, levelReached);
    setLeaderboard(updatedLeaderboard);

    // Transition to game over view
    setGameState('GAMEOVER');
  };

  // Reset leaderboard
  const handleClearLeaderboard = () => {
    localStorage.removeItem('fb2_leaderboard');
    localStorage.removeItem('fb2_best_score');
    setHighScore(0);
    setLeaderboard(getLeaderboard());
  };

  return (
    <div className="relative w-screen h-screen min-h-[540px] flex items-center justify-center bg-slate-900 overflow-hidden font-game select-none">
      {/* Background Ambience Layer for Desktop Viewports */}
      <div className="absolute inset-0 pointer-events-none opacity-40 blur-3xl bg-gradient-to-tr from-sky-600 via-emerald-600 to-amber-500" />

      {/* Main Game Frame (Mobile-sized Arcade Container) */}
      <div className="relative w-full h-full max-w-[440px] max-h-[780px] bg-sky-300 md:rounded-[36px] overflow-hidden md:border-4 md:border-sky-500 md:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
        {/* Game Views */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col">
          {/* VIEW: Home Menu */}
          {gameState === 'MENU' && (
            <HomeMenu
              onPlay={handleStartGame}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenShare={() => setShowShare(true)}
              onOpenGarage={() => setShowGarage(true)}
              bestScore={highScore}
              coins={totalCoins}
              selectedSkinId={settings.selectedSkinId || 'classic'}
            />
          )}

          {/* VIEW: Active Game Canvas */}
          {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
            <GameCanvas
              gameState={gameState}
              settings={settings}
              onGameOver={handleGameOver}
              onExitToMenu={() => setGameState('MENU')}
            />
          )}
        </div>

        {/* OVERLAY: Game Over Modal */}
        {gameState === 'GAMEOVER' && (
          <GameOverModal
            score={lastScore}
            bestScore={highScore}
            level={lastLevel}
            isNewHigh={isNewHigh}
            coinsEarned={lastCoinsEarned}
            totalCoins={totalCoins}
            onPlayAgain={() => setGameState('PLAYING')}
            onHome={() => setGameState('MENU')}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenGarage={() => setShowGarage(true)}
          />
        )}

        {/* MODAL: Flappy Garage (Shop) */}
        <GarageModal
          isOpen={showGarage}
          onClose={() => {
            setShowGarage(false);
            setTotalCoins(getTotalCoins());
          }}
          onSkinChanged={handleSkinChanged}
        />

        {/* MODAL: Leaderboard */}
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          entries={leaderboard}
          onClear={handleClearLeaderboard}
        />

        {/* MODAL: Settings */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onUpdate={handleUpdateSettings}
        />

        {/* MODAL: Share */}
        <ShareModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          bestScore={highScore}
        />
      </div>
    </div>
  );
}
