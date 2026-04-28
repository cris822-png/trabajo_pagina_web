/* ============================================
   NUTRICIÓN - Lógica de validación
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  nutricionPage = new NutricionPage();
  nutricionPage.init();
});

class NutricionPage {
  constructor() {
    this.storage = new StorageManager();
    this.hoy = this.storage.getTodayISO();
  }

  init() {
    this.setupForm();
    this.render();
  }

  setupForm() {
    const form = document.getElementById('form-nutricion');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarNutricion();
    });
  }

  /**
   * Valida todas las comidas en tiempo real
   */
  validarComida() {
    const datos = this.extraerDatos();
    const esValido = this.validarDatos(datos);
    
    const alertEl = document.getElementById('alert-nutricion');
    if (!esValido.valido) {
      alertEl.classList.remove('hidden');
    } else {
      alertEl.classList.add('hidden');
    }

    this.actualizarEstadoDia(esValido);
  }

  /**
   * Extrae datos de los inputs
   */
  extraerDatos() {
    return {
      '06_00_platano': {
        completado: document.getElementById('platano-check').checked,
        cantidad: parseInt(document.getElementById('platano-cantidad').value) || 0
      },
      'intra_clase': {
        completado: document.getElementById('intra-check').checked,
        leche: parseFloat(document.getElementById('intra-leche').value) || 0,
        protein: parseInt(document.getElementById('intra-protein').value) || 0,
        creatina: document.getElementById('intra-creatina').checked
      },
      '11_00_bocadillo': {
        completado: document.getElementById('bocadillo-check').checked,
        pan: parseInt(document.getElementById('bocadillo-pan').value) || 0,
        lomo: parseInt(document.getElementById('bocadillo-lomo').value) || 0,
        queso: parseInt(document.getElementById('bocadillo-queso').value) || 0
      },
      '14_30_comida': {
        completado: document.getElementById('comida-principal-check').checked
      },
      '20_30_cena': {
        completado: document.getElementById('cena-check').checked,
        huevos: parseInt(document.getElementById('cena-huevos').value) || 0,
        ensalada: document.getElementById('cena-ensalada').checked
      }
    };
  }

  /**
   * Valida exactitud de los datos
   */
  validarDatos(datos) {
    const errores = [];

    // Validar Plátano
    if (datos['06_00_platano'].completado) {
      if (datos['06_00_platano'].cantidad !== 1) {
        errores.push('Plátano: debe ser 1 unidad');
      }
    }

    // Validar Intra-clase
    if (datos['intra_clase'].completado) {
      if (datos['intra_clase'].leche !== 0.5) {
        errores.push('Intra-clase: leche debe ser 0.5L');
      }
      if (datos['intra_clase'].protein !== 1) {
        errores.push('Intra-clase: proteína debe ser 1 scoop');
      }
      if (!datos['intra_clase'].creatina) {
        errores.push('Intra-clase: creatina es obligatoria');
      }
    }

    // Validar Bocadillo
    if (datos['11_00_bocadillo'].completado) {
      if (datos['11_00_bocadillo'].pan !== 2) {
        errores.push('Bocadillo: pan debe ser 2 rodajas');
      }
      if (datos['11_00_bocadillo'].lomo !== 7) {
        errores.push('Bocadillo: lomo debe ser 7 lonchas');
      }
      if (datos['11_00_bocadillo'].queso !== 1) {
        errores.push('Bocadillo: queso debe ser 1 loncha');
      }
    }

    // Validar Comida Principal (solo verificar que esté marcada)
    // No hay especificación exacta de cantidad

    // Validar Cena
    if (datos['20_30_cena'].completado) {
      if (datos['20_30_cena'].huevos !== 3) {
        errores.push('Cena: huevos deben ser 3');
      }
      if (!datos['20_30_cena'].ensalada) {
        errores.push('Cena: ensalada es obligatoria');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Actualiza visual del estado del día
   */
  actualizarEstadoDia(validacion) {
    const statusEl = document.getElementById('day-status');
    const todosMarcados = [
      document.getElementById('platano-check'),
      document.getElementById('intra-check'),
      document.getElementById('bocadillo-check'),
      document.getElementById('comida-principal-check'),
      document.getElementById('cena-check')
    ].every(el => el.checked);

    if (validacion.valido && todosMarcados) {
      statusEl.classList.remove('alert-danger');
      statusEl.classList.add('alert-success');
      statusEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✓ Estado: CUMPLIDO</span>`;
    } else {
      statusEl.classList.remove('alert-success');
      statusEl.classList.add('alert-danger');
      statusEl.innerHTML = `<span style="color: var(--danger); font-weight: 700;">✗ Estado: FALLADO</span>`;
    }
  }

  /**
   * Guarda nutrición del día
   */
  guardarNutricion() {
    const datos = this.extraerDatos();
    const validacion = this.validarDatos(datos);

    const nutricionData = {
      '06_00_platano': datos['06_00_platano'].completado,
      'intra_clase': datos['intra_clase'].completado,
      '11_00_bocadillo': datos['11_00_bocadillo'].completado,
      '14_30_comida': datos['14_30_comida'].completado,
      '20_30_cena': datos['20_30_cena'].completado,
      'dia_fallado': !validacion.valido || ![
        datos['06_00_platano'].completado,
        datos['intra_clase'].completado,
        datos['11_00_bocadillo'].completado,
        datos['14_30_comida'].completado,
        datos['20_30_cena'].completado
      ].every(x => x),
      'detalles': datos,
      'timestamp': new Date().toISOString()
    };

    this.storage.setNutricion(this.hoy, nutricionData);
    alert('Nutrición guardada');
    this.render();
  }

  /**
   * Renderiza la página
   */
  render() {
    this.renderHistorico();
  }

  /**
   * Renderiza histórico de 7 últimos días
   */
  renderHistorico() {
    const tbody = document.getElementById('tbody-historico');
    tbody.innerHTML = '';

    const hoy = new Date();
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaISO = fecha.toISOString().split('T')[0];
      
      const nutricion = this.storage.getNutricion(fechaISO);
      
      const row = document.createElement('tr');
      
      if (nutricion) {
        const estadoClass = nutricion.dia_fallado ? 'text-danger' : 'text-success';
        const estadoText = nutricion.dia_fallado ? 'FALLADO' : 'CUMPLIDO';
        
        let detalles = [];
        if (nutricion['06_00_platano']) detalles.push('Plátano');
        if (nutricion['intra_clase']) detalles.push('Intra');
        if (nutricion['11_00_bocadillo']) detalles.push('Bocadillo');
        if (nutricion['14_30_comida']) detalles.push('Comida');
        if (nutricion['20_30_cena']) detalles.push('Cena');
        
        row.innerHTML = `
          <td>${Utils.formatFecha(fechaISO)}</td>
          <td><span class="${estadoClass}">${estadoText}</span></td>
          <td>${detalles.join(', ') || 'N/A'}</td>
        `;
      } else {
        row.innerHTML = `
          <td>${Utils.formatFecha(fechaISO)}</td>
          <td><span class="text-muted">SIN REGISTRO</span></td>
          <td>-</td>
        `;
      }
      
      tbody.appendChild(row);
    }
  }
}

// Variable global
let nutricionPage;
