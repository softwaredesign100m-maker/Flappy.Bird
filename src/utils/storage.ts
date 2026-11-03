import { LeaderboardEntry, GameSettings, BirdSkin } from '../types/game';

const LEADERBOARD_KEY = 'fb2_leaderboard';
const SETTINGS_KEY = 'fb2_settings';
const HIGH_SCORE_KEY = 'fb2_best_score';
const COINS_KEY = 'fb2_coins';
const OWNED_SKINS_KEY = 'fb2_owned_skins';
const SELECTED_SKIN_KEY = 'fb2_selected_skin';

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'SkyAce', score: 48, level: 3, date: '2026-10-28' },
  { id: '2', name: 'ChirpMaster', score: 34, level: 3, date: '2026-10-29' },
  { id: '3', name: 'PipHop', score: 26, level: 2, date: '2026-10-30' },
  { id: '4', name: 'FeatherKing', score: 18, level: 2, date: '2026-10-31' },
  { id: '5', name: 'FlapNovice', score: 11, level: 1, date: '2026-11-01' },
];

export { ALL_SKINS } from './skins';

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'NORMAL',
  sfxVolume: 0.8,
  musicVolume: 0.8,
  playerName: 'Player 1',
  showHitboxes: false,
  selectedSkinId: 'classic',
};

export function getHighScore(): number {
  try {
    const val = localStorage.getItem(HIGH_SCORE_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): boolean {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      return true; // new high score
    }
    return false;
  } catch {
    return false;
  }
}

export function getTotalCoins(): number {
  try {
    const val = localStorage.getItem(COINS_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  } catch {
    return 0;
  }
}

export function addCoins(amount: number): number {
  const current = getTotalCoins();
  const next = current + Math.max(0, amount);
  try {
    localStorage.setItem(COINS_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('fb2_coins_updated', { detail: { coins: next } }));
  } catch {}
  return next;
}

export function spendCoins(amount: number): boolean {
  const current = getTotalCoins();
  if (current < amount) return false;
  const next = current - amount;
  try {
    localStorage.setItem(COINS_KEY, next.toString());
    window.dispatchEvent(new CustomEvent('fb2_coins_updated', { detail: { coins: next } }));
  } catch {}
  return true;
}

export function getOwnedSkins(): string[] {
  try {
    const data = localStorage.getItem(OWNED_SKINS_KEY);
    if (!data) {
      const initial = ['classic'];
      localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.includes('classic') ? parsed : ['classic', ...parsed];
  } catch {
    return ['classic'];
  }
}

export function unlockSkin(skinId: string, cost: number): boolean {
  const owned = getOwnedSkins();
  if (owned.includes(skinId)) return true;
  if (!spendCoins(cost)) return false;

  owned.push(skinId);
  try {
    localStorage.setItem(OWNED_SKINS_KEY, JSON.stringify(owned));
    window.dispatchEvent(new CustomEvent('fb2_skins_updated', { detail: { owned } }));
  } catch {}
  return true;
}

export function getSelectedSkin(): string {
  try {
    const id = localStorage.getItem(SELECTED_SKIN_KEY);
    if (id && getOwnedSkins().includes(id)) return id;
  } catch {}
  return 'classic';
}

export function setSelectedSkin(skinId: string) {
  try {
    localStorage.setItem(SELECTED_SKIN_KEY, skinId);
    window.dispatchEvent(new CustomEvent('fb2_skin_selected', { detail: { skinId } }));
  } catch {}
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

export function recordScore(name: string, score: number, level: number): LeaderboardEntry[] {
  const list = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    id: Date.now().toString(),
    name: name.trim() || 'Flapper',
    score,
    level,
    date: new Date().toISOString().split('T')[0],
  };

  list.push(newEntry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 10);

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch {}

  saveHighScore(score);
  return trimmed;
}

export function getSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        selectedSkinId: getSelectedSkin(),
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.selectedSkinId) {
      setSelectedSkin(settings.selectedSkinId);
    }
  } catch {}
}
