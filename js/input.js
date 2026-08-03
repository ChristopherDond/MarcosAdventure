// ============================================================
//  INPUT — teclado e toque (com modo "caixa de texto" para
//  não atrapalhar digitação em inputs)
// ============================================================

const Input = (() => {
  const keys = new Set();
  const pressed = new Set();   // teclas pressionadas neste frame (evento)

  const MAP = {
    up:    ['ArrowUp', 'KeyW'],
    down:  ['ArrowDown', 'KeyS'],
    left:  ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    shoot: ['Space'],
    slow:  ['ShiftLeft', 'ShiftRight'],
    pause: ['KeyP', 'Escape'],
    mute:  ['KeyM'],
  };

  function isTyping() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function mapKey(code) {
    for (const [action, codes] of Object.entries(MAP)) {
      if (codes.includes(code)) return action;
    }
    return null;
  }

  window.addEventListener('keydown', (e) => {
    if (isTyping()) return;
    const action = mapKey(e.code);
    if (!action) return;
    e.preventDefault();
    if (!keys.has(e.code)) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
  window.addEventListener('blur', () => keys.clear());

  // ----- toque (mobile) -----
  let touchActive = false;
  let touchStart = null;
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchActive = true;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    pressed.add('Space'); // primeiro toque = atirar também
    setTimeout(() => pressed.delete('Space'), 80);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (touchStart) {
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      const len = Math.hypot(dx, dy);
      if (len > 24) {
        keys.add(dx < 0 ? 'ArrowLeft' : 'ArrowRight');
        keys.add(dy < 0 ? 'ArrowUp' : 'ArrowDown');
      }
      touchStart = { x: t.clientX, y: t.clientY };
    }
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchActive = false;
    keys.delete('ArrowLeft'); keys.delete('ArrowRight');
    keys.delete('ArrowUp'); keys.delete('ArrowDown');
  }, { passive: false });

  // ----- estado consultável por frame -----
  const state = {
    get up()    { return keys.has('ArrowUp') || keys.has('KeyW'); },
    get down()  { return keys.has('ArrowDown') || keys.has('KeyS'); },
    get left()  { return keys.has('ArrowLeft') || keys.has('KeyA'); },
    get right() { return keys.has('ArrowRight') || keys.has('KeyD'); },
    get shoot() { return keys.has('Space'); },
    get slow()  { return keys.has('ShiftLeft') || keys.has('ShiftRight'); },
  };

  function consume(action) {
    for (const code of MAP[action] || []) {
      if (pressed.has(code)) {
        pressed.delete(code);
        return true;
      }
    }
    return false;
  }

  function endFrame() { pressed.clear(); }

  return { state, consume, endFrame, get touchActive() { return touchActive; } };
})();
