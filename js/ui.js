// ============================================================
//  UI — HUD, overlays, toasts, intro de chefe, câmera
// ============================================================

const UI = {
  els: {},

  init() {
    const id = (s) => document.getElementById(s);
    this.els = {
      ui: id('ui'),
      weaponLevel: id('weaponLevel'),
      hpFill: id('hp-fill'),
      hpText: id('hpText'),
      stageLabel: id('stageLabel'),
      bossName: id('bossName'),
      bossHp: id('bossHp'),
      bossBox: id('ui').querySelector('.boss-box'),
      furyAlert: id('furyAlert'),
      toast: id('toast'),
      bossIntro: id('bossIntro'),
      bossIntroText: id('bossIntroText'),
      startScreen: id('startScreen'),
      pauseScreen: id('pauseScreen'),
      victoryScreen: id('victoryScreen'),
      victoryGif: id('victoryGif'),
      victoryTime: id('victoryTime'),
      playerImg: id('playerImg'),
    };
  },

  // ----- HUD -----
  updateHUD(player, stageIdx, boss) {
    this.els.hpFill.style.width = Math.max(0, player.hp) + '%';
    this.els.hpText.innerText = Math.max(0, Math.ceil(player.hp));
    this.els.weaponLevel.innerText = player.fury > 0
      ? 'OVERDRIVE'
      : 'NÍVEL ' + player.weaponLevel;
    this.els.weaponLevel.style.color = player.fury > 0 ? 'var(--fury-color)' : 'var(--neon-blue)';
    this.els.stageLabel.innerText = stageIdx + 1 + '/3';

    if (boss) {
      this.els.bossBox.style.display = 'block';
      this.els.bossName.innerText = boss.name;
      this.els.bossHp.innerText = Math.max(0, Math.floor((boss.hp / boss.maxHp) * 100));
    } else {
      this.els.bossBox.style.display = 'none';
    }
  },

  showFury(on) {
    this.els.furyAlert.style.display = on ? 'block' : 'none';
  },

  toast(msg, color = '#ffcc00', dur = 1.4) {
    const el = this.els.toast;
    el.innerText = msg;
    el.style.color = color;
    el.style.textShadow = '0 0 18px ' + color;
    el.style.opacity = 1;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => { el.style.opacity = 0; }, dur * 1000);
  },

  bossIntro(name) {
    this.els.bossIntroText.innerText = name;
    const el = this.els.bossIntro;
    el.classList.remove('show');
    void el.offsetWidth; // reinicia a animação
    el.classList.add('show');
  },

  // ----- telas -----
  showStart() {
    this.els.startScreen.style.display = 'block';
    this.els.pauseScreen.style.display = 'none';
    this.els.victoryScreen.style.display = 'none';
    this.els.bossBox.style.display = 'none';
  },
  hideStart() {
    this.els.startScreen.style.display = 'none';
  },
  showPause() {
    this.els.pauseScreen.style.display = 'block';
  },
  hidePause() {
    this.els.pauseScreen.style.display = 'none';
  },
  showVictory(timeStr) {
    this.els.ui.style.display = 'none';
    this.els.victoryTime.innerText = '⏱ TEMPO: ' + timeStr;
    this.els.victoryScreen.style.display = 'block';
    // o gif já está no src (assets/marcos1.gif); força reload p/ reiniciar animação
    const gif = this.els.victoryGif;
    gif.src = '';
    gif.src = 'assets/marcos1.gif?t=' + Date.now();
  },
  hideVictory() {
    this.els.victoryScreen.style.display = 'none';
    this.els.ui.style.display = 'flex';
  },
};

// ============================================================
//  CAMERA — shake de tela
// ============================================================

const Camera = {
  shakeAmount: 0,

  shake(n) { this.shakeAmount = Math.max(this.shakeAmount, n); },

  apply(ctx) {
    if (this.shakeAmount > 0.5) {
      const s = this.shakeAmount;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
      this.shakeAmount *= 0.88;
    }
  },
};
