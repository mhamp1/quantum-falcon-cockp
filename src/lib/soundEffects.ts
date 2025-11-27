let audioContext: AudioContext | null = null;
let isMuted = false;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const createOscillator = (frequency: number, type: OscillatorType = 'sine') => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  return oscillator;
};

const createGain = (initialValue: number = 0) => {
  const ctx = getAudioContext();
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(initialValue, ctx.currentTime);
  return gainNode;
};

export const soundEffects = {
  playClick: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(800, 'sine');
    const gainNode = createGain(0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  },

  playTabSwitch: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(600, 'sine');
    const gainNode = createGain(0.06);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  },

  playSuccess: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    const osc1 = createOscillator(523.25, 'sine');
    const osc2 = createOscillator(659.25, 'sine');
    const gainNode = createGain(0.05);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.05);
    osc1.stop(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.2);
  },

  playError: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(200, 'sawtooth');
    const gainNode = createGain(0.04);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.12);
  },

  playNotification: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(1000, 'sine');
    const gainNode = createGain(0.04);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  },

  playHover: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(1200, 'sine');
    const gainNode = createGain(0.02);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
  },

  playSliderChange: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(700, 'sine');
    const gainNode = createGain(0.015);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.02);
  },

  playToggle: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(880, 'sine');
    const gainNode = createGain(0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.06);
  },

  playTrade: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(440, 'triangle');
    const gainNode = createGain(0.06);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  },

  playDataRefresh: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(1500, 'sine');
    const gainNode = createGain(0.03);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.04);
  },

  // Big profit celebration sound (for profits > $1000)
  playBigProfit: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    
    // Triumphant chord progression
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const gainNode = createGain(0.06);
    gainNode.connect(ctx.destination);
    
    notes.forEach((freq, i) => {
      const osc = createOscillator(freq, 'sine');
      osc.connect(gainNode);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + 0.5);
    });
    
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  },

  // Snipe execution sound
  playSnipe: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const oscillator = createOscillator(2000, 'sine');
    const gainNode = createGain(0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  },

  // Streak milestone sound
  playStreak: () => {
    if (isMuted) return;
    
    const ctx = getAudioContext();
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5 (A major)
    const gainNode = createGain(0.04);
    gainNode.connect(ctx.destination);
    
    notes.forEach((freq, i) => {
      const osc = createOscillator(freq, 'triangle');
      osc.connect(gainNode);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + 0.2);
    });
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  },

  setMuted: (muted: boolean) => {
    isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound-effects-muted', muted.toString());
    }
  },

  isMuted: () => isMuted,

  init: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sound-effects-muted');
      isMuted = stored === 'true';
    }
  },
};

if (typeof window !== 'undefined') {
  soundEffects.init();
}
