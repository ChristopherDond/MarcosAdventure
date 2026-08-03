// ============================================================
//  MAIN — game loop, fases, itens, colisões e estado global
// ============================================================

// referência global para inimigos/chefes mirarem o player
const PlayerRef = { instance: null };

// repositório global de partículas (usado por Player e Main)
const Particles = {
  list: [],
  push(...parts) { this.list.push(...parts); },
  update(dt) {
    for (const p of this.list) p.update(dt);
    this.list = this.list.filter(p => p.life > 0 && !(p.done !== undefined && p.done));
  },
  draw(ctx) {
    for (const p of this.list) p.draw(ctx);
  },
  clear() { this.list.length = 0; },
};

// ============================================================
//  ITENS / POWER-UPS
// ============================================================

class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.type = type; // heal | multishot | fury
    this.r = 13;
    this.bobT = Math.random() * Math.PI * 2;
    this.dead = false;
  }
  update(dt) {
    this.y += CONFIG.ITEMS.fallSpeed * dt;
    this.bobT += dt * CONFIG.ITEMS.bobSpeed;
    if (this.y > CONFIG.CANVAS_H + 30) this.dead = true;
  }
  draw(ctx, t) {
    const bob = Math.sin(this.bobT) * CONFIG.ITEMS.bobAmp;
    const colors = { heal: '#00ff88', multishot: '#ffcc00', fury: '#ff3300' };
    const color = colors[this.type];
    const label = { heal: '+', multishot: 'W', fury: 'F' }[this.type];

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.rotate(Math.sin(this.bobT * 0.7) * 0.15);
    ctx.shadowBlur = 18; ctx.shadowColor = color;
    ctx.fillStyle = color;
    // hexágono
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const px = Math.cos(a) * this.r, py = Math.sin(a) * this.r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }
}

// ============================================================
//  GAME
// ============================================================

const Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let state = 'menu';       // menu | playing | paused | gameover | victory
  let player = null;
  let stageIdx = 0;
  let boss = null;
  let enemies = [];
  let items = [];
  let time = 0;
  let stageTime = 0;
  let elapsedTotal = 0;
  let spawnQueue = [];
  let nextSpawnT = 0;
  let lastFrame = 0;
  let raf = null;

  // ----- util -----
  function rectsOverlapLocal(a, b) {
    return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
  }

  // ----- assets -----
  function loadAssets() {
    const map = {
      playerImg: 'assets/marcos4.png',
      imgQuecedisse: 'assets/quecedisse.png',
      imgQuetristeza: 'assets/quetristeza.png',
      imgBossAbsoluto: 'assets/bossAbsoluto.png',
    };
    for (const [id, src] of Object.entries(map)) {
      const img = document.getElementById(id);
      if (img && img.src !== location.href) img.src = src;
    }
  }

  // ----- ciclo de vida -----
  function startGame() {
    AudioSys.resume();
    UI.hideStart();
    UI.hideVictory();
    UI.showFury(false);

    stageIdx = 0;
    time = 0;
    elapsedTotal = 0;
    Particles.clear();
    Bullets.clear();
    Enemies.clear();
    items = [];

    player = new Player();
    PlayerRef.instance = player;

    startStage(0);
    state = 'playing';
    if (!raf) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(loop);
    }
  }

  function startStage(idx) {
    stageIdx = idx;
    stageTime = 0;
    const cfg = CONFIG.STAGES[idx];

    // limpa entidades
    Enemies.clear();
    Bullets.clear();
    items = [];

    // monta a fila de spawn
    spawnQueue = [];
    for (const wave of cfg.enemies) {
      for (let i = 0; i < wave.count; i++) {
        spawnQueue.push({
          cls: wave.cls,
          t: wave.delay + i * 1.1 + Math.random() * 0.5,
          hp: wave.hp,
          fireCd: wave.fireCd,
          speed: wave.speed,
          color: wave.color,
        });
      }
    }
    nextSpawnT = 0;

    // cria o chefe
    const BossClass = { Boss1, Boss2, Boss3 }[cfg.bossClass];
    const stageFull = { ...cfg, imgId: { Boss1: 'imgQuecedisse', Boss2: 'imgQuetristeza', Boss3: 'imgBossAbsoluto' }[cfg.bossClass] };
    boss = new BossClass(stageFull);
    UI.bossIntro(cfg.name);
    AudioSys.sfx.bossIntro();

    UI.els.stageLabel.innerText = (idx + 1) + '/3';
  }

  function spawnEnemy(spec) {
    const x = 40 + Math.random() * (CONFIG.CANVAS_W - 80);
    const y = -50;
    const Cls = { BasicEnemy: Enemy, WeaverEnemy, TankEnemy, ZigzagEnemy }[spec.cls] || Enemy;
    const e = new Cls(x, y, {
      hp: spec.hp, fireCd: spec.fireCd, speed: spec.speed, color: spec.color,
    });
    Enemies.list.push(e);
  }

  function dropItem(x, y) {
    if (Math.random() > CONFIG.ITEMS.dropChance) return;
    const r = Math.random();
    let type;
    if (r < CONFIG.ITEMS.healChance) type = 'heal';
    else if (r < CONFIG.ITEMS.healChance + CONFIG.ITEMS.multishotChance) type = 'multishot';
    else type = 'fury';
    items.push(new PowerUp(x, y, type));
  }

  // ----- colisões -----
  function handleCollisions(dt) {
    const pRect = { x: player.x + 8, y: player.y + 8, w: player.w - 16, h: player.h - 16 };

    // tiros do jogador
    for (const b of Bullets.list) {
      if (b.owner !== 'player' || b.dead) continue;
      const bRect = { x: b.x - 3, y: b.y - 3, w: 6, h: 6 };

      // vs inimigos
      for (const e of Enemies.list) {
        if (e.dead) continue;
        if (rectsOverlapLocal(bRect, { x: e.x, y: e.y, w: e.w, h: e.h })) {
          e.takeDamage(b.damage);
          b.dead = true;
          AudioSys.sfx.hit();
          Particles.push(new Particle(b.x, b.y, { color: e.color, size: 3, speed: 80, life: 0.25 }));
          break;
        }
      }
      if (b.dead) continue;

      // vs chefe
      if (boss && !boss.dead) {
        const hit = boss.collidesWith
          ? boss.collidesWith(bRect)
          : rectsOverlapLocal(bRect, { x: boss.x, y: boss.y, w: boss.w, h: boss.h });
        if (hit) {
          boss.takeDamage(b.damage);
          b.dead = true;
          AudioSys.sfx.hit();
          Particles.push(new Particle(b.x, b.y, { color: boss.color, size: 4, speed: 100, life: 0.3 }));
        }
      }
    }

    // tiros inimigos vs jogador
    for (const b of Bullets.list) {
      if (b.owner === 'player' || b.dead) continue;
      const bRect = { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 };
      if (rectsOverlapLocal(bRect, pRect)) {
        player.takeDamage(CONFIG.BULLET.enemyDamage);
        b.dead = true;
      }
    }

    // inimigos vs jogador (colisão física)
    for (const e of Enemies.list) {
      if (e.dead) continue;
      if (rectsOverlapLocal(pRect, { x: e.x, y: e.y, w: e.w, h: e.h })) {
        e.dead = true;
        player.takeDamage(10);
        Particles.push(...spawnExplosion(e.centerX, e.centerY, e.color, 14, 200, 3));
      }
    }

    // chefe vs jogador (apenas quando ativo e com intervalo de contato)
    if (boss && !boss.dead && boss.state === 'active') {
      boss.contactT = (boss.contactT || 0) - dt;
      const hit = boss.collidesWith
        ? boss.collidesWith(pRect)
        : rectsOverlapLocal(pRect, { x: boss.x, y: boss.y, w: boss.w, h: boss.h });
      if (hit && boss.contactT <= 0) {
        player.takeDamage(CONFIG.BULLET.bossContact);
        boss.contactT = CONFIG.BULLET.bossContactInterval;
      }
    }

    // power-ups
    for (const it of items) {
      if (it.dead) continue;
      const dist = Math.hypot((it.x) - (player.x + player.w / 2), (it.y) - (player.y + player.h / 2));
      if (dist < it.r + 30) {
        it.dead = true;
        if (it.type === 'heal') {
          player.heal(CONFIG.POWERUP.healAmount);
          UI.toast('+30 HP', '#00ff88');
          AudioSys.sfx.heal();
        } else if (it.type === 'multishot') {
          player.powerUp();
        } else if (it.type === 'fury') {
          player.activateFury();
        }
        Particles.push(...spawnExplosion(it.x, it.y, '#ffffff', 12, 150, 2.5));
      }
    }
  }

  // ----- remoção segura -----
  function cleanupDead() {
    // inimigos mortos -> drop + explosão
    for (const e of Enemies.list) {
      if (e.dead && !e._processed) {
        e._processed = true;
        dropItem(e.centerX, e.centerY);
        Particles.push(...spawnExplosion(e.centerX, e.centerY, e.color, 18, 240, 3.5));
        AudioSys.sfx.explosion();
        Camera.shake(5);
      }
    }
    Enemies.list = Enemies.list.filter(e => !e.dead);
    Bullets.list = Bullets.list.filter(b => !b.dead);
    items = items.filter(it => !it.dead);
  }

  // ----- transições de fase -----
  function bossDefeated() {
    Camera.shake(24);
    AudioSys.sfx.bossDie();
    Particles.push(...spawnExplosion(boss.centerX, boss.centerY, boss.color, 80, 420, 7));
    Particles.push(new ShockRing(boss.centerX, boss.centerY, boss.color, 220, 0.8));
    boss.dead = true;

    if (stageIdx + 1 >= CONFIG.STAGES.length) {
      // VITÓRIA!
      setTimeout(() => {
        state = 'victory';
        AudioSys.sfx.victory();
        UI.showVictory(formatTime(elapsedTotal));
      }, 900);
    } else {
      // próxima fase
      setTimeout(() => {
        UI.toast('FASE ' + (stageIdx + 2) + '/3 — PREPARE-SE!', '#00ff88', 2);
        AudioSys.sfx.stageClear();
        player.heal(40);
        startStage(stageIdx + 1);
      }, 1200);
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function gameOver() {
    state = 'gameover';
    AudioSys.sfx.gameOver();
    UI.toast('VOCÊ FOI DERROTADO…', '#ff3131', 2.2);
    setTimeout(() => {
      location.reload();
    }, 2600);
  }

  // ----- loop principal -----
  function loop(now) {
    if (state === 'menu') { raf = null; return; }

    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    if (state === 'paused') {
      handleGlobalInput();
      raf = requestAnimationFrame(loop);
      return;
    }

    if (state === 'playing') {
      handleGlobalInput();
      time += dt;
      stageTime += dt;
      elapsedTotal += dt;

      // spawn de inimigos
      nextSpawnT += dt;
      while (spawnQueue.length && spawnQueue[0].t <= nextSpawnT) {
        spawnEnemy(spawnQueue.shift());
      }

      // limite de tempo da fase -> chefe fica furioso (atira mais)
      const cfg = CONFIG.STAGES[stageIdx];
      const timeLeft = cfg.timeLimit > 0 ? cfg.timeLimit - stageTime : null;
      if (timeLeft !== null && timeLeft <= 0 && boss && boss.state === 'active' && !boss._enraged) {
        boss._enraged = true;
        boss.attackTimer = Math.max(0.4, boss.attackTimer);
        UI.toast('O CHEFE ESTÁ FURIOSO!', '#ff3131', 1.6);
        AudioSys.sfx.fury();
      }

      // update entidades
      player.update(dt, time);
      Enemies.update(dt, time);
      if (boss && !boss.dead) boss.update(dt);

      for (const it of items) it.update(dt);
      items = items.filter(it => !it.dead);

      Bullets.update(dt, time);
      Particles.update(dt);

      // colisões
      handleCollisions(dt);
      cleanupDead();

      // chefes mortos
      if (boss && !boss.dead && boss.hp <= 0) {
        boss.dead = true;
      }
      if (boss && boss.dead && state === 'playing') {
        // transição já disparada por bossDefeated (via flag única)
        if (!boss._transitionDone) {
          boss._transitionDone = true;
          bossDefeated();
        }
      }

      // morte do jogador
      if (player.dead && state === 'playing') {
        gameOver();
      }

      // HUD
      UI.updateHUD(player, stageIdx, boss && !boss.dead ? boss : null);
    }

    Input.endFrame();

    // ----- render -----
    ctx.save();
    ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
    Camera.apply(ctx);

    Background.draw(ctx, time, dt, state === 'playing' ? 1 : 0.25);

    if (state === 'playing' || state === 'paused') {
      items.forEach(it => it.draw(ctx, time));
      Enemies.draw(ctx);
      Bullets.draw(ctx);
      if (boss && !boss.dead) boss.draw(ctx);
      player.draw(ctx);
      Particles.draw(ctx);
    }

    ctx.restore();

    if (state === 'playing' || state === 'paused') {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }

  // ----- controles do menu/pausa -----
  function handleGlobalInput() {
    if (state === 'playing') {
      if (Input.consume('pause')) togglePause();
      if (Input.consume('mute')) {
        AudioSys.setMuted(!AudioSys.muted);
        UI.toast(AudioSys.muted ? 'SOM DESLIGADO' : 'SOM LIGADO', '#9adfff', 1);
      }
    } else if (state === 'paused') {
      if (Input.consume('pause')) togglePause();
    }
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      UI.showPause();
      AudioSys.resume();
    } else if (state === 'paused') {
      state = 'playing';
      UI.hidePause();
      lastFrame = performance.now();
    }
  }

  function backToMenu() {
    state = 'menu';
    UI.hidePause();
    UI.showStart();
    UI.showFury(false);
    raf = null;
    // limpa entidades para o menu ficar limpo (menu só mostra fundo)
    Particles.clear();
    Bullets.clear();
    Enemies.clear();
    items = [];
    boss = null;
    player = null;
    PlayerRef.instance = null;
  }

  // ----- init -----
  function init() {
    canvas.width = CONFIG.CANVAS_W;
    canvas.height = CONFIG.CANVAS_H;
    UI.init();
    loadAssets();
    Background.init();
    PlayerRef.instance = player;

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('quitBtn').addEventListener('click', backToMenu);
    document.getElementById('restartBtn').addEventListener('click', () => location.reload());

    // roda o loop sempre (para fundo animado no menu)
    state = 'menu';
    lastFrame = performance.now();
    raf = requestAnimationFrame(loop);

    // debug
    window.__game = {
      get state() { return state; },
      get boss() { return boss; },
      get player() { return player; },
      get stageIdx() { return stageIdx; },
      get enemies() { return enemies; },
      get items() { return items; },
      win: () => {
        if (boss) { boss.hp = 0; }
      },
      nextStage: () => {
        if (boss) { boss.hp = 0; }
      },
      start: startGame,
      stateSet: (s) => { state = s; },
    };
  }

  return { init };
})();

// boot
window.addEventListener('DOMContentLoaded', () => Game.init());
