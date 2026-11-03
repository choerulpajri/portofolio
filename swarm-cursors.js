/* Swarm Cursors — decorative pointer trail */
(() => {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'swarm-cursors';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colors = ['#FFD23F', '#B8A7FF', '#FFFFFF', '#FFB7D5', '#9DE7D0'];
  const cursors = [];
  const amount = window.innerWidth < 700 ? 7 : 15;
  let width = 0;
  let height = 0;
  let pointer = { x: -100, y: -100, active: false };
  let frame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < amount; i++) {
    cursors.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      color: colors[i % colors.length],
      size: i === 0 ? 1 : 0.78
    });
  }

  window.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    if (!frame && !document.hidden) animate();
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  function draw(c) {
    const angle = Math.atan2(c.vy, c.vx) + Math.PI / 2;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(angle);
    ctx.scale(c.size, c.size);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 19);
    ctx.lineTo(5, 14);
    ctx.lineTo(10, 22);
    ctx.lineTo(13, 20);
    ctx.lineTo(8, 12);
    ctx.lineTo(16, 11);
    ctx.closePath();
    ctx.fillStyle = c.color;
    ctx.shadowColor = c.color;
    ctx.shadowBlur = 7;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    if (document.hidden) {
      frame = 0;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    cursors.forEach((c, index) => {
      const target = index === 0 ? pointer : cursors[index - 1];
      if (pointer.active) {
        const dx = target.x - c.x;
        const dy = target.y - c.y;
        const pull = index === 0 ? 0.075 : 0.035;
        c.vx += dx * pull * 0.08;
        c.vy += dy * pull * 0.08;
      }

      c.vx *= 0.91;
      c.vy *= 0.91;
      const speed = Math.hypot(c.vx, c.vy);
      if (speed > 10) {
        c.vx = c.vx / speed * 10;
        c.vy = c.vy / speed * 10;
      }

      c.x += c.vx;
      c.y += c.vy;
      draw(c);
    });

    frame = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      ctx.clearRect(0, 0, width, height);
    } else if (pointer.active && !frame) {
      animate();
    }
  });
})();
