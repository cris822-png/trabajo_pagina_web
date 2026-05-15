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
  }

  init() {
    this.setupFormFuerza();
    this.setupFormCardio();
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

  obtenerEntrenamiento() {
    const entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    entrenamiento.fuerza = entrenamiento.fuerza || [];
    entrenamiento.cardio = entrenamiento.cardio || [];
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
    this.renderTablaFuerza(entrenamiento.fuerza);
    this.renderTablaCardio(entrenamiento.cardio);
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
}
