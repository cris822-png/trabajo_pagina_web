/* ============================================
   NUTRICIÓN - Lógica de registro
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  window.nutricionPage = new NutricionPage();
  nutricionPage.init();
});

class NutricionPage {
  constructor() {
    this.storage = new StorageManager();
    this.hoy = this.storage.getTodayISO();
  }

  init() {
    this.setupForm();
    this.setupMixToggle();
    this.render();
  }

  setupForm() {
    const form = document.getElementById('form-ingesta');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarIngesta();
    });
  }

  setupMixToggle() {
    const mezclaToggle = document.getElementById('ingesta-mezcla');
    const mezclaGroup = document.getElementById('mezcla-group');
    mezclaToggle.addEventListener('change', () => {
      mezclaGroup.classList.toggle('hidden', !mezclaToggle.checked);
    });
  }

  obtenerNutricion() {
    const nutricion = this.storage.getNutricion(this.hoy) || {};
    nutricion.entries = nutricion.entries || [];
    return nutricion;
  }

  guardarNutricion(nutricion) {
    this.storage.setNutricion(this.hoy, nutricion);
  }

  extraerRegistro() {
    return {
      hora: document.getElementById('ingesta-hora').value,
      nombre: document.getElementById('ingesta-nombre').value.trim(),
      unidad: document.getElementById('ingesta-unidad').value,
      cantidad: parseFloat(document.getElementById('ingesta-cantidad').value),
      mezcla: document.getElementById('ingesta-mezcla').checked,
      ingredientes: document.getElementById('ingesta-ingredientes').value.trim(),
    };
  }

  validarRegistro(registro) {
    const errores = [];
    if (!registro.hora) errores.push('Hora es obligatoria.');
    if (!registro.nombre) errores.push('Nombre del alimento es obligatorio.');
    if (!registro.unidad) errores.push('Selecciona una unidad.');
    if (!registro.cantidad || registro.cantidad <= 0) errores.push('Cantidad debe ser mayor que cero.');
    if (registro.mezcla && !registro.ingredientes) errores.push('Agrega los ingredientes del batido.');
    return errores;
  }

  agregarIngesta() {
    const registro = this.extraerRegistro();
    const errores = this.validarRegistro(registro);
    const alertEl = document.getElementById('alert-ingesta');

    if (errores.length) {
      alertEl.textContent = `⚠️ ${errores[0]}`;
      alertEl.classList.remove('hidden');
      this.renderStatus(false);
      return;
    }

    alertEl.classList.add('hidden');

    const nutricion = this.obtenerNutricion();
    const nuevoRegistro = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...registro,
      timestamp: new Date().toISOString(),
    };
    nutricion.entries.unshift(nuevoRegistro);
    this.guardarNutricion(nutricion);

    document.getElementById('form-ingesta').reset();
    document.getElementById('mezcla-group').classList.add('hidden');
    this.render();
  }

  eliminarIngesta(id) {
    const nutricion = this.obtenerNutricion();
    nutricion.entries = nutricion.entries.filter((entry) => entry.id !== id);
    this.guardarNutricion(nutricion);
    this.render();
  }

  render() {
    const nutricion = this.obtenerNutricion();
    const valido = this.esDiaValido(nutricion.entries);
    this.renderStatus(valido);
    this.renderTabla(nutricion.entries);
  }

  esDiaValido(entries) {
    if (!entries.length) return false;
    return entries.every((registro) => {
      const errores = this.validarRegistro(registro);
      return errores.length === 0;
    });
  }

  renderStatus(valido) {
    const statusEl = document.getElementById('status-dia');
    if (!statusEl) return;
    if (valido) {
      statusEl.innerHTML = '<strong>Estado:</strong> <span class="text-success">CUMPLIDO</span> — Todas las ingestas registradas cumplen los requisitos.';
      statusEl.classList.remove('alert-danger');
      statusEl.classList.add('alert-success');
    } else {
      statusEl.innerHTML = '<strong>Estado:</strong> <span class="text-danger">FALLADO</span> — Faltan ingestas o hay datos incompletos.';
      statusEl.classList.remove('alert-success');
      statusEl.classList.add('alert-danger');
    }
  }

  renderTabla(entries) {
    const tbody = document.getElementById('tbody-ingesta');
    tbody.innerHTML = '';
    if (!entries.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin registros de nutrición para hoy.</td></tr>';
      return;
    }

    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    entries.forEach((registro) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${registro.hora}</td>
        <td>${Utils.escapeHTML(registro.nombre)}</td>
        <td>${Utils.formatNumber(registro.cantidad, 1)} ${registro.unidad}</td>
        <td>${registro.mezcla ? 'Sí' : 'No'}</td>
        <td>${registro.mezcla ? Utils.escapeHTML(registro.ingredientes) : '-'}</td>
        <td><button class="btn btn-danger btn-small" data-action="delete" data-id="${registro.id}">Eliminar</button></td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll('button[data-action="delete"]').forEach((button) => {
      button.addEventListener('click', () => {
        this.eliminarIngesta(button.dataset.id);
      });
    });
  }
}
