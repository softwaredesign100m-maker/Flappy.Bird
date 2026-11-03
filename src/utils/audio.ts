/**
 * Web Audio API synthesizer for Flappy Bird 2
 * Provides realistic procedural bird chirps, flap whooshes, coin pings,
 * crash impacts, fanfare, and rhythmic background arcade melody.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public volume: number = 0.8;
  private musicInterval: number | null = null;
  private birdChirpInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private step: number = 0;

  constructor() {
    // AudioContext will be created upon first user interaction
    const savedSfx = localStorage.getItem('fb2_sfx');
    const savedMusic = localStorage.getItem('fb2_music');
    const savedVol = localStorage.getItem('fb2_vol');
    if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
    if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
    if (savedVol !== null) this.volume = parseFloat(savedVol);
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public ensureAudioReady() {
    this.initCtx();
    if (this.musicEnabled && !this.isMusicPlaying) {
      this.startBackgroundAudio();
    }
  }

  /**
   * Procedural realistic bird chirp sound
   * Frequency sweeps mimicking high-pitched songbirds (e.g. sparrows / canaries)
   */
  public playBirdChirp(intensity: number = 1.0) {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch sweep
      const baseFreq = 2400 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.14);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15 * this.volume * intensity, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);

      // Sometimes add a double chirp
      if (Math.random() > 0.4) {
        setTimeout(() => {
          if (!this.ctx || !this.sfxEnabled) return;
          const t2 = this.ctx.currentTime;
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          const f2 = baseFreq * 1.1;
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(f2, t2);
          osc2.frequency.exponentialRampToValueAtTime(f2 * 1.4, t2 + 0.05);
          osc2.frequency.exponentialRampToValueAtTime(f2 * 0.85, t2 + 0.12);

          gain2.gain.setValueAtTime(0, t2);
          gain2.gain.linearRampToValueAtTime(0.12 * this.volume * intensity, t2 + 0.02);
          gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.13);

          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);

          osc2.start(t2);
          osc2.stop(t2 + 0.14);
        }, 110);
      }
    } catch {
      // AudioContext error safeguard
    }
  }

  /**
   * Wing flap sound: soft wind gust + subtle feather flutter
   */
  public playFlap() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // White noise buffer for wind flutter
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.09);

      // Subtle tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.05);

      oscGain.gain.setValueAtTime(0.12 * this.volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  /**
   * Score chime: crystal clear bell ring
   */
  public playScore() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.setValueAtTime(2637.02, now + 0.08); // E7

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    } catch {}
  }

  /**
   * Coin / Star collectible sound
   */
  public playCoin() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.14 * this.volume, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.13);
      });
    } catch {}
  }

  /**
   * Crash / Collision impact
   */
  public playHit() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /**
   * Level up fanfare
   */
  public playLevelUp() {
    if (!this.sfxEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.18 * this.volume, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.42);
      });
    } catch {}
  }

  /**
   * Start recurring background melody + periodic bird song chirps
   */
  public startBackgroundAudio() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Periodic cheerful natural bird chirping every 3-6 seconds
    if (!this.birdChirpInterval) {
      this.birdChirpInterval = window.setInterval(() => {
        if (this.sfxEnabled) {
          this.playBirdChirp(0.7 + Math.random() * 0.5);
        }
      }, 3500);
    }

    // Melodic arcade notes (charming tropical / marimba style)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C major pentatonic
    const pattern = [0, 2, 4, 2, 5, 4, 2, 0, 1, 3, 4, 3, 2, 1, 0, 4];

    if (!this.musicInterval) {
      this.musicInterval = window.setInterval(() => {
        if (!this.musicEnabled) return;
        const ctx = this.initCtx();
        if (!ctx) return;

        try {
          const now = ctx.currentTime;
          const noteIndex = pattern[this.step % pattern.length];
          const freq = scale[noteIndex];
          this.step++;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.035 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.24);
        } catch {}
      }, 240);
    }
  }

  public stopBackgroundAudio() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.birdChirpInterval) {
      clearInterval(this.birdChirpInterval);
      this.birdChirpInterval = null;
    }
  }

  public toggleMusic(enabled?: boolean) {
    this.musicEnabled = enabled !== undefined ? enabled : !this.musicEnabled;
    localStorage.setItem('fb2_music', String(this.musicEnabled));
    if (this.musicEnabled) {
      this.startBackgroundAudio();
    }
    return this.musicEnabled;
  }

  public toggleSfx(enabled?: boolean) {
    this.sfxEnabled = enabled !== undefined ? enabled : !this.sfxEnabled;
    localStorage.setItem('fb2_sfx', String(this.sfxEnabled));
    return this.sfxEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('fb2_vol', String(this.volume));
  }
}

export const soundManager = new SoundManager();
