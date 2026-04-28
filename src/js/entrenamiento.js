/* ============================================
   ENTRENAMIENTO - Lógica de registro
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const entrenamiento = new EntrenamientoPage();
  entrenamiento.init();
});

class EntrenamientoPage {
  constructor() {
    this.storage = new StorageManager();
    this.hoy = this.storage.getTodayISO();
  }

  init() {
    this.setupFormCardio();
    this.setupFormPress();
    this.setupFormCurl();
    this.render();
  }

  /**
   * Configura formulario de cardio
   */
  setupFormCardio() {
    const form = document.getElementById('form-cardio');
    const velocidad = document.getElementById('cardio-velocidad');
    const inclinacion = document.getElementById('cardio-inclinacion');
    const alertaEl = document.getElementById('alert-cardio');

    // Validar en tiempo real
    const validar = () => {
      const esValido = 
        parseFloat(velocidad.value) === 5.0 &&
        parseInt(inclinacion.value) === 15;
      
      if (!esValido) {
        alertaEl.classList.remove('hidden');
      } else {
        alertaEl.classList.add('hidden');
      }
    };

    velocidad.addEventListener('input', validar);
    inclinacion.addEventListener('input', validar);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarCardio();
    });
  }

  /**
   * Guarda datos de cardio
   */
  guardarCardio() {
    const velocidad = parseFloat(document.getElementById('cardio-velocidad').value);
    const inclinacion = parseInt(document.getElementById('cardio-inclinacion').value);
    const tiempo = parseInt(document.getElementById('cardio-tiempo').value);

    const cardioData = {
      velocidad,
      inclinacion,
      tiempo,
      timestamp: new Date().toISOString()
    };

    let entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    entrenamiento.cardio = cardioData;
    this.storage.setEntrenamiento(this.hoy, entrenamiento);

    // Mostrar confirmación
    alert('Cardio registrado');
    this.render();
  }

  /**
   * Configura formulario de Press Inclinado
   */
  setupFormPress() {
    const form = document.getElementById('form-press');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarRegistroPress();
    });
  }

  /**
   * Agrega registro de Press
   */
  agregarRegistroPress() {
    const pesoIzq = parseFloat(document.getElementById('press-peso-izq').value);
    const repsIzq = parseInt(document.getElementById('press-reps-izq').value);
    const pesoDer = parseFloat(document.getElementById('press-peso-der').value);
    const repsDer = parseInt(document.getElementById('press-reps-der').value);

    if (!pesoIzq || !repsIzq || !pesoDer || !repsDer) {
      alert('Completa todos los campos');
      return;
    }

    let entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    if (!entrenamiento.press_inclinado) {
      entrenamiento.press_inclinado = [];
    }

    entrenamiento.press_inclinado.push({
      lado: 'izq',
      peso: pesoIzq,
      reps: repsIzq
    });

    entrenamiento.press_inclinado.push({
      lado: 'der',
      peso: pesoDer,
      reps: repsDer
    });

    this.storage.setEntrenamiento(this.hoy, entrenamiento);
    document.getElementById('form-press').reset();
    this.render();
  }

  /**
   * Configura formulario de Curl Scott
   */
  setupFormCurl() {
    const form = document.getElementById('form-curl');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarRegistroCurl();
    });
  }

  /**
   * Agrega registro de Curl
   */
  agregarRegistroCurl() {
    const pesoIzq = parseFloat(document.getElementById('curl-peso-izq').value);
    const repsIzq = parseInt(document.getElementById('curl-reps-izq').value);
    const pesoDer = parseFloat(document.getElementById('curl-peso-der').value);
    const repsDer = parseInt(document.getElementById('curl-reps-der').value);

    if (!pesoIzq || !repsIzq || !pesoDer || !repsDer) {
      alert('Completa todos los campos');
      return;
    }

    let entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    if (!entrenamiento.curl_scott) {
      entrenamiento.curl_scott = [];
    }

    entrenamiento.curl_scott.push({
      lado: 'izq',
      peso: pesoIzq,
      reps: repsIzq
    });

    entrenamiento.curl_scott.push({
      lado: 'der',
      peso: pesoDer,
      reps: repsDer
    });

    this.storage.setEntrenamiento(this.hoy, entrenamiento);
    document.getElementById('form-curl').reset();
    this.render();
  }

  /**
   * Elimina un registro de Press
   */
  eliminarRegistroPress(index) {
    const entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    if (entrenamiento.press_inclinado) {
      entrenamiento.press_inclinado.splice(index, 1);
      this.storage.setEntrenamiento(this.hoy, entrenamiento);
      this.render();
    }
  }

  /**
   * Elimina un registro de Curl
   */
  eliminarRegistroCurl(index) {
    const entrenamiento = this.storage.getEntrenamiento(this.hoy) || {};
    if (entrenamiento.curl_scott) {
      entrenamiento.curl_scott.splice(index, 1);
      this.storage.setEntrenamiento(this.hoy, entrenamiento);
      this.render();
    }
  }

  /**
   * Renderiza la página
   */
  render() {
    const entrenamiento = this.storage.getEntrenamiento(this.hoy);
    
    // Renderizar tabla Press
    this.renderTabla('tbody-press', entrenamiento?.press_inclinado, 'press');

    // Renderizar tabla Curl
    this.renderTabla('tbody-curl', entrenamiento?.curl_scott, 'curl');
  }

  /**
   * Renderiza una tabla de registros
   */
  renderTabla(tbodyId, registros, tipo) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';

    if (!registros || registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin registros</td></tr>';
      return;
    }

    registros.forEach((registro, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${registro.lado === 'izq' ? 'IZQUIERDO' : 'DERECHO'}</td>
        <td>${Utils.formatNumber(registro.peso, 1)}</td>
        <td>${registro.reps}</td>
        <td>
          <button class="btn btn-danger" onclick="entrenamiento.eliminarRegistro${tipo.charAt(0).toUpperCase() + tipo.slice(1)}(${index})">
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
}

// Variable global para acceder desde onclick
let entrenamiento;
document.addEventListener('DOMContentLoaded', () => {
  entrenamiento = new EntrenamientoPage();
  entrenamiento.init();
});
