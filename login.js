const LOGIN_NAME = 'helena';
const LOGIN_PASSWORD = '02112024';
const LOGIN_KEY = 'menuLoginUnlocked';

const AVATAR_1 = 'login-assets/avatar1.png';
const AVATAR_2 = 'login-assets/avatar2.png';
const AVATAR_FALLBACK = 'login-assets/avatar.png';

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const togglePasswordIcon = document.getElementById('togglePasswordIcon');
const unlockBtn = document.getElementById('unlockBtn');

const avatarImg = document.getElementById('avatarImg');
const welcomeTitle = document.getElementById('welcomeTitle');
const subtitleText = document.getElementById('subtitleText');
const statusText = document.getElementById('statusText');
const loginCard = document.getElementById('loginCard');
const credentialsArea = document.getElementById('credentialsArea');
const loadingState = document.getElementById('loadingState');
const loadingText = document.getElementById('loadingText');

const marioScene = document.getElementById('marioScene');
const sceneProgress = document.getElementById('sceneProgress');

localStorage.removeItem(LOGIN_KEY);
sessionStorage.removeItem(LOGIN_KEY);

function setAvatar(path) {
  avatarImg.onerror = () => {
    avatarImg.onerror = null;
    avatarImg.src = AVATAR_FALLBACK;
  };
  avatarImg.src = path;
}

function setStatus(text, success = false) {
  statusText.textContent = text;
  statusText.classList.toggle('success', success);
}

function playMarioTransition() {
  marioScene.classList.add('active');

  const duration = 5200;
  const step = 80;
  let elapsed = 0;

  const timer = window.setInterval(() => {
    elapsed += step;
    const progress = Math.min(100, (elapsed / duration) * 100);
    sceneProgress.style.width = `${progress}%`;

    if (elapsed >= duration) {
      window.clearInterval(timer);
      document.body.classList.add('fade-out');

      window.setTimeout(() => {
        window.location.href = 'menu.html?fromLogin=1';
      }, 700);
    }
  }, step);
}

function validateLogin(name, password) {
  return name.trim().toLowerCase() === LOGIN_NAME.toLowerCase() && password === LOGIN_PASSWORD;
}

togglePassword.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePasswordIcon.textContent = showing ? 'visibility' : 'visibility_off';
  togglePassword.setAttribute('aria-label', showing ? 'Mostrar senha' : 'Ocultar senha');
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = usernameInput.value;
  const password = passwordInput.value;

  if (!validateLogin(name, password)) {
    setStatus('Nome ou senha incorretos. Tente de novo.');
    loginCard.classList.remove('shake');
    void loginCard.offsetWidth;
    loginCard.classList.add('shake');
    return;
  }

  sessionStorage.setItem(LOGIN_KEY, '1');
  localStorage.setItem(LOGIN_KEY, '1');

  unlockBtn.disabled = true;
  usernameInput.disabled = true;
  passwordInput.disabled = true;
  togglePassword.disabled = true;

  credentialsArea.classList.add('hidden');
  loadingState.hidden = false;
  loadingState.classList.add('visible');
  loadingText.textContent = 'Validando seu acesso...';
  setStatus('');

  const firstPhase = 3000;
  const secondPhase = 4000;

  window.setTimeout(() => {
    setAvatar(AVATAR_2);
    welcomeTitle.textContent = 'Bem vindo(a) Helena!';
    subtitleText.textContent = 'Carregando seu mundo...';
    loadingText.textContent = 'Preparando surpresa...';
  }, firstPhase);

  window.setTimeout(() => {
    playMarioTransition();
  }, firstPhase + secondPhase);
});

setAvatar(AVATAR_1);
