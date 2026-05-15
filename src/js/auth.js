const authState = {
  mode: 'login',
};

const formElements = {
  title: document.getElementById('auth-title'),
  usuarioGroup: document.getElementById('group-usuario'),
  usuarioInput: document.getElementById('usuario'),
  correoInput: document.getElementById('correo'),
  contrasenaInput: document.getElementById('contrasena'),
  submitButton: document.getElementById('submit-button'),
  errorMessage: document.getElementById('auth-error'),
  loginButton: document.getElementById('btn-login'),
  registerButton: document.getElementById('btn-register'),
  form: document.getElementById('auth-form'),
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const localStorageKey = 'usuarios_db';

function getUsuarios() {
  const raw = localStorage.getItem(localStorageKey);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveUsuarios(usuarios) {
  localStorage.setItem(localStorageKey, JSON.stringify(usuarios));
}

function setError(message) {
  formElements.errorMessage.textContent = message;
}

function clearError() {
  setError('');
}

function switchMode(mode) {
  authState.mode = mode;
  const isLogin = mode === 'login';

  formElements.title.textContent = isLogin ? 'Iniciar Sesión' : 'Crear Cuenta';
  formElements.submitButton.textContent = isLogin ? 'Entrar' : 'Registrarse';
  formElements.usuarioGroup.style.display = isLogin ? 'none' : 'grid';
  formElements.loginButton.classList.toggle('active', isLogin);
  formElements.registerButton.classList.toggle('active', !isLogin);
  clearError();
  formElements.form.reset();
}

function validarCamposLogin(correo, contrasena) {
  if (!correo || !contrasena) {
    setError('Completa todos los campos.');
    return false;
  }

  if (!emailRegex.test(correo)) {
    setError('Ingresa un correo válido.');
    return false;
  }

  return true;
}

function validarCamposRegistro(usuario, correo, contrasena) {
  if (!usuario || !correo || !contrasena) {
    setError('Completa todos los campos.');
    return false;
  }

  if (!emailRegex.test(correo)) {
    setError('Ingresa un correo válido.');
    return false;
  }

  return true;
}

function handleLogin(correo, contrasena) {
  const usuarios = getUsuarios();
  const usuarioEncontrado = usuarios.find((user) => user.correo === correo);

  if (!usuarioEncontrado) {
    setError('El correo no está registrado.');
    return;
  }

  if (usuarioEncontrado.contrasena !== contrasena) {
    setError('Contraseña incorrecta.');
    return;
  }

  sessionStorage.setItem('usuario_activo', JSON.stringify({ correo: usuarioEncontrado.correo, usuario: usuarioEncontrado.usuario }));
  window.location.href = 'index.html';
}

function handleRegister(usuario, correo, contrasena) {
  const usuarios = getUsuarios();
  const correoEnUso = usuarios.some((user) => user.correo === correo);

  if (correoEnUso) {
    setError('Ese correo ya está registrado.');
    return;
  }

  usuarios.push({ usuario, correo, contrasena });
  saveUsuarios(usuarios);
  setError('Cuenta creada correctamente. Ya puedes iniciar sesión.');
  switchMode('login');
}

function handleSubmit(event) {
  event.preventDefault();
  clearError();

  const usuario = formElements.usuarioInput.value.trim();
  const correo = formElements.correoInput.value.trim().toLowerCase();
  const contrasena = formElements.contrasenaInput.value.trim();

  if (authState.mode === 'login') {
    if (!validarCamposLogin(correo, contrasena)) return;
    handleLogin(correo, contrasena);
    return;
  }

  if (!validarCamposRegistro(usuario, correo, contrasena)) return;
  handleRegister(usuario, correo, contrasena);
}

function attachEvents() {
  formElements.loginButton.addEventListener('click', () => switchMode('login'));
  formElements.registerButton.addEventListener('click', () => switchMode('register'));
  formElements.form.addEventListener('submit', handleSubmit);
}

switchMode('login');
attachEvents();
