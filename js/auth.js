// ===================================================
//  IDE — auth.js
//  Maneja Login, Registro y Modal de notificación
// ===================================================

const API = 'http://localhost:3000/api';

// ── MODAL ──────────────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const modalIcon    = document.getElementById('modalIcon');
const modalTitle   = document.getElementById('modalTitle');
const modalMsg     = document.getElementById('modalMsg');
const modalBtn     = document.getElementById('modalBtn');

function showModal(tipo, titulo, mensaje, onAceptar) {
  modalIcon.textContent  = tipo === 'exito' ? '✓' : '✕';
  modalIcon.className    = 'modal-icon' + (tipo === 'error' ? ' error' : '');
  modalTitle.textContent = titulo;
  modalMsg.textContent   = mensaje;
  modalOverlay.classList.add('active');

  modalBtn.onclick = () => {
    modalOverlay.classList.remove('active');
    if (onAceptar) onAceptar();
  };
}

// Cerrar modal al hacer clic fuera
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
  }
});

// ── MOSTRAR/OCULTAR CONTRASEÑA ─────────────────────
const togglePass = document.getElementById('togglePass');
if (togglePass) {
  togglePass.addEventListener('click', () => {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
    togglePass.style.color = input.type === 'text' ? 'var(--gold)' : '';
  });
}

// ── MOSTRAR ERROR EN FORMULARIO ────────────────────
function showError(msg) {
  const el = document.getElementById('authError');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError() {
  const el = document.getElementById('authError');
  if (el) el.style.display = 'none';
}

// ── LOGIN ──────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const btn     = loginForm.querySelector('.btn-auth');
    const btnSpan = btn.querySelector('span');
    btnSpan.textContent = 'Ingresando...';
    btn.disabled = true;

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Error al iniciar sesión');
        btnSpan.textContent = 'Ingresar';
        btn.disabled = false;
        return;
      }

      // Guardar token y nombre
      localStorage.setItem('ide_token',  data.token);
      localStorage.setItem('ide_nombre', data.nombre);

      showModal('exito', '¡Bienvenido!',
        `Hola, ${data.nombre}. Has iniciado sesión correctamente.`,
        () => { window.location.href = 'portal/dashboard.html'; }
      );

    } catch {
      showError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      btnSpan.textContent = 'Ingresar';
      btn.disabled = false;
    }
  });
}

// ── REGISTRO ───────────────────────────────────────
const registroForm = document.getElementById('registroForm');
if (registroForm) {
  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const nombre   = document.getElementById('nombre').value.trim();
    const empresa  = document.getElementById('empresa').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const password2= document.getElementById('password2').value;

    // Validaciones locales
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    const btn     = registroForm.querySelector('.btn-auth');
    const btnSpan = btn.querySelector('span');
    btnSpan.textContent = 'Registrando...';
    btn.disabled = true;

    try {
      const res  = await fetch(`${API}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, empresa })
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Error al registrarse');
        btnSpan.textContent = 'Crear cuenta';
        btn.disabled = false;
        return;
      }

      showModal('exito', '¡Cuenta creada!',
        'Tu cuenta fue registrada exitosamente. Ahora puedes iniciar sesión.',
        () => { window.location.href = 'login.html'; }
      );

    } catch {
      showError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      btnSpan.textContent = 'Crear cuenta';
      btn.disabled = false;
    }
  });
}