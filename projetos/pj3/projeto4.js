const stage = document.getElementById('stage');
const heartsLayer = document.getElementById('heartsLayer');
const stageInfo = document.getElementById('stageInfo');

const shuffleBtn = document.getElementById('shuffleBtn');
const spreadBtn = document.getElementById('spreadBtn');
const centerBtn = document.getElementById('centerBtn');
const lockBtn = document.getElementById('lockBtn');
const addNoteBtn = document.getElementById('addNoteBtn');
const heartsBtn = document.getElementById('heartsBtn');

let highestZ = 1;
let draggableEnabled = true;
const papers = [];

const surpriseNotes = [
  'Voce e meu melhor acaso.',
  'Seu sorriso ilumina tudo.',
  'Com voce, tudo fica leve.',
  'Meu coracao sorri por voce.',
  'Cada dia eu gosto mais de nos.',
  'Seu abraco desacelera meu mundo.',
  'Te ver feliz ja melhora meu dia.',
  'Meu lugar seguro sempre foi voce.',
  'Com voce, ate silencio tem carinho.',
  'Te amar ficou simples e natural.',
  'Voce deixa tudo mais colorido.',
  'Seu jeitinho me ganha todo dia.',
  'Nosso amor e meu plano favorito.',
  'Quando voce sorri, tudo faz sentido.',
  'Eu escolheria voce em qualquer vida.'
];

let availableNotes = [...surpriseNotes];
let autoHeartsTimer = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomRotation(min = -14, max = 14) {
  return Math.round(Math.random() * (max - min) + min);
}

function updateAddNoteButton() {
  if (availableNotes.length === 0) {
    addNoteBtn.disabled = true;
    addNoteBtn.textContent = 'Sem frases novas';
    return;
  }

  addNoteBtn.disabled = false;
  addNoteBtn.textContent = `Novo recadinho (${availableNotes.length})`;
}

function getUniqueNote() {
  if (availableNotes.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * availableNotes.length);
  const [phrase] = availableNotes.splice(index, 1);
  return phrase;
}

function updateStageInfo() {
  stageInfo.textContent = `Papeis: ${papers.length}`;
}

function createHeart() {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = ['❤', '💗', '💖', '💕', '💞'][Math.floor(Math.random() * 5)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty('--time', `${4 + Math.random() * 2.2}s`);
  heartsLayer.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, 6800);
}

function burstHearts(amount = 20) {
  for (let i = 0; i < amount; i += 1) {
    window.setTimeout(createHeart, i * 80);
  }
}

function startAutoHearts() {
  if (autoHeartsTimer !== null) {
    return;
  }

  autoHeartsTimer = window.setInterval(() => {
    burstHearts(4);
  }, 1400);
}

function stopAutoHearts() {
  if (autoHeartsTimer === null) {
    return;
  }

  window.clearInterval(autoHeartsTimer);
  autoHeartsTimer = null;
}

class DraggablePaper {
  constructor(element) {
    this.element = element;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.dragging = false;
    this.pointerId = null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
  }

  setTransform() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
  }

  getBounds() {
    const stageRect = stage.getBoundingClientRect();
    const elRect = this.element.getBoundingClientRect();
    return {
      maxX: Math.max(0, stageRect.width - elRect.width),
      maxY: Math.max(0, stageRect.height - elRect.height)
    };
  }

  setCentered(rotation = 0) {
    const bounds = this.getBounds();
    this.x = bounds.maxX / 2;
    this.y = bounds.maxY / 2;
    this.rotation = rotation;
    this.setTransform();
  }

  setByPixel(x, y, rotation = this.rotation) {
    const bounds = this.getBounds();
    this.x = clamp(x, 0, bounds.maxX);
    this.y = clamp(y, 0, bounds.maxY);
    this.rotation = rotation;
    this.setTransform();
  }

  animateToPixel(x, y, rotation = this.rotation) {
    this.element.style.transition = 'transform 280ms ease';
    this.setByPixel(x, y, rotation);

    window.setTimeout(() => {
      this.element.style.transition = '';
    }, 300);
  }

  animateToCentered(rotation = this.rotation) {
    this.element.style.transition = 'transform 280ms ease';
    this.setCentered(rotation);

    window.setTimeout(() => {
      this.element.style.transition = '';
    }, 300);
  }

  bringToFront() {
    highestZ += 1;
    this.element.style.zIndex = String(highestZ);
  }

  onPointerDown(event) {
    if (!draggableEnabled) {
      return;
    }

    this.dragging = true;
    this.pointerId = event.pointerId;
    this.element.setPointerCapture(event.pointerId);
    this.bringToFront();

    const stageRect = stage.getBoundingClientRect();
    this.offsetX = event.clientX - stageRect.left - this.x;
    this.offsetY = event.clientY - stageRect.top - this.y;
  }

  onPointerMove(event) {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const bounds = this.getBounds();

    this.x = clamp(event.clientX - stageRect.left - this.offsetX, 0, bounds.maxX);
    this.y = clamp(event.clientY - stageRect.top - this.offsetY, 0, bounds.maxY);
    this.setTransform();
  }

  onPointerUp(event) {
    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.dragging = false;
    this.pointerId = null;
  }

  onDoubleClick() {
    this.rotation += 15;
    this.bringToFront();
    this.setTransform();
  }

  clampInsideStage() {
    const bounds = this.getBounds();
    this.x = clamp(this.x, 0, bounds.maxX);
    this.y = clamp(this.y, 0, bounds.maxY);
    this.setTransform();
  }

  setLockedState(locked) {
    this.element.classList.toggle('locked', locked);
  }

  init() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.element.addEventListener('dblclick', this.onDoubleClick);

    this.setCentered(randomRotation());
    this.bringToFront();
  }
}

function registerPaper(element) {
  const instance = new DraggablePaper(element);
  instance.init();
  papers.push(instance);
  updateStageInfo();
}

Array.from(stage.querySelectorAll('.paper')).forEach((paper) => {
  registerPaper(paper);
});

shuffleBtn.addEventListener('click', () => {
  papers.forEach((paper) => {
    paper.animateToCentered(randomRotation());
    paper.bringToFront();
  });
});

spreadBtn.addEventListener('click', () => {
  const total = papers.length;
  const stageRect = stage.getBoundingClientRect();
  const centerX = stageRect.width / 2;
  const centerY = stageRect.height / 2;
  const radiusX = Math.min(stageRect.width * 0.3, 220);
  const radiusY = Math.min(stageRect.height * 0.22, 170);

  papers.forEach((paper, index) => {
    const angle = total <= 1 ? 0 : (-65 + (130 / (total - 1)) * index) * (Math.PI / 180);
    const targetX = centerX + Math.cos(angle) * radiusX - paper.element.getBoundingClientRect().width / 2;
    const targetY = centerY + Math.sin(angle) * radiusY - paper.element.getBoundingClientRect().height / 2;

    paper.animateToPixel(targetX, targetY, randomRotation(-8, 8));
    paper.bringToFront();
  });
});

centerBtn.addEventListener('click', () => {
  papers.forEach((paper) => {
    paper.animateToCentered(randomRotation());
  });
});

lockBtn.addEventListener('click', () => {
  draggableEnabled = true;
  lockBtn.textContent = 'Arraste: Ligado';

  papers.forEach((paper) => {
    paper.setLockedState(false);
  });

  updateStageInfo();
});

addNoteBtn.addEventListener('click', () => {
  const phrase = getUniqueNote();
  if (!phrase) {
    updateAddNoteButton();
    return;
  }

  const note = document.createElement('article');
  note.className = 'paper mini-note';
  note.innerHTML = `<p>${phrase}</p>`;

  stage.appendChild(note);
  registerPaper(note);

  const instance = papers[papers.length - 1];
  const offsetX = (Math.random() - 0.5) * 70;
  const offsetY = (Math.random() - 0.5) * 40;
  const bounds = instance.getBounds();
  instance.animateToPixel(bounds.maxX / 2 + offsetX, bounds.maxY / 2 + offsetY, randomRotation());
  instance.bringToFront();

  updateAddNoteButton();
  burstHearts(10);
});

heartsBtn.addEventListener('click', () => {
  burstHearts(28);
});

window.addEventListener('resize', () => {
  papers.forEach((paper) => paper.clampInsideStage());
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'h') {
    burstHearts(18);
  }

  if (event.key.toLowerCase() === 's') {
    spreadBtn.click();
  }

  if (event.key.toLowerCase() === 'c') {
    centerBtn.click();
  }
});

startAutoHearts();
burstHearts(16);

window.addEventListener('beforeunload', stopAutoHearts);

updateStageInfo();
updateAddNoteButton();
