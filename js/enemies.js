// ============================================================
//  ENEMIES — inimigos das fases (mini-chefes da sala dos professores)
// ============================================================

class Enemy {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.w = opts.w ?? 44;
    this.h = opts.h ?? 44;
    this.hp = opts.hp ?? 2;
    this.maxHp = this.hp;
    this.speed = opts.speed ?? 160;
    this.color = opts.color ?? '#ff6b6b';
    this.fireCd = opts.fireCd ?? 2.4;
    this.timer = Math.random() * this.fireCd;
    this.dead = false;
    this.phase = Math.random() * Math.PI * 2;
    this.flash = 0;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  move(dt) { this.y += this.speed * dt; }

  update(dt, t) {
    this.move(dt);
    this.phase += dt;
    if (this.flash > 0) this.flash -= dt;

    // sai da tela
    if (this.y > CONFIG.CANVAS_H + 60) this.dead = true;

    this.timer -= dt;
    if (this.timer <= 0 && this.y > -20 && this.y < CONFIG.CANVAS_H * 0.75) {
      this.fire();
      this.timer = this.fireCd;
    }
  }

  fire() {
    const p = PlayerRef.instance;
    if (!p) return;
    const dx = p.centerX - this.centerX;
    const dy = p.centerY - this.centerY;
    const len = Math.hypot(dx, dy) || 1;
    const spd = CONFIG.BULLET.bossSpeed;
    Bullets.add(new Bullet(this.centerX, this.centerY + this.h / 2, dx / len * spd, dy / len * spd, {
      owner: 'enemy', color: '#ff8080', r: 5.5,
    }));
    AudioSys.sfx.enemyShoot();
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.flash = 0.08;
  }

  draw(ctx) {
    ctx.save();
    if (this.flash > 0) {
      ctx.filter = 'brightness(3)';
    }
    ctx.shadowBlur = 14; ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    // losango neon
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.y);
    ctx.lineTo(this.x + this.w, this.centerY);
    ctx.lineTo(this.centerX, this.y + this.h);
    ctx.lineTo(this.x, this.centerY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.filter = 'none';
  }
}

// --- inimigo que serpenteia ---
class WeaverEnemy extends Enemy {
  move(dt) {
    this.y += this.speed * 0.7 * dt;
    this.x += Math.sin(this.phase * 1.8) * 70 * dt;
  }
}

// --- inimigo tanque (lento, resistente, tiro triplo) ---
class TankEnemy extends Enemy {
  constructor(...args) {
    super(...args);
    this.w = 62; this.h = 62;
  }
  fire() {
    const p = PlayerRef.instance;
    if (!p) return;
    const dx = p.centerX - this.centerX;
    const dy = p.centerY - this.centerY;
    const len = Math.hypot(dx, dy) || 1;
    const spd = CONFIG.BULLET.bossSpeed * 0.85;
    for (let i = -1; i <= 1; i++) {
      const a = Math.atan2(dy, dx) + i * 0.22;
      Bullets.add(new Bullet(this.centerX, this.centerY + this.h / 2, Math.cos(a) * spd, Math.sin(a) * spd, {
        owner: 'enemy', color: '#7fd6ff', r: 6,
      }));
    }
    AudioSys.sfx.enemyShoot();
  }
  draw(ctx) {
    ctx.save();
    if (this.flash > 0) ctx.filter = 'brightness(3)';
    ctx.shadowBlur = 16; ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    const cx = this.centerX, cy = this.centerY, r = this.w / 2;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + this.phase * 0.5;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.filter = 'none';
  }
}

// --- inimigo zigue-zague rápido ---
class ZigzagEnemy extends Enemy {
  move(dt) {
    this.y += this.speed * 0.85 * dt;
    this.x += Math.sin(this.phase * 3.2) * 130 * dt;
    this.x = Math.max(10, Math.min(CONFIG.CANVAS_W - 10 - this.w, this.x));
  }
}

const Enemies = {
  list: [],
  clear() { this.list.length = 0; },
  update(dt, t) {
    for (const e of this.list) e.update(dt, t);
    this.list = this.list.filter(e => !e.dead);
  },
  draw(ctx) {
    for (const e of this.list) e.draw(ctx);
  },
};
