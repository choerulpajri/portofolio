/* Swarm Rebuild — smooth, guided portfolio build */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) {
    root.classList.remove('swarm-build-pending');
    return;
  }

  root.classList.add('swarm-build-active');

  const colors = ['#ffd23f', '#b8a7ff', '#ffb7d5', '#9de7d0'];
  const agents = [];
  const status = document.createElement('div');
  status.className = 'swarm-rebuild-status';
  status.textContent = 'SWARM BUILD · PREPARING';
  status.setAttribute('aria-hidden', 'true');
  document.body.appendChild(status);

  colors.forEach((color, i) => {
    const el = document.createElement('div');
    el.className = 'swarm-rebuild-agent';
    el.style.setProperty('--agent-color', color);
    el.dataset.label = ['layout', 'content', 'visual', 'detail'][i];
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    agents.push(el);
  });

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  let task = 0;
  let finished = 0;

  function move(agent, x, y, duration) {
    const previous = agent._swarmPoint || { x: innerWidth * .5, y: innerHeight * .5 };
    agent._swarmPoint = { x, y };
    agent.classList.add('is-active');
    return agent.animate([
      { transform: `translate3d(${previous.x}px,${previous.y}px,0) rotate(-8deg)` },
      { transform: `translate3d(${x}px,${y}px,0) rotate(3deg)` }
    ], {
      duration,
      easing: 'cubic-bezier(.22,.72,.2,1)',
      fill: 'forwards'
    }).finished.catch(() => {});
  }

  async function scrollToY(y, duration = 650) {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const target = Math.max(0, Math.min(max, y));
    if (Math.abs(window.scrollY - target) < 35) return;
    window.scrollTo({ top: target, behavior: 'smooth' });
    await wait(duration);
  }

  async function bringIntoView(el) {
    const r = el.getBoundingClientRect();
    const topSafe = 86;
    const bottomSafe = innerHeight - 90;
    if (r.top < topSafe || r.bottom > bottomSafe) {
      const target = window.scrollY + r.top - 120;
      await scrollToY(target, 560);
    }
  }

  async function reveal(el, agent) {
    if (!el || el.dataset.swarmBuilt === 'true') return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      el.removeAttribute('data-swarm-hidden');
      el.style.visibility = '';
      el.dataset.swarmBuilt = 'true';
      return;
    }

    await bringIntoView(el);
    const r = el.getBoundingClientRect();
    const startX = Math.max(8, Math.min(innerWidth - 28, r.left + 4));
    const startY = Math.max(8, Math.min(innerHeight - 34, r.top + Math.min(18, r.height / 2)));
    const endX = Math.max(8, Math.min(innerWidth - 28, r.right - 22));
    const endY = Math.max(8, Math.min(innerHeight - 34, startY + Math.min(14, r.height * .12)));

    el.dataset.swarmBuilt = 'true';
    el.removeAttribute('data-swarm-hidden');
    el.style.visibility = 'visible';
    el.style.clipPath = 'inset(0 100% 0 0)';
    el.style.webkitClipPath = 'inset(0 100% 0 0)';

    const duration = Math.max(480, Math.min(850, 480 + r.width * .22));
    await Promise.all([
      move(agent, startX, startY, 220).then(() => move(agent, endX, endY, duration)),
      el.animate([
        { clipPath: 'inset(0 100% 0 0)', webkitClipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0 0 0)', webkitClipPath: 'inset(0 0 0 0)' }
      ], { duration, easing: 'cubic-bezier(.22,.72,.2,1)', fill: 'forwards' }).finished.catch(() => {})
    ]);

    el.style.clipPath = 'none';
    el.style.webkitClipPath = 'none';
    el.style.visibility = 'visible';
    finished++;
  }

  const childSelectors = [
    '.hero-text > *', '.tagwrap',
    '.wrap > h2', '.wrap > .lead-light',
    '.rc-card', '.skill-card', '.project',
    '.dash-intro', '.dash-panel', '.dashboard-view',
    '.contact-btns', '.contact-links',
    '.facts', '.flow', '.timeline', '.contact-copy',
    'footer .wrap > *'
  ];

  function collect(container) {
    const list = [];
    childSelectors.forEach(selector => {
      container.querySelectorAll(selector).forEach(el => {
        if (!el.closest('[data-swarm-skip]') && !list.includes(el)) list.push(el);
      });
    });
    return list.sort((a, b) => {
      const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
      return x.top - y.top || x.left - y.left;
    });
  }

  async function build(container, index, includeContainer = true) {
    if (!container || container.dataset.swarmGroupBuilt === 'true') return;
    container.dataset.swarmGroupBuilt = 'true';

    if (includeContainer) {
      status.textContent = 'SWARM BUILD · SECTION ' + (index + 1);
      await reveal(container, agents[index % agents.length]);
    }

    const children = collect(container).filter(el => el.dataset.swarmBuilt !== 'true');
    for (let i = 0; i < children.length; i++) {
      status.textContent = 'SWARM BUILD · ' + (finished + 1) + ' ELEMENTS';
      await reveal(children[i], agents[(i + index) % agents.length]);
      await wait(65);
    }
  }

  function hidePage() {
    const outer = [
      document.querySelector('nav'),
      document.querySelector('.hero'),
      ...document.querySelectorAll('main > section'),
      document.querySelector('footer')
    ].filter(Boolean);

    outer.forEach(el => {
      el.dataset.swarmOuter = 'true';
      el.setAttribute('data-swarm-hidden', 'true');
      el.style.visibility = 'hidden';
    });

    document.querySelectorAll(
      '.hero-text > *, .tagwrap, main > section .wrap > h2, main > section .wrap > .lead-light, ' +
      '.rc-card, .skill-card, .project, .dash-intro, .dash-panel, .dashboard-view, ' +
      '.contact-btns, .contact-links, .facts, .flow, .timeline, .contact-copy, footer .wrap > *'
    ).forEach(el => {
      el.setAttribute('data-swarm-hidden', 'true');
      el.style.visibility = 'hidden';
    });

    return outer;
  }

  async function run() {
    hidePage();
    root.classList.remove('swarm-build-pending');
    await wait(350);

    const nav = document.querySelector('nav');
    if (nav) await build(nav, 0);

    const hero = document.querySelector('.hero');
    if (hero) await build(hero, 1);

    const sections = Array.from(document.querySelectorAll('main > section'))
      .filter(section => section.getClientRects().length > 0);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      await scrollToY(window.scrollY + section.getBoundingClientRect().top - 76, 650);
      await build(section, i + 2);
      await wait(110);
    }

    const footer = document.querySelector('footer');
    if (footer && footer.getClientRects().length) {
      await scrollToY(window.scrollY + footer.getBoundingClientRect().top - 76, 650);
      await build(footer, sections.length + 2);
    }

    status.textContent = 'SWARM BUILD · COMPLETE';
    await wait(650);
    await scrollToY(0, 850);
    agents.forEach(agent => agent.classList.remove('is-active'));
    await wait(350);
    agents.forEach(agent => agent.remove());
    status.classList.add('is-done');
    await wait(500);
    status.remove();
    root.classList.remove('swarm-build-active');
  }

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  run().catch(() => {
    root.classList.remove('swarm-build-pending', 'swarm-build-active');
    document.querySelectorAll('[data-swarm-hidden]').forEach(el => {
      el.style.visibility = '';
      el.style.clipPath = '';
      el.removeAttribute('data-swarm-hidden');
    });
    agents.forEach(agent => agent.remove());
    status.remove();
  });
})();
