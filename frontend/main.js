const IS_EDGE_BROWSER = /\bEdg\//.test(navigator.userAgent);
if (IS_EDGE_BROWSER) {
  document.body.classList.add('is-edge');
}

/* ─── CURSOR ─── */
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let cx = mx, cy = my;
let rx = mx, ry = my;

cursor.style.left = '0px'; cursor.style.top = '0px';
cursorRing.style.left = '0px'; cursorRing.style.top = '0px';

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
});

function animCursor() {
  cx += (mx - cx) * 0.4;
  cy += (my - cy) * 0.4;
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
  
  requestAnimationFrame(animCursor);
}
animCursor();

/* ─── HERO TYPEWRITER ─── */
const heroTypewriter = document.getElementById('hero-typewriter');
if (heroTypewriter) {
  const typePhrases = ['Vivek Sharma', 'Aspiring Software Developer'];
  const typingSpeed = 90;
  const pauseAfterType = 280; // 0.28 second delay
  const pauseAfterDelete = 140;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function runTypewriter() {
    const current = typePhrases[phraseIndex];

    if (!isDeleting) {
      charIndex++;
      heroTypewriter.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(runTypewriter, pauseAfterType);
        return;
      }
      setTimeout(runTypewriter, typingSpeed);
      return;
    }

    // Cover/clear the whole sentence in one shot (no letter-by-letter delete).
    heroTypewriter.textContent = '';
    charIndex = 0;
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typePhrases.length;
    setTimeout(runTypewriter, pauseAfterDelete);
  }

  runTypewriter();
}

document.querySelectorAll('a, button, .skill-card, .project-card, .stat-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursorRing.style.width = '60px';
    cursorRing.style.height = '60px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
    cursorRing.style.width = '40px';
    cursorRing.style.height = '40px';
  });
});

/* ─── GALAXY CANVAS ─── */
const canvas = document.getElementById('galaxy-canvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Stars
const STAR_COUNT = IS_EDGE_BROWSER ? 700 : 1350;
const STAR_INTERACTION_RADIUS = 170;
const stars = Array.from({length: STAR_COUNT}, () => ({
  x: Math.random() * 2000 - 1000,
  y: Math.random() * 2000 - 1000,
  z: Math.random() * 2000,
  size: Math.random() * 0.75 + 0.08,
  color: ['#ffffff','#f4f8ff','#e8f0ff','#fff6df','#dff4ff'][Math.floor(Math.random()*5)],
  twinkle: Math.random() * Math.PI * 2,
  twinkleSpeed: 0.02 + Math.random() * 0.03,
  driftX: (Math.random() - 0.5) * 0.2,
  driftY: (Math.random() - 0.5) * 0.2,
  offsetX: 0,
  offsetY: 0,
}));

// Nebula clouds
const NEBULA_COUNT = IS_EDGE_BROWSER ? 4 : 6;
const nebulae = Array.from({length: NEBULA_COUNT}, (_, i) => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: 150 + Math.random() * 300,
  hue: [160, 200, 280, 340, 60, 120][i],
  alpha: 0.04 + Math.random() * 0.06,
  vx: (Math.random() - 0.5) * 0.1,
  vy: (Math.random() - 0.5) * 0.1,
}));

// Planets
const planets = [
  {
    x: W * 0.15, y: H * 0.25, r: 58, color: '#78a1b3', ringColor: 'rgba(210,225,235,0.34)',
    ring: true, ringTilt: 0.34, ringRotation: 0, ringSpeed: 0.006, ringBands: 3,
    vx: 0.03, vy: 0.02, glow: '#9fc7db'
  },
  { x: W * 0.85, y: H * 0.6, r: 42, color: '#b07a63', ring: false, vx: -0.04, vy: 0.015, glow: '#d59c82' },
  {
    x: W * 0.75, y: H * 0.15, r: 30, color: '#7f90a8', ring: true, ringColor: 'rgba(190,206,226,0.3)',
    ringTilt: 0.5, ringRotation: Math.PI / 4, ringSpeed: -0.01, ringBands: 2,
    vx: 0.02, vy: -0.03, glow: '#a8b7cc'
  },
  { x: W * 0.1, y: H * 0.75, r: 34, color: '#9a8f6b', ring: false, vx: 0.035, vy: -0.02, glow: '#c5b88e' },
  { x: W * 0.62, y: H * 0.78, r: 26, color: '#7f6a7a', ring: false, vx: -0.022, vy: 0.018, glow: '#b094a9' },
  {
    x: W * 0.28, y: H * 0.12, r: 24, color: '#6e8b79', ring: true, ringColor: 'rgba(188,210,198,0.3)',
    ringTilt: 0.62, ringRotation: Math.PI / 3, ringSpeed: 0.008, ringBands: 2,
    vx: 0.018, vy: 0.02, glow: '#98b8a5'
  },
];
planets.forEach((p) => {
  p.homeX = p.x;
  p.homeY = p.y;
  p.motionVX = 0;
  p.motionVY = 0;
  p.textureSeed = Math.random() * 1000;
});

// Shooting stars
let shootingStars = [];
function spawnShootingStar() {
  shootingStars.push({
    x: Math.random() * W,
    y: Math.random() * H * 0.5,
    len: 80 + Math.random() * 120,
    speed: 8 + Math.random() * 10,
    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
    life: 1,
    color: ['#00ff88','#00d4ff','#ff006e','#fff'][Math.floor(Math.random()*4)],
  });
}
setInterval(spawnShootingStar, IS_EDGE_BROWSER ? 4800 : 3000);

let t = 0;
let mouseX = W/2, mouseY = H/2;
let isMouseActive = false;
let mouseIdleTimer = null;
let isStarHoldActive = false;
let activePlanet = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastDragX = 0;
let lastDragY = 0;
let lastDragTs = 0;
let throwVX = 0;
let throwVY = 0;
window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  isMouseActive = true;
  if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
  mouseIdleTimer = setTimeout(() => {
    isMouseActive = false;
  }, 120);

  if (activePlanet) {
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTs);
    const nx = e.clientX + dragOffsetX;
    const ny = e.clientY + dragOffsetY;
    throwVX = (nx - lastDragX) / dt * 16;
    throwVY = (ny - lastDragY) / dt * 16;
    activePlanet.x = nx;
    activePlanet.y = ny;
    lastDragX = nx;
    lastDragY = ny;
    lastDragTs = now;
  }
});
window.addEventListener('mousedown', (e) => {
  isStarHoldActive = true;
  let nearest = null;
  let minDist = Infinity;
  planets.forEach((p) => {
    const dx = p.x - e.clientX;
    const dy = p.y - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < p.r * 1.6 && dist < minDist) {
      nearest = p;
      minDist = dist;
    }
  });
  if (!nearest) return;
  activePlanet = nearest;
  dragOffsetX = nearest.x - e.clientX;
  dragOffsetY = nearest.y - e.clientY;
  lastDragX = nearest.x;
  lastDragY = nearest.y;
  lastDragTs = performance.now();
  throwVX = 0;
  throwVY = 0;
});
window.addEventListener('mouseup', () => {
  isStarHoldActive = false;
  if (!activePlanet) return;
  activePlanet.motionVX = throwVX;
  activePlanet.motionVY = throwVY;
  activePlanet = null;
});

function drawGalaxy() {
  ctx.clearRect(0, 0, W, H);

  // Space gradient
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
  bg.addColorStop(0, '#09235a');
  bg.addColorStop(0.45, '#04143c');
  bg.addColorStop(1, '#020b24');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Nebulae
  nebulae.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < -300) n.x = W + 300;
    if (n.x > W + 300) n.x = -300;
    if (n.y < -300) n.y = H + 300;
    if (n.y > H + 300) n.y = -300;
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    g.addColorStop(0, `hsla(${n.hue}, 100%, 60%, ${n.alpha})`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Galaxy spiral
  const cx = W/2 + (mouseX - W/2) * 0.02;
  const cy = H/2 + (mouseY - H/2) * 0.02;
  for (let arm = 0; arm < 3; arm++) {
    for (let i = 0; i < 80; i++) {
      const angle = (i / 30) * Math.PI + (arm * Math.PI * 2 / 3) + t * 0.002;
      const r = i * 5;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.45;
      const alpha = (1 - i / 80) * 0.6;
      const size = (1 - i / 80) * 2.5;
      const hue = 160 + arm * 60 + i;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
      ctx.fill();
    }
  }

  // Stars (starfield with perspective)
  const speed = 0.26;
  const maxDepth = 4200;
  stars.forEach(s => {
    s.z -= speed;
    if (s.z <= 0) {
      s.z = maxDepth;
      s.x = Math.random() * 2400 - 1200;
      s.y = Math.random() * 2400 - 1200;
    }
    s.twinkle += s.twinkleSpeed;
    s.x += s.driftX;
    s.y += s.driftY;
    if (s.x < -1000 || s.x > 1000) s.driftX *= -1;
    if (s.y < -1000 || s.y > 1000) s.driftY *= -1;

    let px = (s.x / s.z) * W + W / 2 + s.offsetX;
    let py = (s.y / s.z) * H + H / 2 + s.offsetY;
    if (px < 0 || px > W || py < 0 || py > H) return;

    if (isStarHoldActive) {
      const holdDx = mouseX - px;
      const holdDy = mouseY - py;
      const holdDist = Math.sqrt(holdDx * holdDx + holdDy * holdDy) || 1;
      const holdRadius = STAR_INTERACTION_RADIUS * 2.4;
      if (holdDist < holdRadius) {
        const pull = (holdRadius - holdDist) / holdRadius;
        s.offsetX += (holdDx / holdDist) * pull * 4.4;
        s.offsetY += (holdDy / holdDist) * pull * 4.4;
        px += (holdDx / holdDist) * pull * 1.1;
        py += (holdDy / holdDist) * pull * 1.1;
      }
    } else if (isMouseActive) {
      const dx = px - mouseX;
      const dy = py - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < STAR_INTERACTION_RADIUS) {
        const force = (STAR_INTERACTION_RADIUS - dist) / STAR_INTERACTION_RADIUS;
        s.offsetX += (dx / dist) * force * 2.8;
        s.offsetY += (dy / dist) * force * 2.8;
      }
    }

    // Ease stars back to their normal path when cursor is away.
    s.offsetX *= isStarHoldActive ? 0.9 : 0.94;
    s.offsetY *= isStarHoldActive ? 0.9 : 0.94;

    const brightness = Math.max(0, 1 - s.z / maxDepth);
    const twinkleAlpha = 0.5 + 0.5 * Math.sin(s.twinkle);
    const size = Math.max(0.09, brightness * s.size * 2.4);
    const glowSize = size * (2.4 + brightness * 2.4);

    ctx.beginPath();
    ctx.arc(px, py, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = brightness * twinkleAlpha * 0.2;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = 0.34 + brightness * twinkleAlpha * 1.2;
    ctx.fill();
    if (size > 0.26) {
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = 0.08 + brightness * twinkleAlpha * 0.2;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(px - size * 3.2, py);
      ctx.lineTo(px + size * 3.2, py);
      ctx.moveTo(px, py - size * 3.2);
      ctx.lineTo(px, py + size * 3.2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  // Planets
  planets.forEach((p, i) => {
    if (activePlanet === p) {
      const currentR = p.r;
      p.x = Math.max(currentR, Math.min(W - currentR, p.x));
      p.y = Math.max(currentR, Math.min(H - currentR, p.y));
    }
    // Planet mouse repulsion and scaling
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    let sizeM = 1;
    if (activePlanet !== p && dist < 200) {
      const force = (200 - dist) / 200;
      p.x += (dx / dist) * force * 1.8;
      p.y += (dy / dist) * force * 1.8;
      sizeM = 1 + force * 0.28;
    } else if (activePlanet !== p && dist < 380) {
      const pull = (380 - dist) / 380;
      p.x -= (dx / dist) * pull * 0.2;
      p.y -= (dy / dist) * pull * 0.2;
    }

    if (activePlanet !== p) {
      p.x += p.vx * Math.sin(t * 0.001 + i);
      p.y += p.vy * Math.cos(t * 0.0008 + i);
      p.x += p.motionVX;
      p.y += p.motionVY;
      p.motionVX *= 0.97;
      p.motionVY *= 0.97;
      p.motionVX += (p.homeX - p.x) * 0.0026;
      p.motionVY += (p.homeY - p.y) * 0.0026;
    }
    
    const currentR = p.r * sizeM;

    if (p.x < currentR) { p.x = currentR; p.vx *= -1; }
    if (p.x > W - currentR) { p.x = W - currentR; p.vx *= -1; }
    if (p.y < currentR) { p.y = currentR; p.vy *= -1; }
    if (p.y > H - currentR) { p.y = H - currentR; p.vy *= -1; }

    // Glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentR * 3.5);
    glow.addColorStop(0, p.glow + '55');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, currentR * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Planet body
    const grad = ctx.createRadialGradient(p.x - currentR*0.3, p.y - currentR*0.3, currentR*0.1, p.x, p.y, currentR);
    grad.addColorStop(0, '#fff8');
    grad.addColorStop(0.3, p.color);
    grad.addColorStop(1, p.color + '44');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
    ctx.fill();

    for (let b = 0; b < 7; b++) {
      const bandY = (Math.sin(t * 0.003 + p.textureSeed + b * 1.4) * 0.28) * currentR;
      const bandR = currentR * (0.86 - b * 0.08);
      if (bandR <= 0) continue;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + bandY, bandR, Math.max(2, bandR * 0.22), 0, 0, Math.PI * 2);
      ctx.fillStyle = b % 2 === 0 ? '#ffffff14' : '#0000001a';
      ctx.fill();
    }
    // Ring (for ringed planets)
    if (p.ring) {
      p.ringRotation += (p.ringSpeed || 0.005);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ringRotation);
      ctx.scale(1, p.ringTilt || 0.35);
      const bandCount = p.ringBands || 2;
      for (let band = 0; band < bandCount; band++) {
        const ringRadius = currentR * (1.45 + band * 0.24);
        const ringW = Math.max(1.5, currentR * (0.065 - band * 0.01));
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRadius, ringRadius, 0, Math.PI, 2 * Math.PI);
        ctx.strokeStyle = p.ringColor || 'rgba(255,255,255,0.25)';
        ctx.lineWidth = ringW;
        ctx.globalAlpha = 0.34 - band * 0.08;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRadius, ringRadius, 0, 0, Math.PI);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = ringW * 0.55;
        ctx.globalAlpha = 0.16 - band * 0.04;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  });

  // Shooting stars
  shootingStars = shootingStars.filter(s => s.life > 0);
  shootingStars.forEach(s => {
    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.life -= 0.025;
    const tailX = s.x - Math.cos(s.angle) * s.len;
    const tailY = s.y - Math.sin(s.angle) * s.len;
    const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, s.color);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = s.life;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  t++;
  requestAnimationFrame(drawGalaxy);
}
drawGalaxy();

/* ─── ANTIGRAVITY PARTICLES ─── */
const particleContainer = document.getElementById('particles-container');
const PARTICLE_COLORS = ['#00ff88','#00d4ff','#ff006e','#ffee00','#ff3333','#bf5fff'];
const particleData = [];

const PARTICLE_COUNT = IS_EDGE_BROWSER ? 28 : 60;
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const p = document.createElement('div');
  const size = 3 + Math.random() * 6;
  const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  p.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    box-shadow: 0 0 ${size * 2}px ${color};
    pointer-events: none;
  `;
  particleContainer.appendChild(p);
  particleData.push({
    el: p,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6 - 0.3,
    ax: 0, ay: 0,
    size,
    color,
    mass: size * 2,
  });
}

let pmx = window.innerWidth / 2, pmy = window.innerHeight / 2;
window.addEventListener('mousemove', e => { pmx = e.clientX; pmy = e.clientY; });

function animParticles() {
  particleData.forEach(p => {
    const dx = pmx - p.x;
    const dy = pmy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Antigravity: repel from mouse when close, else float
    if (dist < 150) {
      const force = (150 - dist) / 150 * 2;
      p.ax = -(dx / dist) * force;
      p.ay = -(dy / dist) * force;
    } else {
      p.ax = (Math.random() - 0.5) * 0.04;
      p.ay = -0.05 + (Math.random() - 0.5) * 0.04; // slight upward drift
    }

    p.vx += p.ax;
    p.vy += p.ay;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) { p.x = 0; p.vx *= -1; }
    if (p.x > window.innerWidth) { p.x = window.innerWidth; p.vx *= -1; }
    if (p.y < 0) { p.y = 0; p.vy *= -1; }
    if (p.y > window.innerHeight) { p.y = window.innerHeight; p.vy *= -1; }

    p.el.style.left = p.x + 'px';
    p.el.style.top = p.y + 'px';
  });
  requestAnimationFrame(animParticles);
}
animParticles();

/* ─── SCROLL REVEAL ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const certificateCards = document.querySelectorAll('#certificates .cert-card');
if (certificateCards.length) {
  const triggerCertificatePop = () => {
    certificateCards.forEach((card, idx) => {
      card.classList.remove('cert-pop-visible');
      card.style.setProperty('--cert-delay', `${idx * 130}ms`);
      setTimeout(() => card.classList.add('cert-pop-visible'), idx * 130);
    });
  };
  setTimeout(triggerCertificatePop, 350);
  if (!IS_EDGE_BROWSER) {
    setInterval(triggerCertificatePop, 5600);
  }
}

const certificatesGrid = document.querySelector('.certificates-grid');
if (certificatesGrid) {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  const beginDrag = (clientX) => {
    isDragging = true;
    certificatesGrid.classList.add('dragging');
    startX = clientX;
    startScrollLeft = certificatesGrid.scrollLeft;
  };
  const moveDrag = (clientX) => {
    if (!isDragging) return;
    const walk = (clientX - startX) * 1.2;
    certificatesGrid.scrollLeft = startScrollLeft - walk;
  };
  const endDrag = () => {
    isDragging = false;
    certificatesGrid.classList.remove('dragging');
  };
  certificatesGrid.addEventListener('mousedown', (e) => beginDrag(e.clientX));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
  window.addEventListener('mouseup', endDrag);
  certificatesGrid.addEventListener('mouseleave', endDrag);
  certificatesGrid.addEventListener('touchstart', (e) => beginDrag(e.touches[0].clientX), { passive: true });
  certificatesGrid.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX), { passive: true });
  certificatesGrid.addEventListener('touchend', endDrag);
}

/* ─── ACTIVE NAV ─── */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a:not(.nav-logo)');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

/* ─── CONTACT FORM LOGIC ─── */
function handleContactSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn-text');
  const status = document.getElementById('form-status');
  
  // Basic validation
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const message = document.getElementById('contact-message').value;
  
  if(!name || !email || !message) return;

  // Loading state
  const originalBtnContent = btn.innerHTML;
  btn.innerHTML = '<span>Sending...</span> <i class="fas fa-circle-notch fa-spin"></i>';
  btn.style.opacity = '0.8';
  btn.style.pointerEvents = 'none';

  // Simulate Network Request / EmailJS send
  setTimeout(() => {
    // Reset btn
    btn.innerHTML = originalBtnContent;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';

    // Show success msg
    status.textContent = "Message sent successfully!";
    status.className = "form-status success";
    
    // Reset form
    document.getElementById('contact-form').reset();

    // Hide status after 5s
    setTimeout(() => {
      status.style.opacity = '0';
      setTimeout(() => { status.className = "form-status"; status.textContent = ""; }, 300);
    }, 5000);
  }, 1500);
}

/* ─── AI CHATBOT LOGIC ─── */
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatMessages = document.getElementById('chatbot-messages');
const chatInput = document.getElementById('chat-input-field');
let chatbotIdleTimer = null;
const CHATBOT_IDLE_MS = 15000;

function closeChatbot() {
  chatbotWindow.classList.remove('open');
  chatbotToggle.style.transform = 'scale(1)';
}

function resetChatbotIdleTimer() {
  if (chatbotIdleTimer) clearTimeout(chatbotIdleTimer);
  chatbotIdleTimer = setTimeout(() => {
    closeChatbot();
  }, CHATBOT_IDLE_MS);
}

chatbotToggle.addEventListener('click', () => {
  chatbotToggle.style.transform = 'scale(0)';
  // Pop up again after 0.2s as requested.
  setTimeout(() => {
    chatbotWindow.classList.add('open');
    chatInput.focus();
    resetChatbotIdleTimer();
  }, 200);
});

chatbotClose.addEventListener('click', () => {
  closeChatbot();
});

chatbotWindow.addEventListener('mousemove', resetChatbotIdleTimer);
chatbotWindow.addEventListener('click', resetChatbotIdleTimer);
chatbotWindow.addEventListener('keydown', resetChatbotIdleTimer);

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatEnter(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

function sendQuickMessage(text) {
  chatInput.value = text;
  sendChatMessage();
}

function sendChatMessage() {
  const val = chatInput.value.trim();
  if (!val) return;
  resetChatbotIdleTimer();
  
  // Append User message
  appendMessage(val, 'user');
  chatInput.value = '';

  // Simulate typing delay
  setTimeout(() => {
    const reply = getAIResponse(val.toLowerCase());
    appendMessage(reply, 'bot');
  }, 600 + Math.random() * 400);
}

function getAIResponse(input) {
  if (input.includes('who') || input.includes('about') || input.includes('name')) {
    return "I am Vivek Sharma, an 18-year-old B.Tech CSE student at Lovely Professional University. My goal is to become a skilled software developer!";
  }
  if (input.includes('project') || input.includes('built') || input.includes('made')) {
    return "I have built a Student Marks Portal featuring a login system, marks search by registration number, and an admin view. I focus on responsive, dynamic web applications.";
  }
  if (input.includes('skill') || input.includes('know') || input.includes('tech')) {
    return "My skills include C, Python, HTML, CSS, and JavaScript. My core strengths are problem-solving, consistency, and a strong learning mindset.";
  }
  if (input.includes('education') || input.includes('study') || input.includes('university') || input.includes('college') || input.includes('lpu')) {
    return "I am currently pursuing my B.Tech in Computer Science Engineering at Lovely Professional University (LPU).";
  }
  if (input.includes('contact') || input.includes('email') || input.includes('reach') || input.includes('hire')) {
    return "You can reach me via email at viveklpu008@gmail.com or by using the contact form in the Contact section below!";
  }
  if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
    return "Hello! I'm Vivek's AI Assistant. You can ask me about his skills, projects, education, or how to contact him.";
  }
  
  // Fallback
  return "I will forward this message to Vivek.";
}

/* ─── LIGHTBOX LOGIC ─── */
function getCertificateFallback(title = 'Certificate') {
  const safeText = encodeURIComponent(title || 'Certificate');
  return `https://via.placeholder.com/1200x760/1a1a2e/00ff88?text=${safeText}`;
}

function openLightbox(imgSrc, title = '', date = '', desc = '') {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  
  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-date').textContent = date;
  document.getElementById('lightbox-desc').textContent = desc;

  img.onerror = () => {
    img.onerror = null;
    img.src = getCertificateFallback(title);
  };
  img.src = imgSrc;
  modal.classList.add('show');
}

function closeLightbox(e) {
  // Only close if clicking the background or the close button
  if (e.target.id === 'lightbox-modal' || e.target.classList.contains('lightbox-close')) {
    document.getElementById('lightbox-modal').classList.remove('show');
  }
}

// Global escape key listener to close lightbox
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('lightbox-modal');
    if (modal && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  }
});