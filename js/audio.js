// ============================================================
//  AUDIO — efeitos sonoros 8-bit gerados proceduralmente
// ============================================================

const AudioSys = (() => {
  let ctx = null;
  let masterGain = null;
  let muted = CONFIG.SOUND.defaultMuted;
  let noiseBuf = null;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
      // buffer de ruído branco (para explosões)
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  }

  function resume() { init(); }

  function setMuted(m) { muted = m; }

  function tone(freq, type = 'square', dur = 0.12, vol = 0.12, slideTo = null, delay = 0) {
    if (!ctx || muted) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(dur = 0.25, vol = 0.2, delay = 0) {
    if (!ctx || muted || !noiseBuf) return;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 2400;
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  // ---- sons do jogo ----
  const sfx = {
    shoot(lvl, fury) {
      if (fury) { tone(520, 'square', 0.07, 0.07, 760); return; }
      tone(300 + lvl * 60, 'square', 0.06, 0.06, 420 + lvl * 60);
    },
    enemyShoot() { tone(140, 'sawtooth', 0.09, 0.035, 90); },
    hit() { tone(90, 'sawtooth', 0.06, 0.05, 50); },
    explosion() { noise(0.3, 0.25); tone(80, 'sawtooth', 0.25, 0.12, 30); },
    playerHurt() { tone(60, 'square', 0.18, 0.16, 40); },
    playerDie() { tone(400, 'sawtooth', 0.7, 0.2, 40); noise(0.6, 0.3); },
    powerup() { tone(660, 'sine', 0.09, 0.12); tone(880, 'sine', 0.09, 0.12, null, 0.09); tone(1320, 'sine', 0.14, 0.12, null, 0.18); },
    heal() { tone(520, 'sine', 0.1, 0.12); tone(780, 'sine', 0.16, 0.12, null, 0.1); },
    fury() { tone(300, 'sawtooth', 0.5, 0.16, 1200); noise(0.4, 0.15); },
    bossIntro() { tone(110, 'sawtooth', 0.5, 0.14, 55); tone(110, 'sawtooth', 0.5, 0.14, 55, 0.25); },
    bossDie() { tone(200, 'sawtooth', 1.0, 0.2, 30); noise(0.9, 0.35); },
    victory() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 'square', 0.22, 0.14, null, i * 0.16)); },
    stageClear() { tone(392, 'square', 0.12, 0.12); tone(523, 'square', 0.12, 0.12, null, 0.12); tone(659, 'square', 0.2, 0.12, null, 0.24); },
    gameOver() { tone(330, 'sawtooth', 0.3, 0.16, 165); tone(247, 'sawtooth', 0.3, 0.16, 120, 0.3); tone(165, 'sawtooth', 0.7, 0.18, 60, 0.6); },
  };

  return { init, resume, setMuted, get muted() { return muted; }, sfx };
})();
