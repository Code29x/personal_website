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
const STAR_COUNT = 800;
const stars = Array.from({length: STAR_COUNT}, () => ({
  x: Math.random() * 2000 - 1000,
  y: Math.random() * 2000 - 1000,
  z: Math.random() * 2000,
  size: Math.random() * 2 + 0.3,
  color: ['#fff','#aef','#ffa','#faf','#aff'][Math.floor(Math.random()*5)],
  twinkle: Math.random() * Math.PI * 2,
  twinkleSpeed: 0.02 + Math.random() * 0.03,
}));

// Nebula clouds
const nebulae = Array.from({length: 6}, (_, i) => ({
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
  { x: W * 0.15, y: H * 0.25, r: 40, color: '#00ff88', ringColor: 'rgba(0,255,136,0.3)', ring: true, vx: 0.03, vy: 0.02, glow: '#00ff88' },
  { x: W * 0.85, y: H * 0.6, r: 28, color: '#ff006e', ring: false, vx: -0.04, vy: 0.015, glow: '#ff006e' },
  { x: W * 0.75, y: H * 0.15, r: 18, color: '#00d4ff', ring: false, vx: 0.02, vy: -0.03, glow: '#00d4ff' },
  { x: W * 0.1, y: H * 0.75, r: 22, color: '#ffee00', ring: false, vx: 0.035, vy: -0.02, glow: '#ffee00' },
];

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
setInterval(spawnShootingStar, 3000);

let t = 0;
let mouseX = W/2, mouseY = H/2;
window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function drawGalaxy() {
  ctx.clearRect(0, 0, W, H);

  // Space gradient
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H));
  bg.addColorStop(0, '#020818');
  bg.addColorStop(0.4, '#010510');
  bg.addColorStop(1, '#000');
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
  const speed = 0.5;
  stars.forEach(s => {
    s.z -= speed;
    if (s.z <= 0) s.z = 2000;
    s.twinkle += s.twinkleSpeed;
    const px = (s.x / s.z) * W + W / 2;
    const py = (s.y / s.z) * H + H / 2;
    if (px < 0 || px > W || py < 0 || py > H) return;
    const brightness = (1 - s.z / 2000);
    const twinkleAlpha = 0.5 + 0.5 * Math.sin(s.twinkle);
    const size = brightness * s.size * 2;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = brightness * twinkleAlpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // Planets
  planets.forEach((p, i) => {
    // Planet mouse repulsion and scaling
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let sizeM = 1;
    if (dist < 200) {
      const force = (200 - dist) / 200;
      p.x += (dx / dist) * force * 2; // gently push away
      p.y += (dy / dist) * force * 2;
      sizeM = 1 + force * 0.3; // increase size slightly on hover
    }

    p.x += p.vx * Math.sin(t * 0.001 + i);
    p.y += p.vy * Math.cos(t * 0.0008 + i);
    
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

    // Ring (for first planet)
    if (p.ring) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(1, 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, currentR * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = p.ringColor;
      ctx.lineWidth = 10 * sizeM;
      ctx.stroke();
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

for (let i = 0; i < 60; i++) {
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

chatbotToggle.addEventListener('click', () => {
  chatbotWindow.classList.add('open');
  chatbotToggle.style.transform = 'scale(0)';
  setTimeout(() => chatInput.focus(), 300);
});

chatbotClose.addEventListener('click', () => {
  chatbotWindow.classList.remove('open');
  chatbotToggle.style.transform = 'scale(1)';
});

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
    return "I am Vivek Sharma, a 17-year-old B.Tech CSE student at Lovely Professional University. My goal is to become a skilled software developer!";
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
    return "You can reach me via email at viveksharmacse@lpu.in or by using the contact form in the Contact section below!";
  }
  if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
    return "Hello! I'm Vivek's AI Assistant. You can ask me about his skills, projects, education, or how to contact him.";
  }
  
  // Fallback
  return "I will forward this message to Vivek.";
}

/* ─── LIGHTBOX LOGIC ─── */
function openLightbox(imgSrc, title = '', date = '', desc = '') {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  
  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-date').textContent = date;
  document.getElementById('lightbox-desc').textContent = desc;

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