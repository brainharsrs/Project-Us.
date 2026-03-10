const scene = document.getElementById('scene');
const dustLayer = document.getElementById('dustLayer');
const starLayer = document.getElementById('starLayer');
const phraseLayer = document.getElementById('phraseLayer');
const heartLayer = document.getElementById('heartLayer');

const romanticPhrases = [
  'Te amo',
  'Minha princesa',
  'Meu amor',
  'Linda demais',
  'Minha rainha',
  'Amor da minha vida',
  'Sempre voce',
  'Meu coracao e seu',
  'Meu lugar e voce',
  'Para sempre nos dois',
  'Meu sorriso e voce',
  'Te escolho todo dia',
  'Meu abraco favorito',
  'Meu futuro e com voce',
  'Minha paz e voce',
  'Saudade do seu beijo',
  'Voce me encanta',
  'Meu coracao acelera',
  'Meu brilho e voce',
  'Quero voce pra sempre',
  'Voce e meu lar',
  'Meu mundo tem seu nome',
  'Eu e voce ate o fim',
  'Meu sonho mais lindo',
  'Minha pessoa favorita',
  'Voce ilumina tudo',
  'Cada dia te amo mais',
  'Meu melhor acaso',
  'Minha metade perfeita',
  'Seu olhar me ganha',
  'Minha sorte e voce',
  'Seu carinho me cura',
  'Meu coracao e teu',
  'Voce e meu destino',
  'Meu tempo e com voce',
  'Seu amor me acalma',
  'Meu porto seguro',
  'Fica comigo pra sempre',
  'A melhor parte do meu dia e voce',
  'Seu nome mora no meu peito',
  'Voce e poesia viva',
  'Meu coracao sorri por voce',
  'Nos dois para sempre',
  'Seu sorriso me desmonta',
  'Meu universo e voce',
  'Nossa historia e linda',
  'Eu amo te amar',
  'Tudo fica melhor com voce',
  'Te quero perto de mim',
  'Minha escolha mais certa',
  'Com voce tudo tem cor',
  'Voce e meu ponto de paz',
  'Meu amor por voce so cresce',
  'Nao canso de te admirar',
  'Meu pensamento favorito e voce',
  'Voce e meu presente mais lindo',
  'Teu beijo e meu vicio bom',
  'Minha felicidade tem teu nome',
  'Com voce eu sou completo',
  'Eu sorrio so de te lembrar',
  'Meu coracao te escolheu'
];

const stars = [];
const dust = [];
const phrases = [];
const heartGlyphs = ['\u2764', '\uD83D\uDC97', '\uD83D\uDC96', '\uD83D\uDC95'];

let running = true;
let rafId = null;
let phraseBag = [];
let lastPhrase = '';
let heartTimer = null;

let camX = 0;
let camY = 0;
let targetCamX = 0;
let targetCamY = 0;
let lastPointerTs = 0;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getNextPhrase() {
  if (phraseBag.length === 0) {
    phraseBag = shuffle(romanticPhrases);
  }

  let next = phraseBag.pop();

  if (next === lastPhrase && phraseBag.length > 0) {
    const alt = phraseBag.pop();
    phraseBag.unshift(next);
    next = alt;
  }

  lastPhrase = next;
  return next;
}

function setCameraTargetFromPointer(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
  const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;

  targetCamX = clamp(nx, -1, 1);
  targetCamY = clamp(ny, -1, 1);
  lastPointerTs = performance.now();
}

function updateCamera(time) {
  const idleFor = performance.now() - lastPointerTs;

  if (idleFor > 1400) {
    targetCamX = Math.sin(time * 0.00022) * 0.24;
    targetCamY = Math.cos(time * 0.00018) * 0.2;
  }

  camX += (targetCamX - camX) * 0.05;
  camY += (targetCamY - camY) * 0.05;

  scene.style.setProperty('--cam-x', camX.toFixed(4));
  scene.style.setProperty('--cam-y', camY.toFixed(4));
}

function createStar() {
  const el = document.createElement('span');
  el.className = 'star';
  starLayer.appendChild(el);

  return {
    el,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    speedZ: 0,
    twinkle: rand(0.0028, 0.0085),
    baseOpacity: rand(0.45, 0.95)
  };
}

function createDust() {
  const el = document.createElement('span');
  el.className = 'dust';
  dustLayer.appendChild(el);

  return {
    el,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    speedZ: 0,
    pulse: rand(0.003, 0.007),
    baseOpacity: rand(0.18, 0.45)
  };
}

function createPhrase() {
  const el = document.createElement('span');
  el.className = 'phrase';
  phraseLayer.appendChild(el);

  return {
    el,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    speedZ: 0,
    sway: rand(0.0014, 0.0038),
    hue: rand(-12, 20),
    phase: rand(0, Math.PI * 2),
    waitFrames: Math.floor(rand(0, 260))
  };
}

function resetStar(star, near = false) {
  const angle = rand(0, Math.PI * 2);
  const radius = rand(4, 64);

  star.x = Math.cos(angle) * radius;
  star.y = Math.sin(angle) * radius * 0.7;
  star.z = near ? rand(-1200, -120) : rand(-4700, -1400);

  const force = rand(0.45, 1.7);
  star.vx = Math.cos(angle) * force;
  star.vy = Math.sin(angle) * force * 0.78;
  star.speedZ = rand(24, 58);

  const size = rand(1.1, 3.4);
  star.el.style.width = `${size}px`;
  star.el.style.height = `${size}px`;
}

function resetDust(item, near = false) {
  const angle = rand(0, Math.PI * 2);
  const radius = rand(8, 120);

  item.x = Math.cos(angle) * radius;
  item.y = Math.sin(angle) * radius * 0.7;
  item.z = near ? rand(-1000, -120) : rand(-3600, -1200);

  const force = rand(0.35, 1.2);
  item.vx = Math.cos(angle) * force;
  item.vy = Math.sin(angle) * force * 0.75;
  item.speedZ = rand(10, 24);

  const size = rand(2, 6.8);
  item.el.style.width = `${size}px`;
  item.el.style.height = `${size}px`;
}

function resetPhrase(phrase, near = false) {
  const angle = rand(0, Math.PI * 2);
  const radius = rand(70, 270);

  const text = getNextPhrase();
  phrase.el.textContent = text;
  phrase.el.dataset.text = text;

  phrase.x = Math.cos(angle) * radius;
  phrase.y = Math.sin(angle) * radius * 0.76;
  phrase.z = near ? rand(-2800, -1600) : rand(-9200, -5200);

  const force = rand(0.72, 1.65);
  phrase.vx = Math.cos(angle) * force;
  phrase.vy = Math.sin(angle) * force * 0.8;
  phrase.speedZ = rand(22, 40);
  phrase.sway = rand(0.0012, 0.0034);
  phrase.hue = rand(-16, 24);
  phrase.phase = rand(0, Math.PI * 2);
  phrase.waitFrames = near ? Math.floor(rand(60, 210)) : Math.floor(rand(170, 460));

  phrase.el.style.setProperty('--phrase-hue', `${phrase.hue.toFixed(2)}deg`);
  phrase.el.style.setProperty('--font-scale', `${rand(0.86, 1.22).toFixed(2)}`);
  phrase.el.classList.toggle('accent', Math.random() > 0.76);
}

function applyTransform(el, x, y, z, opacity, scale = 1) {
  el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
  el.style.opacity = `${opacity}`;
}

function spawnHeartBurst(amount = 12) {
  for (let i = 0; i < amount; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'love-heart';
    heart.textContent = heartGlyphs[Math.floor(Math.random() * heartGlyphs.length)];

    heart.style.setProperty('--heart-size', `${rand(0.95, 1.7)}rem`);
    heart.style.setProperty('--heart-time', `${rand(2.1, 3.2)}s`);
    heart.style.setProperty('--hx', `${rand(-420, 420)}px`);
    heart.style.setProperty('--hy', `${rand(-260, 210)}px`);
    heart.style.setProperty('--hz', `${rand(120, 520)}px`);

    heartLayer.appendChild(heart);

    window.setTimeout(() => {
      heart.remove();
    }, 3400);
  }
}

function animate(time) {
  if (!running) {
    return;
  }

  updateCamera(time);

  for (const star of stars) {
    const depth = clamp((star.z + 4700) / 4700, 0, 1);
    const spread = 0.55 + depth * 2.4;

    star.z += star.speedZ;
    star.x += star.vx * spread;
    star.y += star.vy * spread;

    if (star.z > 360 || Math.abs(star.x) > 2200 || Math.abs(star.y) > 1400) {
      resetStar(star, false);
    }

    const twinkle = 0.66 + Math.sin(time * star.twinkle) * 0.34;
    const opacity = clamp(depth * twinkle * star.baseOpacity, 0.03, 1);
    const scale = 0.38 + depth * 2.1;

    applyTransform(star.el, star.x, star.y, star.z, opacity, scale);
  }

  for (const d of dust) {
    const depth = clamp((d.z + 3600) / 3600, 0, 1);
    const spread = 0.45 + depth * 2.1;

    d.z += d.speedZ;
    d.x += d.vx * spread;
    d.y += d.vy * spread;

    if (d.z > 340 || Math.abs(d.x) > 1900 || Math.abs(d.y) > 1200) {
      resetDust(d, false);
    }

    const pulse = 0.7 + Math.sin(time * d.pulse) * 0.3;
    const opacity = clamp(depth * d.baseOpacity * pulse, 0.03, 0.8);
    const scale = 0.5 + depth * 1.6;

    applyTransform(d.el, d.x, d.y, d.z, opacity, scale);
  }

  for (const phrase of phrases) {
    if (phrase.waitFrames > 0) {
      phrase.waitFrames -= 1;
      phrase.el.style.opacity = '0';
      continue;
    }

    const depth = clamp((phrase.z + 9200) / 9200, 0, 1);
    const spread = 0.74 + depth * 4.25;

    phrase.z += phrase.speedZ;
    phrase.x += phrase.vx * spread + Math.sin(time * phrase.sway + phrase.phase) * 0.58;
    phrase.y += phrase.vy * spread + Math.cos(time * phrase.sway + phrase.phase) * 0.22;

    if (phrase.z > 360 || Math.abs(phrase.x) > 2600 || Math.abs(phrase.y) > 1550) {
      resetPhrase(phrase, false);
    }

    const flicker = 0.9 + Math.sin(time * phrase.sway * 1.8 + phrase.phase) * 0.1;
    const opacity = clamp((depth - 0.11) * 1.52 * flicker, 0, 1);
    const scale = 0.4 + depth * 2.6;

    applyTransform(phrase.el, phrase.x, phrase.y, phrase.z, opacity, scale);
  }

  rafId = window.requestAnimationFrame(animate);
}

function init() {
  for (let i = 0; i < 280; i += 1) {
    const star = createStar();
    resetStar(star, true);
    stars.push(star);
  }

  for (let i = 0; i < 130; i += 1) {
    const d = createDust();
    resetDust(d, true);
    dust.push(d);
  }

  for (let i = 0; i < 10; i += 1) {
    const phrase = createPhrase();
    resetPhrase(phrase, true);
    phrases.push(phrase);
  }

  heartTimer = window.setInterval(() => {
    spawnHeartBurst(9);
  }, 5200);

  window.setTimeout(() => {
    spawnHeartBurst(12);
  }, 1200);

  rafId = window.requestAnimationFrame(animate);
}

window.addEventListener('beforeunload', () => {
  running = false;
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
  }
  if (heartTimer !== null) {
    window.clearInterval(heartTimer);
  }
});

scene.addEventListener('pointermove', (event) => {
  setCameraTargetFromPointer(event.clientX, event.clientY);
});

scene.addEventListener('pointerleave', () => {
  targetCamX = 0;
  targetCamY = 0;
});

scene.addEventListener('touchmove', (event) => {
  if (event.touches && event.touches[0]) {
    setCameraTargetFromPointer(event.touches[0].clientX, event.touches[0].clientY);
  }
}, { passive: true });

scene.addEventListener('touchend', () => {
  targetCamX = 0;
  targetCamY = 0;
});

scene.addEventListener('click', () => {
  for (const phrase of phrases) {
    phrase.z += rand(420, 640);
  }
  spawnHeartBurst(16);
  lastPointerTs = performance.now();
});

init();