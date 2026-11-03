export type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  date: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation?: number;
  vRot?: number;
}

export type ObstacleType = 'standard-pipe' | 'moving-pipe' | 'wind-turbine' | 'floating-mine';

export interface Obstacle {
  id: number;
  x: number;
  width: number;
  topHeight: number;
  bottomY: number;
  gap: number;
  passed: boolean;
  type: ObstacleType;
  // Moving pipe parameters
  moveDirection?: 1 | -1;
  baseTopHeight?: number;
  moveRange?: number;
  moveSpeed?: number;
  // Bonus coin
  coinCollected?: boolean;
  coinY?: number;
}

export interface LevelConfig {
  levelNumber: number;
  name: string;
  minScore: number;
  pipeSpeed: number;
  pipeInterval: number; // in pixels
  gapSize: number;
  skyGradient: [string, string];
  cloudColor: string;
  hasMovingPipes: boolean;
  hasWindHazards: boolean;
  description: string;
}

export interface BirdSkin {
  id: string;
  name: string;
  category: 'ALL' | 'ELEMENTAL' | 'CYBER' | 'ROYAL' | 'COSMIC' | 'ARCADE';
  cost: number;
  unlocked: boolean;
  hueShift: number; // css hue rotate deg or canvas filter
  trailColor: string;
  glowColor: string;
  description: string;
}

export interface GameSettings {
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  sfxVolume: number;
  musicVolume: number;
  playerName: string;
  showHitboxes: boolean;
  selectedSkinId: string;
}
