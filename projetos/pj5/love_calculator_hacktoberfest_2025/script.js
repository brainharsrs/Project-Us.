// Deterministic "love score" algorithm based on names (not random)
// This ensures same inputs always give same result — better for tests and fun repeatability.
function normalize(name){
  return (name||'').trim().toLowerCase();
}

function nameHash(s){
  // Simple hash: djb2 variation
  let h = 5381;
  for(let i=0;i<s.length;i++){
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

function loveScore(nameA, nameB){
  const a = normalize(nameA);
  const b = normalize(nameB);
  if(!a || !b) return null;
  const ha = nameHash(a);
  const hb = nameHash(b);
  // combine hashes and squeeze into 0-100
  const combined = (ha ^ hb) % 101;
  // add some weight from name lengths for variety
  const lenBoost = Math.min(10, Math.abs(a.length - b.length));
  return Math.max(0, Math.min(100, (combined + lenBoost)));
}

// Fun message based on ranges
function resultMessage(score){
  if(score >= 90) return "A cosmic match! 💫";
  if(score >= 75) return "Great pair — lots of sparks! ✨";
  if(score >= 50) return "Promising — could grow with care 💕";
  if(score >= 25) return "Take it slow — interesting dynamics ⚖️";
  return "Cute — maybe best friends? 🌱";
}

// Accessibility: announce via aria-live; keyboard friendly
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('love-form');
  const nameA = document.getElementById('nameA');
  const nameB = document.getElementById('nameB');
  const result = document.getElementById('result');
  const themeToggle = document.getElementById('theme-toggle');

  // theme persistence
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if(currentTheme === 'dark') document.documentElement.setAttribute('data-theme','dark');

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if(isDark){
      document.documentElement.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed','false');
      localStorage.setItem('theme','light');
    } else {
      document.documentElement.setAttribute('data-theme','dark');
      themeToggle.setAttribute('aria-pressed','true');
      localStorage.setItem('theme','dark');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const a = nameA.value;
    const b = nameB.value;
    // basic validation and sanitization
    if(!a.trim() || !b.trim()){
      result.textContent = "Please enter both names.";
      result.classList.add('show');
      return;
    }
    const score = loveScore(a,b);
    if(score === null){
      result.textContent = "Please enter valid names.";
      result.classList.add('show');
      return;
    }
    result.innerHTML = `<div aria-hidden="true">💖 <strong>${score}%</strong> 💖</div><div>${resultMessage(score)}</div>`;
    result.classList.add('show');
  });

  // keyboard shortcut: Enter in second field triggers calculate
  nameB.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      form.requestSubmit();
    }
  });

  // Register service worker for simple PWA (if supported)
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('assets/service-worker.js').catch(()=>{/*ignore*/});
  }
});
