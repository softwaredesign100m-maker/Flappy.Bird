import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Play, RotateCcw, Coins } from 'lucide-react';
import { GameState, Obstacle, Particle, GameSettings } from '../types/game';
import { GAME_LEVELS, getLevelForScore } from '../utils/levels';
import { soundManager } from '../utils/audio';
import { assetManager, GameAssets } from '../utils/assets';
import { ALL_SKINS, addCoins } from '../utils/storage';

interface GameCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  onGameOver: (score: number, levelReached: number, coinsEarned: number) => void;
  onExitToMenu: () => void;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  settings,
  onGameOver,
  onExitToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);


  // Active state references for 60fps loop
  const stateRef = useRef<{
    score: number;
    coinsEarned: number;
    level: number;
    birdY: number;
    birdVelocity: number;
    birdRotation: number;
    obstacles: Obstacle[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    bgCloudOffset: number;
    bgBuildingOffset: number;
    bgTreeOffset: number;
    groundOffset: number;
    isPaused: boolean;
    gameOverTriggered: boolean;
    countdown: number;
    levelBanner: { text: string; alpha: number } | null;
  }>({
    score: 0,
    coinsEarned: 0,
    level: 1,
    birdY: 280,
    birdVelocity: 0,
    birdRotation: 0,
    obstacles: [],
    particles: [],
    floatingTexts: [],
    bgCloudOffset: 0,
    bgBuildingOffset: 0,
    bgTreeOffset: 0,
    groundOffset: 0,
    isPaused: false,
    gameOverTriggered: false,
    countdown: 3,
    levelBanner: null,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [currentLevelName, setCurrentLevelName] = useState('Green Meadows');
  const [isPausedUI, setIsPausedUI] = useState(false);
  const [assets, setAssets] = useState<GameAssets | null>(null);

  // Active bird skin configuration
  const activeSkin = ALL_SKINS.find((s) => s.id === settings.selectedSkinId) || ALL_SKINS[0];

  // Stable refs to prevent loop destruction on state updates
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const activeSkinRef = useRef(activeSkin);
  activeSkinRef.current = activeSkin;

  const assetsRef = useRef<GameAssets | null>(null);

  // Preload assets
  useEffect(() => {
    let mounted = true;
    assetManager.preload().then(() => {
      if (mounted) {
        const loaded = assetManager.getAssets();
        setAssets(loaded);
        assetsRef.current = loaded;
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Jump / Flap action
  const triggerFlap = useCallback(() => {
    const s = stateRef.current;
    if (s.isPaused || s.gameOverTriggered || s.countdown > 0) return;

    const diff = settingsRef.current.difficulty;
    // Smooth, well-balanced flap impulse so player doesn't shoot out of control
    const flapPower = diff === 'EASY' ? -4.2 : diff === 'HARD' ? -5.0 : -4.6;
    s.birdVelocity = flapPower;
    s.birdRotation = -0.28; // gentle ~16 degrees tilt up

    soundManager.playFlap();

    // Spawn custom colored feather trail particles based on active skin
    const trailCol = activeSkinRef.current.trailColor;
    for (let i = 0; i < 4; i++) {
      s.particles.push({
        x: 80 - 15,
        y: s.birdY + (Math.random() * 12 - 6),
        vx: -(Math.random() * 2.0 + 1.0),
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3.5 + 2.5,
        color: Math.random() > 0.4 ? trailCol : '#ffffff',
        alpha: 0.9,
        life: 0,
        maxLife: 24,
      });
    }
  }, []);

  // Create pipe obstacle
  const createPipe = (x: number, levelNum: number) => {
    const s = stateRef.current;
    const cfg = GAME_LEVELS[levelNum - 1] || GAME_LEVELS[0];
    const canvasH = 640;
    const groundH = 90;
    const playableH = canvasH - groundH;

    const gap = cfg.gapSize;
    const minTop = 60;
    const maxTop = playableH - gap - 60;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    const bottomY = topHeight + gap;

    // Moving pipe chance in higher levels
    const isMoving = cfg.hasMovingPipes && Math.random() > 0.35;
    const obstacle: Obstacle = {
      id: Date.now() + Math.random(),
      x,
      width: 58,
      topHeight,
      bottomY,
      gap,
      passed: false,
      type: isMoving ? 'moving-pipe' : 'standard-pipe',
      moveDirection: Math.random() > 0.5 ? 1 : -1,
      baseTopHeight: topHeight,
      moveRange: 35,
      moveSpeed: 0.8 + Math.random() * 0.4,
      coinCollected: false,
      coinY: topHeight + gap / 2,
    };

    s.obstacles.push(obstacle);
  };

  // Restart / Reset game state
  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0;
    s.coinsEarned = 0;
    s.level = 1;
    s.birdY = 280;
    s.birdVelocity = 0;
    s.birdRotation = 0;
    s.obstacles = [];
    s.particles = [];
    s.floatingTexts = [];
    s.bgCloudOffset = 0;
    s.bgBuildingOffset = 0;
    s.bgTreeOffset = 0;
    s.groundOffset = 0;
    s.isPaused = false;
    s.gameOverTriggered = false;
    s.countdown = 3;
    s.levelBanner = { text: 'LEVEL 1: GREEN MEADOWS', alpha: 1.0 };

    setDisplayScore(0);
    setDisplayCoins(0);
    setCurrentLevelName('Green Meadows');
    setIsPausedUI(false);

    // Initial pipes with generous spacing
    for (let i = 0; i < 3; i++) {
      const startX = 420 + i * 260;
      createPipe(startX, 1);
    }
  }, []);

  // Main 60fps render loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    resetGame();
    let animId: number;
    let countdownTimer = window.setInterval(() => {
      const s = stateRef.current;
      if (s.countdown > 1) {
        s.countdown--;
        soundManager.playBirdChirp(0.8);
      } else if (s.countdown === 1) {
        s.countdown = 0;
        soundManager.playBirdChirp(1.2);
        clearInterval(countdownTimer);
      }
    }, 850);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const groundH = 90;

      // Update if not paused and not counting down
      if (!s.isPaused && !s.gameOverTriggered) {
        if (s.countdown === 0) {
          const curDiff = settingsRef.current.difficulty;
          const gravity = curDiff === 'EASY' ? 0.17 : curDiff === 'HARD' ? 0.25 : 0.21;
          const maxFallSpeed = curDiff === 'EASY' ? 3.6 : curDiff === 'HARD' ? 4.6 : 4.0;

          s.birdVelocity = Math.min(s.birdVelocity + gravity, maxFallSpeed);
          s.birdY += s.birdVelocity;

          // Smooth gentle rotation physics
          if (s.birdVelocity > 0) {
            // Gradual smooth tilt down, capped at gentle ~32 degrees
            s.birdRotation = Math.min(s.birdRotation + 0.022, 0.55);
          } else {
            // Smooth recovery tilt up
            s.birdRotation = Math.max(s.birdRotation - 0.035, -0.28);
          }

          // Active level config
          const currentLevelCfg = getLevelForScore(s.score);
          if (currentLevelCfg.levelNumber !== s.level) {
            s.level = currentLevelCfg.levelNumber;
            setCurrentLevelName(currentLevelCfg.name);
            s.levelBanner = {
              text: `LEVEL ${s.level}: ${currentLevelCfg.name.toUpperCase()}`,
              alpha: 1.0,
            };
            soundManager.playLevelUp();
          }

          const pipeSpeed = currentLevelCfg.pipeSpeed;

          // Parallax background updates
          s.bgCloudOffset = (s.bgCloudOffset + pipeSpeed * 0.18) % 600;
          s.bgBuildingOffset = (s.bgBuildingOffset + pipeSpeed * 0.28) % 450;
          s.bgTreeOffset = (s.bgTreeOffset + pipeSpeed * 0.65) % 360;
          s.groundOffset = (s.groundOffset + pipeSpeed) % 24;

          // Obstacles update
          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const obs = s.obstacles[i];
            obs.x -= pipeSpeed;

            // Handle oscillating moving pipes
            if (obs.type === 'moving-pipe' && obs.baseTopHeight && obs.moveRange && obs.moveSpeed) {
              const osc = Math.sin(time * 0.003 * obs.moveSpeed) * obs.moveRange;
              obs.topHeight = Math.max(50, Math.min(H - groundH - obs.gap - 50, obs.baseTopHeight + osc));
              obs.bottomY = obs.topHeight + obs.gap;
              if (obs.coinY !== undefined) {
                obs.coinY = obs.topHeight + obs.gap / 2;
              }
            }

            // Check Score and Coin passing (Infinite pillars reward +1 coin each!)
            const birdX = 85;
            if (!obs.passed && obs.x + obs.width < birdX) {
              obs.passed = true;
              s.score += 1;
              s.coinsEarned += 1;
              addCoins(1); // Real-time wallet bank update!
              setDisplayScore(s.score);
              setDisplayCoins(s.coinsEarned);
              soundManager.playScore();

              // Spawn floating score text
              s.floatingTexts.push({
                id: Date.now() + Math.random(),
                text: '+1 🪙',
                x: birdX + 25,
                y: s.birdY - 10,
                alpha: 1.0,
                color: '#ffffff',
              });
            }

            // Check Coin collection (+2 bonus coins & score!)
            if (!obs.coinCollected && obs.coinY !== undefined) {
              const coinX = obs.x + obs.width / 2;
              const coinDist = Math.hypot(birdX - coinX, s.birdY - obs.coinY);
              if (coinDist < 26) {
                obs.coinCollected = true;
                s.score += 2;
                s.coinsEarned += 2;
                addCoins(2); // Real-time wallet bank update!
                setDisplayScore(s.score);
                setDisplayCoins(s.coinsEarned);
                soundManager.playCoin();

                // Bonus text
                s.floatingTexts.push({
                  id: Date.now() + Math.random(),
                  text: '+2 BONUS 🪙',
                  x: coinX,
                  y: obs.coinY - 15,
                  alpha: 1.0,
                  color: '#fbbf24',
                });

                // Golden sparkles
                for (let k = 0; k < 12; k++) {
                  s.particles.push({
                    x: coinX,
                    y: obs.coinY,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    size: Math.random() * 4 + 2,
                    color: Math.random() > 0.3 ? '#fde047' : '#ffffff',
                    alpha: 1.0,
                    life: 0,
                    maxLife: 30,
                  });
                }
              }
            }

            // Collision Detection with Pipe (forgiving, fair hitbox)
            const birdRadius = 11;
            const inPipeX = birdX + birdRadius - 4 > obs.x && birdX - birdRadius + 4 < obs.x + obs.width;
            if (inPipeX) {
              if (s.birdY - birdRadius < obs.topHeight || s.birdY + birdRadius > obs.bottomY) {
                triggerGameOver();
                break;
              }
            }

            // Remove out-of-screen pipes
            if (obs.x < -obs.width - 40) {
              s.obstacles.splice(i, 1);
            }
          }

          // Unlimited Continuous Pillars Generation:
          // Check rightmost pipe position and continuously spawn pipes without interruption
          const rightmostPipeX = s.obstacles.reduce((max, o) => Math.max(max, o.x), 0);
          if (W - rightmostPipeX >= currentLevelCfg.pipeInterval) {
            createPipe(W + 30, s.level);
          }

          // Check Ground & Ceiling Collision
          if (s.birdY + 12 >= H - groundH) {
            s.birdY = H - groundH - 12;
            triggerGameOver();
          }
          if (s.birdY - 12 <= 0) {
            s.birdY = 12;
            s.birdVelocity = 0;
          }
        }

        // Particle updates
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Floating texts update
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= 1.2;
          ft.alpha -= 0.025;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Level banner fade
        if (s.levelBanner) {
          s.levelBanner.alpha -= 0.012;
          if (s.levelBanner.alpha <= 0) {
            s.levelBanner = null;
          }
        }
      }

      // -------------------------------------------------------------
      // RENDERING PIPELINE
      // -------------------------------------------------------------
      const activeCfg = getLevelForScore(s.score);

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H - groundH);
      skyGrad.addColorStop(0, activeCfg.skyGradient[0]);
      skyGrad.addColorStop(1, activeCfg.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Night Sky Stars for Level 3+
      if (s.level >= 3) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 35; i++) {
          const starX = (i * 37 + (time * 0.005)) % W;
          const starY = (i * 19) % (H - groundH - 120);
          const starAlpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.003 + i));
          ctx.globalAlpha = starAlpha;
          ctx.beginPath();
          ctx.arc(starX, starY, (i % 3) + 1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // Distant Sky Clouds: Use the user's authentic fluffy cloud image!
      const currentAssets = assetsRef.current || assets;
      if (currentAssets?.cloud) {
        ctx.save();
        ctx.globalAlpha = s.level >= 3 ? 0.4 : 0.85;
        const cW = 120;
        const cH = 85;
        const cSpacing = 220;
        const startCloudX = -s.bgCloudOffset;

        for (let cx = startCloudX; cx < W + cSpacing; cx += cSpacing) {
          const cy = 35 + ((Math.abs(Math.sin(cx * 0.01)) * 30));
          ctx.drawImage(currentAssets.cloud, cx, cy, cW, cH);
        }
        ctx.restore();
      }

      // 2. Parallax Layer: Apartment Building (behind trees)
      // Using user asset: /public/assets/aistudio/Screenshot_2026-11-01_140532_fee7ffbc.png
      if (currentAssets?.building) {
        ctx.save();
        ctx.globalAlpha = s.level >= 3 ? 0.45 : 0.75;
        const bW = 135;
        const bH = 210;
        const bY = H - groundH - bH + 15;
        const spacing = 310;
        const startX = -s.bgBuildingOffset;

        for (let bx = startX; bx < W + spacing; bx += spacing) {
          ctx.drawImage(currentAssets.building, bx, bY, bW, bH);
        }
        ctx.restore();
      }

      // 3. Parallax Layer: Roadside Trees (Enlarged size as requested: "size thodha bara kr do")
      // Using user asset: /public/assets/aistudio/Screenshot_2026-11-01_140039_dee9a895.png
      if (currentAssets?.tree) {
        ctx.save();
        ctx.globalAlpha = 0.98;
        // Enlarged from 85x95 to 145x155 for rich visibility
        const tW = 145;
        const tH = 155;
        const tY = H - groundH - tH + 12;
        const tSpacing = 210;
        const startTreeX = -s.bgTreeOffset;

        for (let tx = startTreeX; tx < W + tSpacing; tx += tSpacing) {
          ctx.drawImage(currentAssets.tree, tx, tY, tW, tH);
        }
        ctx.restore();
      }

      // 4. Unlimited Continuous Pipes & Obstacles
      s.obstacles.forEach((obs) => {
        // Draw Top Pipe
        drawPipe(ctx, obs.x, 0, obs.width, obs.topHeight, true, obs.type === 'moving-pipe');

        // Draw Bottom Pipe
        drawPipe(ctx, obs.x, obs.bottomY, obs.width, H - groundH - obs.bottomY, false, obs.type === 'moving-pipe');

        // Draw Bonus Coin Ring inside gap
        if (!obs.coinCollected && obs.coinY !== undefined) {
          drawBonusCoin(ctx, obs.x + obs.width / 2, obs.coinY, time);
        }
      });

      // 5. Feather & Sparkle Particles
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 6. Bird Character with equipped Garage Skin hue/glow
      ctx.save();
      ctx.translate(85, s.birdY);
      ctx.rotate(s.birdRotation);

      if (activeSkinRef.current.hueShift) {
        ctx.filter = `hue-rotate(${activeSkinRef.current.hueShift}deg)`;
      }

      const birdAsset = assetsRef.current?.bird || assets?.bird;
      if (birdAsset) {
        // Draw user's bird sprite centered
        const birdW = 48;
        const birdH = 34;
        ctx.drawImage(birdAsset, -birdW / 2, -birdH / 2, birdW, birdH);
      } else {
        // Fallback vector bird while loading
        drawFallbackBird(ctx);
      }

      ctx.filter = 'none';

      // Hitbox visualizer if enabled in settings
      if (settingsRef.current.showHitboxes) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 7. Ground (Grass + Road Curb + Soil)
      drawGround(ctx, W, H, groundH, s.groundOffset);

      // 8. Floating Score Numbers
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 18px "Lilita One", "Fredoka", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 9. Level Transition Banner
      if (s.levelBanner && s.levelBanner.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = s.levelBanner.alpha;
        ctx.font = 'bold 24px "Lilita One", "Fredoka", sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(s.levelBanner.text, W / 2, 140);
        ctx.fillText(s.levelBanner.text, W / 2, 140);
        ctx.restore();
      }

      // 10. Countdown Overlay (3, 2, 1, FLY!)
      if (s.countdown > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = 'center';
        ctx.font = 'bold 64px "Lilita One", "Fredoka", sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        const countText = s.countdown === 1 ? 'READY!' : s.countdown.toString();
        ctx.strokeText(countText, W / 2, H / 2 - 20);
        ctx.fillText(countText, W / 2, H / 2 - 20);

        ctx.font = 'bold 20px "Fredoka", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeText('TAP OR SPACE TO FLAP', W / 2, H / 2 + 35);
        ctx.fillText('TAP OR SPACE TO FLAP', W / 2, H / 2 + 35);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const triggerGameOver = () => {
      const s = stateRef.current;
      if (s.gameOverTriggered) return;
      s.gameOverTriggered = true;
      soundManager.playHit();
      onGameOverRef.current(s.score, s.level, s.coinsEarned);
    };

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(countdownTimer);
    };
  }, [gameState, resetGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerFlap();
      }
      if (e.code === 'KeyP' || e.key === 'p') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlap]);

  const togglePause = () => {
    const s = stateRef.current;
    if (s.gameOverTriggered || s.countdown > 0) return;
    s.isPaused = !s.isPaused;
    setIsPausedUI(s.isPaused);
    soundManager.playFlap();
  };

  const drawPipe = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isTop: boolean,
    isMoving: boolean
  ) => {
    if (h <= 0) return;
    ctx.save();

    // Pipe base gradient: classic green or moving pipe golden/metallic hue
    const pipeGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    if (isMoving) {
      pipeGrad.addColorStop(0, '#f59e0b');
      pipeGrad.addColorStop(0.3, '#fde047');
      pipeGrad.addColorStop(0.7, '#d97706');
      pipeGrad.addColorStop(1, '#92400e');
    } else {
      pipeGrad.addColorStop(0, '#15803d');
      pipeGrad.addColorStop(0.3, '#4ade80');
      pipeGrad.addColorStop(0.7, '#22c55e');
      pipeGrad.addColorStop(1, '#166534');
    }

    ctx.fillStyle = pipeGrad;
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Pipe Cap / Lip
    const lipH = 24;
    const lipExtend = 5;
    const lipY = isTop ? y + h - lipH : y;
    const lipW = w + lipExtend * 2;
    const lipX = x - lipExtend;

    ctx.fillStyle = pipeGrad;
    ctx.fillRect(lipX, lipY, lipW, lipH);
    ctx.strokeRect(lipX, lipY, lipW, lipH);

    // Moving indicator icon if oscillating
    if (isMoving && lipH > 10) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + w / 2, lipY + lipH / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawBonusCoin = (ctx: CanvasRenderingContext2D, x: number, y: number, time: number) => {
    ctx.save();
    const bob = Math.sin(time * 0.006) * 3;
    ctx.translate(x, y + bob);

    // Rotating coin width effect
    const scaleX = Math.cos(time * 0.005);
    ctx.scale(Math.abs(scaleX) * 0.7 + 0.3, 1);

    // Golden Coin Ring
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner star
    ctx.fillStyle = '#ca8a04';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  };

  const drawGround = (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    groundH: number,
    offset: number
  ) => {
    const y = H - groundH;

    // Grass turf layer
    ctx.fillStyle = '#65a30d'; // Lime green
    ctx.fillRect(0, y, W, 14);

    // Darker green grass border
    ctx.strokeStyle = '#365314';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();

    // Ground dirt body
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, y + 14, W, groundH - 14);

    // Road curb stripe animation
    ctx.fillStyle = '#b45309';
    const stripeW = 14;
    for (let sx = -offset; sx < W + stripeW * 2; sx += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(sx, y + 14);
      ctx.lineTo(sx + stripeW, y + 14);
      ctx.lineTo(sx + stripeW - 6, y + 26);
      ctx.lineTo(sx - 6, y + 26);
      ctx.fill();
    }

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + 14);
    ctx.lineTo(W, y + 14);
    ctx.stroke();
  };

  const drawFallbackBird = (ctx: CanvasRenderingContext2D) => {
    // Body
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(12, -1);
    ctx.lineTo(24, 3);
    ctx.lineTo(12, 8);
    ctx.fill();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full max-w-[480px] mx-auto overflow-hidden shadow-2xl select-none"
      onClick={triggerFlap}
      onTouchStart={(e) => {
        if (e.target instanceof HTMLButtonElement) return;
        triggerFlap();
      }}
    >
      {/* HUD Header with Level, Score, Coins and Pause */}
      <div className="absolute top-4 inset-x-0 z-20 px-4 flex items-center justify-between pointer-events-none">
        {/* Level Tag */}
        <div className="bg-black/45 backdrop-blur-md px-3 py-1 rounded-xl border border-white/30 text-white font-cartoon text-xs flex items-center gap-1.5 shadow">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LVL {stateRef.current.level}</span>
        </div>

        {/* Big Score Counter */}
        <div className="font-cartoon text-5xl text-white text-stroke-md tracking-wider drop-shadow-lg">
          {displayScore}
        </div>

        {/* Coins Claimed Badge & Pause Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 px-2.5 py-1 rounded-xl border border-amber-600 shadow flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-950 fill-amber-500" />
            <span className="font-cartoon text-xs text-amber-950 text-stroke-sm">
              +{displayCoins}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePause();
            }}
            className="w-9 h-9 rounded-xl bg-white/85 hover:bg-white text-slate-800 border-2 border-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            aria-label="Pause Game"
          >
            {isPausedUI ? <Play className="w-4 h-4 fill-slate-800 text-slate-800" /> : <Pause className="w-4 h-4 fill-slate-800 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={420}
        height={640}
        className="w-full h-full object-cover block cursor-pointer"
      />

      {/* Pause Menu Overlay */}
      {isPausedUI && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-xs bg-gradient-to-b from-sky-50 to-blue-100 rounded-3xl p-6 border-4 border-sky-500 shadow-2xl text-center">
            <h3 className="text-3xl font-cartoon text-sky-950 text-stroke-sm mb-4">
              GAME PAUSED
            </h3>

            <div className="space-y-3">
              <button
                onClick={togglePause}
                className="w-full py-3.5 rounded-2xl font-cartoon text-lg text-white text-stroke-sm btn-3d-green tracking-wide uppercase flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                RESUME
              </button>

              <button
                onClick={() => {
                  soundManager.playFlap();
                  resetGame();
                }}
                className="w-full py-3 rounded-2xl font-cartoon text-base text-white text-stroke-sm btn-3d-orange flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                RESTART
              </button>

              <button
                onClick={() => {
                  soundManager.playFlap();
                  onExitToMenu();
                }}
                className="w-full py-2.5 rounded-2xl font-cartoon text-sm text-white text-stroke-sm btn-3d-blue"
              >
                EXIT TO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
