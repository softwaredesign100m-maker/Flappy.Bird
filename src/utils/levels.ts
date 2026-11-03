import { LevelConfig } from '../types/game';

export const GAME_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: 'Green Meadows',
    minScore: 0,
    pipeSpeed: 2.4,
    pipeInterval: 260,
    gapSize: 145,
    skyGradient: ['#38bdf8', '#7dd3fc'],
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    hasMovingPipes: false,
    hasWindHazards: false,
    description: 'Calm morning breeze. Dodge standard pipes and collect bonus golden stars!',
  },
  {
    levelNumber: 2,
    name: 'Sunset Skyline',
    minScore: 10,
    pipeSpeed: 2.8,
    pipeInterval: 250,
    gapSize: 138,
    skyGradient: ['#f97316', '#fbbf24'],
    cloudColor: 'rgba(254, 215, 170, 0.85)',
    hasMovingPipes: true,
    hasWindHazards: false,
    description: 'Golden hour in the city! Pipes now slide up and down.',
  },
  {
    levelNumber: 3,
    name: 'Twilight Sky',
    minScore: 25,
    pipeSpeed: 3.3,
    pipeInterval: 240,
    gapSize: 130,
    skyGradient: ['#1e1b4b', '#4338ca'],
    cloudColor: 'rgba(199, 210, 254, 0.4)',
    hasMovingPipes: true,
    hasWindHazards: true,
    description: 'Starry night flight! Watch out for floating wind gusts and oscillating towers.',
  },
  {
    levelNumber: 4,
    name: 'Cyber Storm',
    minScore: 45,
    pipeSpeed: 3.8,
    pipeInterval: 230,
    gapSize: 122,
    skyGradient: ['#312e81', '#831843'],
    cloudColor: 'rgba(244, 114, 182, 0.35)',
    hasMovingPipes: true,
    hasWindHazards: true,
    description: 'High velocity challenge for true Flappy masters!',
  },
];

export function getLevelForScore(score: number): LevelConfig {
  for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
    if (score >= GAME_LEVELS[i].minScore) {
      return GAME_LEVELS[i];
    }
  }
  return GAME_LEVELS[0];
}
