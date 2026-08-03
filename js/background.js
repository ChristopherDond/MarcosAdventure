// ============================================================
//  BACKGROUND — espaço neon em scroll + nebulosas
// ============================================================

const Background = (() => {
  let stars = [];
  let nebulas = [];

  function init() {
    stars = [];
    nebulas = [];
    const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;
    for (let i = 0; i < 130; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: 0.25 + Math.random() * 0.75,          // profundidade (0-1)
        tw: 0.5 + Math.random() * 1.5,           // velocidade do brilho
        size: 0.6 + Math.random() * 1.8,
      });
    }
    // nebulosas coloridas
    const cols = ['#00f7ff', '#ff00ff', '#8800ff', '#ff3131'];
    for (let i = 0; i < 6; i++) {
      nebulas.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 120 + Math.random() * 200,
        color: cols[i % cols.length],
        drift: 6 + Math.random() * 12,
      });
    }
  }

  function draw(ctx, t, dt, intensity = 1) {
    const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;
    // base
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#04010c');
    grad.addColorStop(0.5, '#05040f');
    grad.addColorStop(1, '#020208');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // nebulosas
    for (const n of nebulas) {
      n.y -= n.drift * dt * intensity;
      if (n.y < -n.r) n.y = H + n.r;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, n.color + '22');
      g.addColorStop(1, n.color + '00');
      ctx.fillStyle = g;
      ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
    }

    // estrelas com parallax
    for (const s of stars) {
      s.y += (20 + s.z * 90) * dt * intensity;
      if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
      const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(t * s.tw + s.x));
      ctx.globalAlpha = twinkle * (0.3 + s.z * 0.7);
      ctx.fillStyle = s.z > 0.7 ? '#cfefff' : '#7a8cff';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }

  return { init, draw };
})();
