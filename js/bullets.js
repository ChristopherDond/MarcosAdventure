// ============================================================
//  BULLETS — projéteis do jogador e dos inimigos
// ============================================================

class Bullet {
  constructor(x, y, vx, vy, opts = {}) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.owner = opts.owner ?? 'player';
    this.color = opts.color ?? '#00f7ff';
    this.r = opts.r ?? 5;
    this.damage = opts.damage ?? 1;
    this.life = opts.life ?? 4;
    this.dead = false;
    this.wobble = opts.wobble ?? 0;     // amplitude do zigue-zague
    this.wobbleFreq = opts.wobbleFreq ?? 0;
    this.phase = Math.random() * Math.PI * 2;
    this.trail = opts.trail ?? false;
  }

  update(dt, t) {
    if (this.wobble) {
      this.x += this.vx * dt + Math.sin(t * this.wobbleFreq + this.phase) * this.wobble * dt;
      this.y += this.vy * dt;
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
    const pad = 60;
    if (this.x < -pad || this.x > CONFIG.CANVAS_W + pad || this.y < -pad || this.y > CONFIG.CANVAS_H + pad) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const pulse = 0.75 + 0.25 * Math.sin(this.phase + performance.now() * 0.02);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12; ctx.shadowColor = this.color;

    if (this.owner === 'player') {
      // cápsula neon apontando para cima
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.r * 2.2);
      ctx.lineTo(this.x + this.r * 0.8, this.y + this.r);
      ctx.lineTo(this.x - this.r * 0.8, this.y + this.r);
      ctx.closePath();
      ctx.fill();
    } else {
      // bala inimiga: esfera com núcleo
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath();
      ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.38, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

const Bullets = {
  list: [],
  clear() { this.list.length = 0; },
  add(b) { this.list.push(b); },
  update(dt, t) {
    for (const b of this.list) b.update(dt, t);
    this.list = this.list.filter(b => !b.dead);
  },
  draw(ctx) {
    for (const b of this.list) b.draw(ctx);
  },
};
