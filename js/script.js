
document.addEventListener('DOMContentLoaded', () => {

  // Helper
  const $ = sel => document.querySelector(sel);

  /* ----------- LOGIN ----------- */
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = $('#username').value.trim();
      const pass = $('#password').value.trim();
      if (user === 'teste' && pass === 'teste') {
        localStorage.setItem('letsignUser', user);
        localStorage.removeItem('currentToken');
        localStorage.removeItem('tokenExpiry');
        window.location.href = 'autenticacao_token.html';
      } else {
        alert('Usuário ou senha inválidos.');
      }
    });
  }

  /* ----------- TOKEN GERENCIAMENTO ----------- */
  function generateToken() {
    const t = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('currentToken', t);
    localStorage.setItem('tokenExpiry', (Date.now() + 60000).toString());
    return t;
  }

  function startCountdown() {
    const span = $('#expiraCountdown');
    if (!span) return;
    clearInterval(span._timer);
    function update() {
      const diff = parseInt(localStorage.getItem('tokenExpiry') || '0', 10) - Date.now();
      if (diff <= 0) {
        span.textContent = '00:00';
        clearInterval(span._timer);
        return;
      }
      const sec = Math.floor(diff / 1000);
      span.textContent = `${String(sec/60|0).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    }
    span._timer = setInterval(update, 1000);
    update();
  }

  // gerenciamento_token.html logic
  if ($('#tokenValue')) {
    const display = $('#tokenValue');
    const savedToken = localStorage.getItem('currentToken');
    if (savedToken) display.textContent = savedToken;

    const gerarBtn = $('#gerarNovoTokenBtn');
    gerarBtn?.addEventListener('click', () => {
      const tk = generateToken();
      display.textContent = tk;
      startCountdown();
    });

    // initialize countdown if expiry exists
    if (localStorage.getItem('tokenExpiry')) startCountdown();

    $('#voltarParaAutenticacaoBtn')?.addEventListener('click', () => {
      window.location.href = 'autenticacao_token.html';
    });

    // copiar token
    $('#copiarTokenBtn')?.addEventListener('click', () => {
      const token = display.textContent.trim();
      if (!token || token.includes('-')) {
        alert('Nenhum token para copiar.');
        return;
      }
      navigator.clipboard.writeText(token).then(() => {
        const btn = $('#copiarTokenBtn');
        const original = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => btn.textContent = original, 1500);
      });
    });
  }

  /* ----------- TELA DE AUTENTICAÇÃO DE TOKEN ----------- */
  if ($('#validarTokenBtn')) {
    $('#validarTokenBtn').addEventListener('click', () => {
      const digits = Array.from(document.querySelectorAll('.token-digit')).map(i=>i.value).join('');
      if (digits.length !== 6) return alert('Digite o token completo.');
      if (digits === localStorage.getItem('currentToken')) {
        window.location.href = 'assinaturas_delegadas.html';
      } else {
        alert('Token inválido.');
      }
    });
  }

  /* ----------- REPRESENTANTES ----------- */
  const list = $('#listaRepresentantes');
  const loadReps = () => JSON.parse(localStorage.getItem('representantes') || '[]');
  const saveReps = arr => localStorage.setItem('representantes', JSON.stringify(arr));

  function renderReps() {
    if (!list) return;
    list.innerHTML = '';
    const reps = loadReps();
    if (!reps.length) {
      const li = document.createElement('li');
      li.className = 'list-group-item text-muted';
      li.textContent = 'Nenhum representante cadastrado.';
      list.appendChild(li);
      return;
    }
    reps.forEach((r,i) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center" style="width:40px;height:40px;">
            <span class="fw-semibold">${r.nome[0].toUpperCase()}</span>
          </div>
          <div>
            <strong class="d-block fs-6">${r.nome}</strong>
            <span class="d-block small">${r.email}</span>
            <span class="d-block small text-muted">${r.role}</span>
          </div>
        </div>
        <button class="btn btn-sm btn-link text-danger del" data-i="${i}">
          <i class="bi bi-trash"></i>
        </button>`;
      list.appendChild(li);
    });
    list.querySelectorAll('.del').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.i;
        const reps = loadReps();
        reps.splice(idx,1);
        saveReps(reps);
        renderReps();
      };
    });
  }
  renderReps();

  $('#addRepresentativeForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const reps = loadReps();
    reps.push({
      nome: $('#repFullName').value.trim(),
      email: $('#repEmail').value.trim(),
      role: $('#repRole').value.trim()
    });
    saveReps(reps);
    window.location.href = 'assinaturas_delegadas.html';
  });

  // Saudação
  document.querySelectorAll('.user-greeting').forEach(el => {
    el.textContent = `Olá, ${localStorage.getItem('letsignUser') || ''}`;
  });

});
