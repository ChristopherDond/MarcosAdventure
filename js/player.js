// ============================================================
//  PLAYER — Marcos: movimento, tiro, overdrive, dano
// ============================================================

class Player {
  constructor() {
    this.w = 62;
    this.h = 86;
    this.x = CONFIG.CANVAS_W / 2 - this.w / 2;
    this.y = CONFIG.CANVAS_H - 130;
    this.hp = CONFIG.PLAYER.hp;
    this.maxHp = CONFIG.PLAYER.hp;
    this.weaponLevel = 1;
    this.speed = CONFIG.PLAYER.speed;
    this.fury = 0;                 // segundos restantes
    this.lastShoot = 0;
    this.invuln = 0;
    this.flashTimer = 0;
    this.dead = false;
    this.tilt = 0;                 // inclinação visual ao mover
    this.img = document.getElementById('playerImg');
    this.imgLoaded = this.img && this.img.complete;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  reset() {
    this.x = CONFIG.CANVAS_W / 2 - this.w / 2;
    this.y = CONFIG.CANVAS_H - 130;
    this.hp = this.maxHp;
    this.weaponLevel = 1;
    this.fury = 0;
    this.lastShoot = 0;
    this.invuln = 0;
    this.dead = false;
    this.tilt = 0;
  }

  update(dt, t) {
    const inp = Input.state;
    let dx = 0, dy = 0;
    if (inp.left) dx -= 1;
    if (inp.right) dx += 1;
    if (inp.up) dy -= 1;
    if (inp.down) dy += 1;

    const spd = this.speed * (inp.slow ? CONFIG.PLAYER.slowFactor : 1);
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    this.x += dx * spd * dt;
    this.y += dy * spd * dt;
    this.x = Math.max(0, Math.min(CONFIG.CANVAS_W - this.w, this.x));
    this.y = Math.max(0, Math.min(CONFIG.CANVAS_H - this.h, this.y));

    // tilt suave
    const targetTilt = dx * 0.15;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, dt * 12);

    // overdrive
    if (this.fury > 0) {
      this.fury -= dt;
      if (this.fury <= 0) this.fury = 0;
      if (Math.random() < dt * 40) {
        Particles.push(new Particle(this.x + Math.random() * this.w, this.y + Math.random() * this.h, {
          color: '#ff3300', size: 4, speed: 60, life: 0.4,
        }));
      }
    }

    // timers
    if (this.invuln > 0) this.invuln -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;

    // tiro
    if (inp.shoot) {
      const cd = this.fury > 0 ? CONFIG.PLAYER.shootDelay * 0.4 : CONFIG.PLAYER.shootDelay;
      if (t - this.lastShoot >= cd) {
        this.shoot(t);
        this.lastShoot = t;
      }
    }

    // rastro
    if (Math.random() < dt * 60) {
      Particles.push(...spawnTrail(this.centerX, this.y + this.h * 0.9, this.fury > 0 ? '#ff3300' : '#00f7ff'));
    }
  }

  shoot(t) {
    const lvl = this.fury > 0 ? 4 : this.weaponLevel;
    const color = this.fury > 0 ? '#ff3300' : (lvl >= 4 ? '#ffcc00' : '#00f7ff');
    const cx = this.centerX;
    const top = this.y + 6;
    AudioSys.sfx.shoot(lvl, this.fury > 0);

    const mk = (ox, oy, vx, vy, wob = 0) => new Bullet(cx + ox, top + oy, vx, vy, {
      owner: 'player', color, r: 5, damage: 1, trail: true, wobble: wob, wobbleFreq: 6,
    });

    const B = CONFIG.BULLET.playerSpeed;
    if (lvl === 1) {
      Bullets.add(mk(0, 0, 0, -B));
    } else if (lvl === 2) {
      Bullets.add(mk(-9, 4, 0, -B));
      Bullets.add(mk(9, 4, 0, -B));
    } else if (lvl === 3) {
      Bullets.add(mk(0, 0, 0, -B));
      Bullets.add(mk(-16, 6, -55, -B * 0.97));
      Bullets.add(mk(16, 6, 55, -B * 0.97));
    } else {
      for (let i = -2; i <= 2; i++) {
        Bullets.add(mk(i * 8, 0, i * 95, -B));
      }
      // bônus de fury: disparo lateral
      Bullets.add(mk(-20, 10, -B * 0.8, -40));
      Bullets.add(mk(20, 10, B * 0.8, -40));
    }
  }

  takeDamage(amount) {
    if (this.invuln > 0 || this.fury > 0 || this.dead) return;
    this.hp -= amount;
    this.invuln = CONFIG.PLAYER.invulnTime;
    this.flashTimer = CONFIG.PLAYER.damageFlash;
    Camera.shake(14);
    AudioSys.sfx.playerHurt();
    Particles.push(...spawnExplosion(this.centerX, this.centerY, '#ff3131', 12, 200, 3));
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      AudioSys.sfx.playerDie();
      Particles.push(...spawnExplosion(this.centerX, this.centerY, '#00f7ff', 60, 380, 6));
    }
  }
  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  powerUp() {
    if (this.weaponLevel < CONFIG.POWERUP.maxWeaponLevel) {
      this.weaponLevel++;
      UI.toast('ARMA MELHORADA — NÍVEL ' + this.weaponLevel, '#ffcc00');
      AudioSys.sfx.powerup();
    } else {
      this.hp = Math.min(this.maxHp, this.hp + 15);
      UI.toast('ARMA NO MÁXIMO! +15 HP', '#ffcc00');
      AudioSys.sfx.heal();
    }
  }

  activateFury() {
    this.fury = CONFIG.PLAYER.furyDuration;
    UI.showFury(true);
    AudioSys.sfx.fury();
  }

  draw(ctx) {
    if (this.dead) return;
    // pisca durante invencibilidade
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.tilt);
    if (this.fury > 0) {
      ctx.filter = 'hue-rotate(' + (performance.now() * 0.004) % 360 + 'deg) brightness(1.4) saturate(1.3)';
      ctx.shadowBlur = 30; ctx.shadowColor = '#ff3300';
    } else {
      ctx.shadowBlur = 16; ctx.shadowColor = '#00f7ff';
    }
    if (this.imgLoaded && this.img) {
      ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    } else {
      // fallback geométrico
      ctx.fillStyle = '#00f7ff';
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }
    ctx.restore();
    ctx.filter = 'none';
  }
}
