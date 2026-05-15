/* ============================================
   ENTRENAMIENTO - Lógica de registro
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const entrenamientoPage = new EntrenamientoPage();
  entrenamientoPage.init();
});

class EntrenamientoPage {
  constructor() {
    this.storage = new StorageManager();
    this.hoy = this.storage.getTodayISO();
    this.timerInterval = null;
  }

  init() {
    this.setupFormFuerza();
    this.setupFormCardio();
    this.setupIniciarButton();
    this.setupTerminarButton();
    this.setupDeleteHandlers();
    this.render();
  }

  setupFormFuerza() {
    const form = document.getElementById('form-fuerza');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarRegistroFuerza();
    });
  }

  setupFormCardio() {
    const form = document.getElementById('form-cardio');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarRegistroCardio();
    });
  }

  setupDeleteHandlers() {
    document.getElementById('tbody-fuerza').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const tipo = button.dataset.type;
      const id = button.dataset.id;
      if (tipo && id) {
        this.eliminarRegistro(tipo, id);
      }
    });

    document.getElementById('tbody-cardio').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const tipo = button.dataset.type;
      const id = button.dataset.id;
      if (tipo && id) {
        this.eliminarRegistro(tipo, id);
      }
    });
  }

  setupIniciarButton() {
    const button = document.getElementById('btn-iniciar-entrenamiento');
    if (!button) return;

    button.addEventListener('click', () => {
      this.iniciarEntrenamiento();
    });
  }

  obtenerEntrenamiento() {
    const entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    entrenamiento.fuerza = entrenamiento.fuerza || [];
    entrenamiento.cardio = entrenamiento.cardio || [];
    entrenamiento.startedAt = entrenamiento.startedAt || null;
    return entrenamiento;
  }

  guardarEntrenamiento(entrenamiento) {
    this.storage.setEntrenamiento(this.hoy, entrenamiento);
  }

  agregarRegistroFuerza() {
    const nombre = document.getElementById('fuerza-nombre').value.trim();
    const peso = parseFloat(document.getElementById('fuerza-peso').value);
    const reps = parseInt(document.getElementById('fuerza-reps').value, 10);
    const tipo = document.getElementById('fuerza-tipo').value;

    if (!nombre || !peso || !reps) {
      alert('Completa todos los campos de fuerza.');
      return;
    }

    const registro = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nombre,
      peso,
      reps,
      tipo,
      fecha: new Date().toISOString(),
    };

    const entrenamiento = this.obtenerEntrenamiento();
    entrenamiento.fuerza.unshift(registro);
    this.guardarEntrenamiento(entrenamiento);
    document.getElementById('form-fuerza').reset();
    this.render();
  }

  agregarRegistroCardio() {
    const maquina = document.getElementById('cardio-maquina').value.trim();
    const duracion = parseInt(document.getElementById('cardio-duracion').value, 10);
    const inclinacion = parseFloat(document.getElementById('cardio-inclinacion').value);
    const velocidad = parseFloat(document.getElementById('cardio-velocidad').value);

    if (!maquina || Number.isNaN(duracion) || Number.isNaN(inclinacion) || Number.isNaN(velocidad)) {
      alert('Completa todos los campos de cardio.');
      return;
    }

    const registro = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      maquina,
      duracion,
      inclinacion,
      velocidad,
      fecha: new Date().toISOString(),
    };

    const entrenamiento = this.obtenerEntrenamiento();
    entrenamiento.cardio.unshift(registro);
    this.guardarEntrenamiento(entrenamiento);
    document.getElementById('form-cardio').reset();
    this.render();
  }

  eliminarRegistro(tipo, id) {
    const entrenamiento = this.obtenerEntrenamiento();
    entrenamiento[tipo] = entrenamiento[tipo].filter((registro) => registro.id !== id);
    this.guardarEntrenamiento(entrenamiento);
    this.render();
  }

  render() {
    const entrenamiento = this.obtenerEntrenamiento();
    this.renderSesionActual(entrenamiento);
    this.renderTablaFuerza(entrenamiento.fuerza);
    this.renderTablaCardio(entrenamiento.cardio);
    this.renderHistoricoEntrenamientos();
    this.setupTimer(entrenamiento);
  }

  renderTablaFuerza(registros) {
    const tbody = document.getElementById('tbody-fuerza');
    tbody.innerHTML = '';

    if (!registros.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin registros de fuerza</td></tr>';
      return;
    }

    registros.sort((a, b) => b.fecha.localeCompare(a.fecha));
    registros.forEach((registro) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${Utils.formatFecha(registro.fecha)}</td>
        <td>${Utils.escapeHTML(registro.nombre)}</td>
        <td>${Utils.formatNumber(registro.peso, 1)} kg</td>
        <td>${registro.reps}</td>
        <td>${registro.tipo}</td>
        <td>
          <button class="btn btn-danger btn-small" data-action="delete" data-type="fuerza" data-id="${registro.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  renderTablaCardio(registros) {
    const tbody = document.getElementById('tbody-cardio');
    tbody.innerHTML = '';

    if (!registros.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin registros de cardio</td></tr>';
      return;
    }

    registros.sort((a, b) => b.fecha.localeCompare(a.fecha));
    registros.forEach((registro) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${Utils.formatFecha(registro.fecha)}</td>
        <td>${Utils.escapeHTML(registro.maquina)}</td>
        <td>${registro.duracion} min</td>
        <td>${Utils.formatNumber(registro.inclinacion, 1)}%</td>
        <td>${Utils.formatNumber(registro.velocidad, 1)} km/h</td>
        <td>
          <button class="btn btn-danger btn-small" data-action="delete" data-type="cardio" data-id="${registro.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  setupTerminarButton() {
    const button = document.getElementById('btn-terminar-entrenamiento');
    if (!button) return;

    button.addEventListener('click', () => {
      this.terminarEntrenamiento();
    });
  }

  setupTimer(entrenamiento) {
    const timerEl = document.getElementById('entrenamiento-timer');
    const iniciarButton = document.getElementById('btn-iniciar-entrenamiento');
    const terminarButton = document.getElementById('btn-terminar-entrenamiento');

    if (!entrenamiento.startedAt) {
      if (timerEl) timerEl.textContent = '00:00:00';
      if (iniciarButton) iniciarButton.disabled = false;
      if (terminarButton) terminarButton.disabled = true;
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      return;
    }

    if (iniciarButton) iniciarButton.disabled = true;
    if (terminarButton) terminarButton.disabled = false;
    this.updateTimer(entrenamiento.startedAt);

    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        this.updateTimer(entrenamiento.startedAt);
      }, 1000);
    }
  }

  updateTimer(startedAt) {
    const timerEl = document.getElementById('entrenamiento-timer');
    if (!timerEl) return;

    const start = new Date(startedAt);
    const diff = Math.max(0, Date.now() - start.getTime());
    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    timerEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  iniciarEntrenamiento() {
    const entrenamiento = this.obtenerEntrenamiento();
    if (entrenamiento.startedAt) {
      return;
    }

    entrenamiento.startedAt = new Date().toISOString();
    this.guardarEntrenamiento(entrenamiento);
    this.render();
  }

  renderSesionActual(entrenamiento) {
    const content = document.getElementById('entrenando-content');
    const fuerza = entrenamiento.fuerza || [];
    const cardio = entrenamiento.cardio || [];

    const duracionTotal = cardio.reduce((total, registro) => total + registro.duracion, 0);
    const fuerzaHtml = fuerza.length
      ? `<ul>${fuerza.map((registro) => `<li>${Utils.escapeHTML(registro.nombre)} — ${Utils.formatNumber(registro.peso, 1)} kg × ${registro.reps} reps (${registro.tipo})</li>`).join('')}</ul>`
      : '<p class="text-muted">No hay ejercicios de fuerza agregados.</p>';
    const cardioHtml = cardio.length
      ? `<ul>${cardio.map((registro) => `<li>${Utils.escapeHTML(registro.maquina)} — ${registro.duracion} min, ${Utils.formatNumber(registro.inclinacion, 1)}% inclinación, ${Utils.formatNumber(registro.velocidad, 1)} km/h</li>`).join('')}</ul>`
      : '<p class="text-muted">No hay ejercicios de cardio agregados.</p>';

    content.innerHTML = `
      <div class="stat-box">
        <div class="stat-value">${fuerza.length}</div>
        <div class="stat-label">Ejercicios de fuerza</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${cardio.length}</div>
        <div class="stat-label">Ejercicios de cardio</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${duracionTotal} min</div>
        <div class="stat-label">Duración total cardio</div>
      </div>
      <div class="mt-md">
        <h4>Fuerza</h4>
        ${fuerzaHtml}
      </div>
      <div class="mt-md">
        <h4>Cardio</h4>
        ${cardioHtml}
      </div>
    `;
  }

  terminarEntrenamiento() {
    const entrenamiento = this.obtenerEntrenamiento();
    const fuerza = entrenamiento.fuerza || [];
    const cardio = entrenamiento.cardio || [];

    if (!fuerza.length && !cardio.length) {
      alert('No hay ejercicios en la sesión actual para terminar.');
      return;
    }

    const sesion = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fecha: new Date().toISOString(),
      fuerza,
      cardio,
      total_ejercicios: fuerza.length + cardio.length,
      duracion_total: cardio.reduce((total, registro) => total + registro.duracion, 0),
    };

    this.storage.addEntrenamientoHistorico(sesion);
    this.guardarEntrenamiento({ fuerza: [], cardio: [], startedAt: null });
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.render();
  }

  obtenerEntrenamientoHistorico() {
    return this.storage.getEntrenamientoHistorico() || [];
  }

  renderHistoricoEntrenamientos() {
    const historial = this.obtenerEntrenamientoHistorico();
    const tbody = document.getElementById('tbody-historico-entrenamientos');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!historial.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay sesiones terminadas aún.</td></tr>';
      return;
    }

    historial.forEach((sesion) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${Utils.formatFecha(sesion.fecha)}</td>
        <td>${sesion.fuerza.length}</td>
        <td>${sesion.cardio.length}</td>
        <td>${sesion.tiempo_sesion || '00:00:00'}</td>
      `;
      tbody.appendChild(row);
    });
  }
}
