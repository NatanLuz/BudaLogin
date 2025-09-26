// elementos
const email = document.getElementById('email');
const password = document.getElementById('password');
const nickname = document.getElementById('nickname');
const captchaInput = document.getElementById('captcha-input');
const submit = document.getElementById('submit');
const message = document.getElementById('message');
const form = document.getElementById('worst-form');
const rulesList = document.getElementById('rules-list');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

let captchaAnswer = null;
let captchaTimestamp = null;

// regex números romanos
const ROMAN_REGEX = /\bM{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/;

// regex simbolos especiais
const SPECIAL_REGEX = /[!@#\$%\^&\*\(\)_\+\-=\[\]{};':"\\|,.<>\/?]/;

// regras
const rules = [
  { id:'double-digit', text: 'Senha deve ter pelo menos um número duplo', check: p => /([0-9])\1/.test(p) },
  { id:'year', text: 'Senha deve conter o ano atual', check: p => p.includes(String(new Date().getFullYear())) },
  { id:'minutes', text: 'Senha deve conter minutos atuais', check: p => {
      const m = new Date().getMinutes();
      const mm = String(m).padStart(2,'0');
      return p.includes(String(m)) || p.includes(mm);
    }
  },
  { id:'length', text: 'Senha menor que 13 caracteres', check: p => p.length > 0 && p.length < 13 },
  { id:'nickname-roman', text: 'Apelido deve conter número romano', check: () => ROMAN_REGEX.test(nickname.value.toUpperCase()) },
  { id:'nickname-uppercase', text: 'Apelido deve começar com maiúscula', check: () => /^[A-Z]/.test(nickname.value) },
  { id:'password-symbol', text: 'Senha deve terminar com símbolo especial', check: p => SPECIAL_REGEX.test(p[p.length-1]) },
  { id:'password-no-repeats', text: 'Senha não pode ter letras repetidas consecutivas', check: p => !/(.)\1/.test(p) },
  { id:'email-domain', text: 'Email deve terminar com .com, .net ou .org', check: e => /\.(com|net|org)$/.test(email.value) },
  { id:'email-min-length', text: 'Email deve ter ao menos 3 letras antes do @', check: e => /^[^@]{3,}@/.test(email.value) },
  { id:'captcha', text: 'Captcha resolvido', check: () => captchaSolved() }
];

// render checklist
function renderRules() {
  rulesList.innerHTML = '';
  rules.forEach(r => {
    const li = document.createElement('li');
    const ok = r.check(password.value);
    li.className = ok ? 'rule-good' : 'rule-bad';
    li.id = 'rule-' + r.id;
    li.innerHTML = `<span>${r.text}</span><strong>${ok ? '✓' : '✕'}</strong>`;
    rulesList.appendChild(li);
  });
}

// captcha troll
function buildCaptcha() {
  const a = Math.floor(Math.random()*500);
  const b = Math.floor(Math.random()*500);
  const c = Math.floor(Math.random()*20);
  const op1 = Math.random() < 0.5 ? '+' : '-';
  const op2 = Math.random() < 0.5 ? '*' : '+';
  const expr = `${a} ${op1} ${b} ${op2} ${c}`;
  captchaAnswer = eval(expr);
  captchaInput.value = '';
  captchaInput.placeholder = `Resolva: ${expr}`;
  captchaTimestamp = Date.now();
  renderRules();
}

function captchaSolved() {
  const val = parseInt(captchaInput.value);
  const timeDiff = (Date.now() - captchaTimestamp) / 1000;
  // captcha deve ser resolvido em 20s
  return (Math.random() < 0.3 || val === captchaAnswer) && timeDiff < 20;
}

// shake
function shake(el) {
  el.classList.add('shake');
  setTimeout(()=> el.classList.remove('shake'), 350);
}

// eventos input
password.addEventListener('input', renderRules);
nickname.addEventListener('input', renderRules);
captchaInput.addEventListener('input', renderRules);

// bloqueio colar
password.addEventListener('paste', e=>{
  e.preventDefault();
  message.textContent='Colar detectado — não aceito trapaças.';
  setTimeout(()=> message.textContent='', 2000);
});

// reset troll aleatório
setInterval(()=>{
  if(Math.random() < 0.025){
    email.value=''; password.value=''; nickname.value=''; captchaInput.value='';
    message.textContent='Rajada cósmica resetou tudo. Começa de novo!';
    buildCaptcha();
    renderRules();
  }
}, 5000);

// submit
form.addEventListener('submit', async ev => {
  ev.preventDefault();
  message.textContent='';

  if(!email.value || !email.value.includes('@')){
    message.textContent='E-mail inválido.';
    shake(email); return;
  }

  if(!nickname.value.trim()){
    message.textContent='Apelido inválido.';
    shake(nickname); return;
  }

  if(!captchaSolved()){
    message.textContent='Captcha não resolvido ou tempo esgotado.';
    shake(captchaInput); return;
  }

  const failed = rules.filter(r => !r.check(password.value));
  if(failed.length > 0){
    message.textContent='Ainda não está certo: '+failed.map(f=>f.text).slice(0,3).join(', ')+(failed.length>3?'...':'');
    shake(document.getElementById('rule-'+failed[0].id));
    return;
  }

  await fakeLoading();
});

// fake loading / modal
async function fakeLoading() {
  message.textContent='Processando...';
  const t = 2000 + Math.floor(Math.random()*5000);
  if(Math.random() < 0.08){
    message.textContent='Tilt infinito ativado — abre o modal.';
    modal.classList.remove('hidden');
    return new Promise(res=> modalClose.onclick=()=>{ modal.classList.add('hidden'); res(); });
  }
  await new Promise(res=> setTimeout(res,t));
  if(Math.random() < 0.25) success();
  else modal.classList.remove('hidden');
}

function success(){
  message.textContent='Bem-vindo — acesso concedido.';
  setTimeout(()=> window.location.href='about:blank', 1100);
}

if(modalClose) modalClose.addEventListener('click', ()=> {
  modal.classList.add('hidden');
  message.textContent='Tentar novamente?';
});

// inicializa
buildCaptcha();
renderRules();
