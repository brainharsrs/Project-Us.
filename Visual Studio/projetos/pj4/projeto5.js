const openBtn = document.getElementById('openBtn');
const loveCard = document.getElementById('loveCard');
const pageTitle = document.getElementById('pageTitle');
const pageCounter = document.getElementById('pageCounter');
const pageBody = document.getElementById('pageBody');
const dotsWrap = document.getElementById('dots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const randomBtn = document.getElementById('randomBtn');
const autoBtn = document.getElementById('autoBtn');
const floatingHearts = document.getElementById('floatingHearts');

const pages = [
  {
    title: 'Pagina 1 - Comeco',
    lines: [
      'Tudo ficou mais bonito depois que voce chegou.',
      'Seu jeito virou paz no meio dos meus dias.',
      'O primeiro sorriso seu ja foi suficiente pra me ganhar.'
    ]
  },
  {
    title: 'Pagina 2 - Pequenos detalhes',
    lines: [
      'Eu amo como voce cuida de mim sem perceber.',
      'Seu olhar acalma qualquer bagunca aqui dentro.',
      'Cada detalhe seu me faz te admirar mais.'
    ]
  },
  {
    title: 'Pagina 3 - Nosso riso',
    lines: [
      'Nossas risadas juntas sao meu som favorito.',
      'Com voce, ate os dias comuns viram lembrancas lindas.',
      'Voce transforma qualquer momento em carinho.'
    ]
  },
  {
    title: 'Pagina 4 - Meu carinho',
    lines: [
      'Quero te lembrar todos os dias o quanto voce e especial.',
      'Eu te escolheria de novo em todas as versões da vida.',
      'Seu abraco sempre parece casa.'
    ]
  },
  {
    title: 'Pagina 5 - Nosso futuro',
    lines: [
      'Sonhar com voce deixou de ser plano e virou vontade real.',
      'Quero viver muitos capitulos ao seu lado.',
      'Nosso amor ainda tem muita pagina bonita pela frente.'
    ]
  },
  {
    title: 'Pagina 6 - Sempre voce',
    lines: [
      'Entre tantas escolhas, meu coracao sempre escolhe voce.',
      'Obrigada por existir do jeitinho que existe.',
      'Te amar e uma das coisas mais leves da minha vida.'
    ]
  }
];

const surpriseLines = [
  'Voce e meu melhor acaso.',
  'Seu sorriso e meu ponto fraco.',
  'Cada dia com voce vale por mil.',
  'Meu coracao fica em festa quando te ve.',
  'Eu te amo nos detalhes.'
];

let currentPage = 0;
let autoMode = false;
let autoTimer = null;

function createDots() {
  dotsWrap.innerHTML = '';
  pages.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir para pagina ${index + 1}`);
    dot.addEventListener('click', () => {
      goToPage(index);
    });
    dotsWrap.appendChild(dot);
  });
}

function renderPage() {
  const page = pages[currentPage];
  pageTitle.textContent = page.title;
  pageCounter.textContent = `${currentPage + 1}/${pages.length}`;

  const list = document.createElement('ul');
  page.lines.forEach((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    list.appendChild(item);
  });

  pageBody.innerHTML = '';
  pageBody.appendChild(list);

  const dots = Array.from(dotsWrap.children);
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage);
  });

  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === pages.length - 1;
}

function goToPage(index) {
  currentPage = Math.max(0, Math.min(pages.length - 1, index));
  renderPage();
  burstHearts(8);
}

function addSurprise() {
  const surprise = document.createElement('div');
  surprise.className = 'surprise';
  surprise.textContent = `Frase surpresa: ${surpriseLines[Math.floor(Math.random() * surpriseLines.length)]}`;
  pageBody.appendChild(surprise);
  burstHearts(12);
}

function createHeart() {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = ['❤', '💗', '💕', '💖', '💞'][Math.floor(Math.random() * 5)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty('--t', `${4 + Math.random() * 2.5}s`);
  floatingHearts.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, 6800);
}

function burstHearts(amount = 10) {
  for (let i = 0; i < amount; i += 1) {
    window.setTimeout(createHeart, i * 80);
  }
}

function setAutoMode(active) {
  autoMode = active;
  autoBtn.textContent = `Auto: ${autoMode ? 'Ligado' : 'Desligado'}`;

  if (autoTimer) {
    window.clearInterval(autoTimer);
    autoTimer = null;
  }

  if (autoMode) {
    autoTimer = window.setInterval(() => {
      if (currentPage >= pages.length - 1) {
        goToPage(0);
      } else {
        goToPage(currentPage + 1);
      }
    }, 3200);
  }
}

openBtn.addEventListener('click', () => {
  loveCard.classList.add('open');
  openBtn.style.display = 'none';
  burstHearts(16);
});

prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
randomBtn.addEventListener('click', addSurprise);
autoBtn.addEventListener('click', () => setAutoMode(!autoMode));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    goToPage(currentPage - 1);
  }

  if (event.key === 'ArrowRight') {
    goToPage(currentPage + 1);
  }
});

createDots();
renderPage();

window.setInterval(() => {
  createHeart();
}, 2200);


