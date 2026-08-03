// ============================================================
//  BOSSES — os 3 grandes: Que Cê Disse?, Que Tristeza e Marcos Absoluto
// ============================================================

class Boss {
  constructor(stage) {
    this.stage = stage;
    this.name = stage.name;
    this.maxHp = stage.bossHp;
    this.hp = this.maxHp;
    this.color = stage.bossColor;
    this.w = stage.width ?? 160;
    this.h = stage.height ?? 110;
    this.x = CONFIG.CANVAS_W / 2 - this.w / 2;
    this.y = -this.h - 40;
    this.t = 0;
    this.flash = 0;
    this.introT = 0;            // animação de entrada
    this.state = 'intro';       // intro | active
    this.attackTimer = 0;
    this.dead = false;
    this.img = document.getElementById(stage.imgId);
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  update(dt) {
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;

    if (this.state === 'intro') {
      this.introT += dt;
      this.y += 140 * dt;
      if (this.y >= this.targetY()) {
        this.y = this.targetY();
        this.state = 'active';
        this.attackTimer = 0.8;
      }
      return;
    }

    this.behavior(dt);
  }

  targetY() { return 70; }

  behavior() {} // overridden

  fireAimed(offsetX = 0, speed = null, color = null, r = 6) {
    const p = PlayerRef.instance;
    if (!p) return;
    const sx = this.centerX + offsetX;
    const sy = this.centerY + this.h * 0.45;
    const dx = p.centerX - sx;
    const dy = p.centerY - sy;
    const len = Math.hypot(dx, dy) || 1;
    const spd = speed ?? CONFIG.BULLET.bossSpeed;
    Bullets.add(new Bullet(sx, sy, dx / len * spd, dy / len * spd, {
      owner: 'enemy', color: color ?? this.color, r,
    }));
    AudioSys.sfx.enemyShoot();
  }

  fireSpread(n, speed, color, spread = Math.PI / 6, aimPlayer = true) {
    const p = PlayerRef.instance;
    let base = -Math.PI / 2;
    if (aimPlayer && p) {
      base = Math.atan2(p.centerY - this.centerY, p.centerX - this.centerX);
    }
    const sx = this.centerX, sy = this.centerY + this.h * 0.4;
    for (let i = 0; i < n; i++) {
      const a = base - spread / 2 + (spread * i) / (n - 1);
      Bullets.add(new Bullet(sx, sy, Math.cos(a) * speed, Math.sin(a) * speed, {
        owner: 'enemy', color, r: 6,
      }));
    }
    AudioSys.sfx.enemyShoot();
  }

  fireRing(n, speed, color) {
    const sx = this.centerX, sy = this.centerY + this.h * 0.4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      Bullets.add(new Bullet(sx, sy, Math.cos(a) * speed, Math.sin(a) * speed, {
        owner: 'enemy', color, r: 6,
      }));
    }
    AudioSys.sfx.enemyShoot();
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.flash = 0.08;
  }

  draw(ctx) {
    ctx.save();
    if (this.flash > 0) {
      ctx.filter = 'brightness(3) contrast(1.5)';
    }
    ctx.shadowBlur = 28; ctx.shadowColor = this.color;

    if (this.img && this.img.complete) {
      // leve flutuação quando ativo
      const bob = this.state === 'active' ? Math.sin(this.t * 2.2) * 5 : 0;
      ctx.drawImage(this.img, this.x, this.y + bob, this.w, this.h);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    ctx.restore();
    ctx.filter = 'none';

    // aura pulsante no estado ativo
    if (this.state === 'active') {
      const pulse = 0.25 + 0.15 * Math.sin(this.t * 4);
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = this.color;
      ctx.shadowBlur = 25; ctx.shadowColor = this.color;
      ctx.lineWidth = 2;
      const pad = 12 + Math.sin(this.t * 4) * 4;
      ctx.strokeRect(this.x - pad, this.y - pad, this.w + pad * 2, this.h + pad * 2);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }
}

// ============ BOSS 1 — "O QUE CÊ DISSE?" ============
// Padrão: balas em leque mirando o jogador + investida lateral
class Boss1 extends Boss {
  behavior(dt) {
    // vai e vem horizontal
    this.x = (CONFIG.CANVAS_W / 2 - this.w / 2) + Math.sin(this.t * 1.4) * (CONFIG.CANVAS_W / 2 - this.w - 40);

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      const p = PlayerRef.instance;
      if (p) {
        const phase = Math.floor(this.t / 4) % 3;
        if (phase === 0) {
          this.fireSpread(5, CONFIG.BULLET.bossSpeed, '#ff6b6b', Math.PI / 3);
          this.attackTimer = 2.2;
        } else if (phase === 1) {
          this.fireAimed(0, CONFIG.BULLET.bossSpeed * 1.15, '#ff4444', 7);
          this.attackTimer = 1.0;
        } else {
          this.fireRing(10, CONFIG.BULLET.bossSpeed * 0.8, '#ff9a9a');
          this.attackTimer = 3.0;
        }
      }
    }
  }
}

// ============ BOSS 2 — "QUE TRISTEZA" ============
// Corpo principal parado + 2 "fantasmas" orbitando (mantém o visual original)
class Boss2 extends Boss {
  constructor(stage) {
    super(stage);
    this.orbitR = 130;
    this.orbitSpeed = 1.1;
  }

  behavior(dt) {
    // centro faz leve vaivém
    this.x = (CONFIG.CANVAS_W / 2 - this.w / 2) + Math.sin(this.t * 0.8) * 90;

    // disparos alternados
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      const p = PlayerRef.instance;
      if (p) {
        const phase = Math.floor(this.t / 3.5) % 3;
        if (phase === 0) {
          this.fireRing(12, CONFIG.BULLET.boss2Speed, '#ffb84d');
          this.attackTimer = 3.2;
        } else if (phase === 1) {
          this.fireAimed(0, CONFIG.BULLET.boss2Speed * 1.1, '#ff9900', 7);
          this.fireAimed(0, CONFIG.BULLET.boss2Speed * 1.1, '#ff9900', 7);
          this.attackTimer = 1.2;
        } else {
          // leque duplo dos orbitais
          for (const orb of this.orbitals()) {
            const sx = orb.x, sy = orb.y;
            const dx = p.centerX - sx, dy = p.centerY - sy;
            const len = Math.hypot(dx, dy) || 1;
            const spd = CONFIG.BULLET.boss2Speed * 0.9;
            for (let i = -1; i <= 1; i++) {
              const a = Math.atan2(dy, dx) + i * 0.18;
              Bullets.add(new Bullet(sx, sy, Math.cos(a) * spd, Math.sin(a) * spd, {
                owner: 'enemy', color: '#ffcc66', r: 5.5,
              }));
            }
          }
          AudioSys.sfx.enemyShoot();
          this.attackTimer = 2.8;
        }
      }
    }
  }

  orbitals() {
    const cx = this.centerX, cy = this.centerY;
    const a1 = this.t * this.orbitSpeed;
    const a2 = a1 + Math.PI;
    return [
      { x: cx + Math.cos(a1) * this.orbitR, y: cy + Math.sin(a1) * this.orbitR * 0.55 },
      { x: cx + Math.cos(a2) * this.orbitR, y: cy + Math.sin(a2) * this.orbitR * 0.55 },
    ];
  }

  // colisão com os orbitais também
  collidesWith(rect) {
    const self = { x: this.x, y: this.y, w: this.w, h: this.h };
    if (rectsOverlap(rect, self)) return true;
    for (const o of this.orbitals()) {
      const s = 78;
      if (rectsOverlap(rect, { x: o.x - s / 2, y: o.y - s / 2, w: s, h: s })) return true;
    }
    return false;
  }

  draw(ctx) {
    // orbitais primeiro (atrás)
    const p = this.state === 'active' ? PlayerRef.instance : null;
    ctx.save();
    for (const o of this.orbitals()) {
      const s = 78;
      ctx.shadowBlur = 18; ctx.shadowColor = '#ff9900';
      if (this.img && this.img.complete) {
        ctx.drawImage(this.img, o.x - s / 2, o.y - s / 2, s, s);
      } else {
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(o.x - s / 2, o.y - s / 2, s, s);
      }
    }
    ctx.restore();
    super.draw(ctx);
  }
}

// ============ BOSS 3 — "MARCOS ABSOLUTO" ============
// Forma final: grande, mísseis teleguiados + anéis + barragem
class Boss3 extends Boss {
  constructor(stage) {
    super(stage);
    this.w = 300; this.h = 220;
    this.missileTimer = 0;
  }

  targetY() { return 90; }

  behavior(dt) {
    this.x = (CONFIG.CANVAS_W / 2 - this.w / 2) + Math.sin(this.t * 0.9) * 240;
    this.y = this.targetY() + Math.sin(this.t * 1.6) * 24;

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      const p = PlayerRef.instance;
      if (p) {
        const phase = Math.floor(this.t / 5) % 4;
        if (phase === 0) {
          // barragem em leque
          this.fireSpread(7, CONFIG.BULLET.boss3Speed, '#bc13fe', Math.PI / 2.4);
          this.attackTimer = 2.4;
        } else if (phase === 1) {
          // anel duplo
          this.fireRing(16, CONFIG.BULLET.boss3Speed * 0.75, '#ff00ff');
          this.attackTimer = 2.8;
        } else if (phase === 2) {
          // mísseis teleguiados (rastreadores)
          this.launchMissiles(4);
          this.attackTimer = 3.2;
        } else {
          // tiro de precisão rápido
          this.fireAimed(0, CONFIG.BULLET.boss3Speed * 1.3, '#ffffff', 8);
          this.attackTimer = 1.1;
        }
      }
    }

    // mísseis
    this.missileTimer -= dt;
    if (this.missileTimer <= 0 && this.t > 1) {
      this.launchMissiles(2);
      this.missileTimer = 5.5;
    }
  }

  launchMissiles(n) {
    const p = PlayerRef.instance;
    if (!p) return;
    const sx = this.centerX, sy = this.centerY + this.h * 0.5;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 26;
      Bullets.add(new HomingBullet(sx + off, sy, p, {
        owner: 'enemy', color: '#ffcc00', r: 7,
      }));
    }
    AudioSys.sfx.enemyShoot();
  }
}

// ============ BULLET RASTREADOR (míssil) ============
class HomingBullet extends Bullet {
  constructor(x, y, target, opts = {}) {
    super(x, y, 0, 140, opts);
    this.target = target;
    this.turnRate = 2.4;
  }
  update(dt, t) {
    if (this.target && !this.target.dead) {
      const dx = this.target.centerX - this.x;
      const dy = this.target.centerY - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const desired = Math.atan2(dy, dx);
      const cur = Math.atan2(this.vy, this.vx);
      let diff = desired - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const maxTurn = this.turnRate * dt;
      const newA = cur + Math.max(-maxTurn, Math.min(maxTurn, diff));
      const spd = Math.hypot(this.vx, this.vy);
      this.vx = Math.cos(newA) * spd;
      this.vy = Math.sin(newA) * spd;
    }
    super.update(dt, t);
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 16; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // rastro
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 2, this.y + 6, 4, 12);
    ctx.globalAlpha = 1;
  }
}

// utilidade
function rectsOverlap(a, b) {
  return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
}
