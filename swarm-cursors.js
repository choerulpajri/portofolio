/* Swarm Rebuild — original portfolio page-build animation */
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

  const colors = ['#ffd23f', '#b8a7ff', '#ffb7d5', '#9de7d0', '#ffffff', '#ff9d72'];
  const agents = [];
  const agentCount = 6;
  const status = document.createElement('div');
  status.className = 'swarm-rebuild-status';
  status.textContent = 'SWARM BUILD · INITIALIZING';
  status.setAttribute('aria-hidden', 'true');
  document.body.appendChild(status);

  for (let i = 0; i < agentCount; i++) {
    const agent = document.createElement('div');
    agent.className = 'swarm-rebuild-agent';
    agent.style.setProperty('--agent-color', colors[i % colors.length]);
    agent.dataset.label = 'cursor_' + String(i + 1).padStart(2, '0');
    agent.setAttribute('aria-hidden', 'true');
    document.body.appendChild(agent);
    agents.push(agent);
  }

  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  let taskIndex = 0;
  let completed = 0;
  let built = false;
  let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  let idleFrame = 0;

  function moveAgent(agent, x, y, duration) {
    const from = agent.dataset.position ? JSON.parse(agent.dataset.position) : { x: innerWidth / 2, y: innerHeight / 2 };
    agent.dataset.position = JSON.stringify({ x, y });
    agent.classList.add('is-active');
    return agent.animate([
      { transform: 'translate3d(' + from.x + 'px,' + from.y + 'px,0) rotate(-12deg)' },
      { transform: 'translate3d(' + x + 'px,' + y + 'px,0) rotate(8deg)' }
    ], { duration, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'forwards' }).finished.catch(() => {});
  }

  function revealElement(el, agent, index) {
    if (!el || el.dataset.swarmBuilt === 'true') return Promise.resolve();
    el.dataset.swarmBuilt = 'true';
    el.removeAttribute('data-swarm-hidden');

    const rect = el.getBoundingClientRect();
    const x = Math.max(4, Math.min(innerWidth - 24, rect.left + 2));
    const y = Math.max(4, Math.min(innerHeight - 30, rect.top + Math.min(12, Math.max(2, rect.height / 3))));
    const endX = Math.max(4, Math.min(innerWidth - 24, rect.right - 18));
    const endY = y + (index % 3 - 1) * 5;
    const duration = Math.min(1050, Math.max(420, rect.width * .65));

    el.style.visibility = 'visible';
    el.style.clipPath = 'inset(0 100% 0 0)';
    el.style.webkitClipPath = 'inset(0 100% 0 0)';
    agent.style.opacity = '1';

    const cursorMove = moveAgent(agent, x, y, 160).then(() =>
      moveAgent(agent, endX, endY, duration)
    );
    const elementReveal = el.animate([
      { clipPath: 'inset(0 100% 0 0)', webkitClipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', webkitClipPath: 'inset(0 0% 0 0)' }
    ], { duration, easing: 'cubic-bezier(.2,.7,.15,1)', fill: 'forwards' }).finished.catch(() => {});

    return Promise.all([cursorMove, elementReveal]).then(() => {
      el.style.clipPath = 'none';
      el.style.webkitClipPath = 'none';
      el.style.visibility = 'visible';
      completed++;
    });
  }

  function targetsWithin(container) {
    const selectors = [
      '.hero-text > *', '.tagwrap',
      '.wrap > h2', '.wrap > .lead-light',
      '.rc-card', '.skill-card', '.project',
      '.dash-intro', '.dash-panel', '.dashboard-view',
      '.contact-btns', '.contact-links',
      '.facts', '.flow', '.timeline', '.contact-copy',
      'footer .wrap > *'
    ];
    const found = [];
    selectors.forEach(selector => {
      container.querySelectorAll(selector).forEach(el => {
        if (!found.includes(el) && !el.closest('[data-swarm-skip]')) found.push(el);
      });
    });
    return found.sort((a, b) => {
      const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      return ar.top - br.top || ar.left - br.left;
    });
  }

  async function buildGroup(container, outer, groupNumber) {
    if (container.dataset.swarmGroupBuilt === 'true') return;
    container.dataset.swarmGroupBuilt = 'true';

    if (outer) {
      await revealElement(container, agents[groupNumber % agents.length], taskIndex++);
    }

    const children = targetsWithin(container).filter(el => el.dataset.swarmBuilt !== 'true');
    status.textContent = 'SWARM BUILD · ' + Math.min(completed + 1, 99) + ' ELEMENTS ASSEMBLED';

    // A small group of cursors works simultaneously, then moves to the next cluster.
    for (let start = 0; start < children.length; start += agents.length) {
      const batch = children.slice(start, start + agents.length);
      await Promise.all(batch.map((el, i) =>
        revealElement(el, agents[(i + start) % agents.length], taskIndex++)
      ));
      await wait(90);
    }
  }

  function hideTargets() {
    const outer = [
      document.querySelector('nav'),
      document.querySelector('.hero'),
      ...document.querySelectorAll('main > section'),
      document.querySelector('footer')
    ].filter(Boolean);

    outer.forEach(el => {
      el.setAttribute('data-swarm-hidden', 'true');
      el.style.visibility = 'hidden';
    });

    const inner = [];
    document.querySelectorAll(
      '.hero-text > *, .tagwrap, main > section .wrap > h2, main > section .wrap > .lead-light, ' +
      '.rc-card, .skill-card, .project, .dash-intro, .dash-panel, .dashboard-view, ' +
      '.contact-btns, .contact-links, .facts, .flow, .timeline, .contact-copy'
    ).forEach(el => inner.push(el));

    inner.forEach(el => {
      el.setAttribute('data-swarm-hidden', 'true');
      el.style.visibility = 'hidden';
    });

    return outer;
  }

  function startIdleSwarm() {
    if (idleFrame) cancelAnimationFrame(idleFrame);
    const offsets = agents.map((_, i) => ({ x: Math.cos(i * Math.PI * 2 / agents.length) * (16 + i * 2), y: Math.sin(i * Math.PI * 2 / agents.length) * (13 + i * 2) }));
    const tick = () => {
      if (!built) return;
      agents.forEach((agent, i) => {
        const x = pointer.x + offsets[i].x;
        const y = pointer.y + offsets[i].y;
        agent.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        agent.classList.add('is-idle');
      });
      idleFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  async function runIntro() {
    const outer = hideTargets();
    root.classList.remove('swarm-build-pending');
    await wait(450);

    const nav = document.querySelector('nav');
    if (nav) await buildGroup(nav, true, 0);

    const hero = document.querySelector('.hero');
    if (hero) await buildGroup(hero, true, 1);

    const firstSections = Array.from(document.querySelectorAll('main > section'));
    for (let i = 0; i < firstSections.length; i++) {
      const section = firstSections[i];
      const rect = section.getBoundingClientRect();
      if (rect.top < innerHeight + 80) {
        await buildGroup(section, true, i + 2);
      } else {
        // Sections below the fold are rebuilt when the visitor reaches them.
        observeSection(section, i + 2);
      }
    }

    const footer = document.querySelector('footer');
    if (footer) observeSection(footer, firstSections.length + 2, true);

    built = true;
    status.textContent = 'SWARM BUILD · COMPLETE';
    await wait(1000);
    status.classList.add('is-done');
    agents.forEach(agent => agent.classList.remove('is-active'));
    startIdleSwarm();
    await wait(550);
    status.remove();
  }

  const observed = new WeakSet();
  function observeSection(section, index, isFooter) {
    if (observed.has(section)) return;
    observed.add(section);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          buildGroup(section, true, index);
        }
      });
    }, { rootMargin: '0px 0px 100px 0px', threshold: 0.02 });
    observer.observe(section);
  }

  window.addEventListener('pointermove', event => {
    pointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });

  window.addEventListener('pageshow', () => {
    if (!built) return;
    agents.forEach(agent => agent.classList.add('is-idle'));
  });

  runIntro().catch(() => {
    root.classList.remove('swarm-build-pending', 'swarm-build-active');
    document.querySelectorAll('[data-swarm-hidden]').forEach(el => {
      el.style.visibility = '';
      el.removeAttribute('data-swarm-hidden');
    });
    agents.forEach(agent => agent.remove());
    status.remove();
  });
})();
