// ============================================================
//  PARTICLES — explosões, rastros, sparks e anéis
// ============================================================

class Particle {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.vx = opts.vx ?? (Math.random() - 0.5) * (opts.speed ?? 160);
    this.vy = opts.vy ?? (Math.random() - 0.5) * (opts.speed ?? 160);
    this.life = opts.life ?? 0.7;
    this.maxLife = this.life;
    this.size = opts.size ?? (Math.random() * 3 + 2);
    this.color = opts.color ?? '#00f7ff';
    this.gravity = opts.gravity ?? 0;
    this.drag = opts.drag ?? 0.98;
    this.glow = opts.glow ?? 12;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.vx *= this.drag; this.vy *= this.drag;
    this.life -= dt;
  }
  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.glow * a; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (0.5 + 0.5 * a), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

class ShockRing {
  constructor(x, y, color = '#fff', maxR = 90, life = 0.5) {
    this.x = x; this.y = y; this.color = color;
    this.maxR = maxR; this.life = life; this.t = 0;
  }
  update(dt) { this.t += dt; }
  draw(ctx) {
    const p = Math.min(1, this.t / this.life);
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3 * (1 - p) + 1;
    ctx.shadowBlur = 15; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.maxR * (0.2 + 0.8 * p), 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  get done() { return this.t >= this.life; }
}

function spawnExplosion(x, y, color = '#ffcc00', n = 26, speed = 260, size = 4) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    parts.push(new Particle(x, y, {
      color: Math.random() < 0.3 ? '#ffffff' : color,
      speed: speed * (0.4 + Math.random()),
      size: size * (0.5 + Math.random()),
      life: 0.4 + Math.random() * 0.5,
      drag: 0.96,
    }));
  }
  // flash central
  parts.push(new Particle(x, y, { color: '#ffffff', size: size * 3, speed: 10, life: 0.15, glow: 30 }));
  return parts;
}

function spawnTrail(x, y, color = '#00f7ff') {
  return [new Particle(x + (Math.random() - 0.5) * 10, y, {
    color, size: 2.5 + Math.random() * 2, speed: 30, life: 0.3, drag: 0.94,
  })];
}
