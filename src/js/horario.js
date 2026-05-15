/* ============================================
   HORARIO - Validación de sueño
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  horarioPage = new HorarioPage();
  horarioPage.init();
});

class HorarioPage {
  constructor() {
    this.storage = new StorageManager();
    this.hoy = this.storage.getTodayISO();
  }

  init() {
    this.setupForm();
    this.render();
  }

  setupForm() {
    const form = document.getElementById('form-sueño');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarSueño();
    });
  }

  /**
   * Actualiza la información del límite según tipo de día
   */
  actualizarLimite() {
    const tipoDia = document.getElementById('tipo-dia').value;
    const limiteInfo = document.getElementById('limite-info');

    const limites = {
      'normal': '📋 Rango: 21:00 - 22:00 (8 horas de sueño)',
      'partido': '⚽ Rango: 21:00 - 23:00 (estrés competitivo)',
      'fiesta': '🎉 Sin límite (calcula falta de sueño)'
    };

    limiteInfo.textContent = limites[tipoDia] || 'Selecciona un tipo de día';
  }

  /**
   * Valida la hora de dormir según tipo de día
   */
  validarHora() {
    const tipoDia = document.getElementById('tipo-dia').value;
    const horaDormir = document.getElementById('hora-dormir').value;
    const alertEl = document.getElementById('alert-validacion');
    const alertText = document.getElementById('alert-text');

    if (!tipoDia || !horaDormir) return;

    const horas = parseFloat(horaDormir.split(':')[0]);
    const limites = {
      'normal': { min: 21, max: 22 },
      'partido': { min: 21, max: 23 },
      'fiesta': { min: 0, max: 24 }
    };

    const limite = limites[tipoDia];
    const esValido = horas >= limite.min && horas < limite.max;

    if (tipoDia === 'fiesta') {
      // Para fiesta, mostrar cálculo de falta de sueño
      const faltaSueño = Validators.calcularFaltaSueño(horaDormir);
      alertEl.classList.remove('hidden', 'alert-danger', 'alert-success');
      
      if (faltaSueño > 0) {
        alertEl.classList.add('alert-danger');
        alertText.innerHTML = `⚠️ Falta de sueño: <strong>${Utils.formatNumber(faltaSueño, 1)} horas</strong> vs 8h`;
      } else {
        alertEl.classList.add('alert-success');
        alertText.innerHTML = `✓ Sueño completo registrado`;
      }
    } else {
      // Para normal y partido, validar rango
      alertEl.classList.remove('hidden');
      
      if (esValido) {
        alertEl.classList.remove('alert-danger');
        alertEl.classList.add('alert-success');
        alertText.innerHTML = `✓ Hora válida para día ${tipoDia.toUpperCase()}`;
      } else {
        alertEl.classList.remove('alert-success');
        alertEl.classList.add('alert-danger');
        alertText.innerHTML = `✗ Fuera de rango. Rango permitido: ${limite.min}:00 - ${limite.max}:00`;
      }
    }
  }

  /**
   * Guarda registro de sueño
   */
  guardarSueño() {
    const tipoDia = document.getElementById('tipo-dia').value;
    const horaDormir = document.getElementById('hora-dormir').value;

    if (!tipoDia || !horaDormir) {
      alert('Completa todos los campos');
      return;
    }

    // Validar según tipo de día
    const horas = parseFloat(horaDormir.split(':')[0]);
    const limites = {
      'normal': { min: 21, max: 22 },
      'partido': { min: 21, max: 23 },
      'fiesta': { min: 0, max: 24 }
    };

    const limite = limites[tipoDia];
    const esValido = tipoDia === 'fiesta' || (horas >= limite.min && horas < limite.max);

    const sueñoData = {
      hora_dormir: horaDormir,
      tipo_dia: tipoDia,
      cumple_norma: esValido,
      timestamp: new Date().toISOString()
    };

    this.storage.setSueño(this.hoy, sueñoData);
    
    if (esValido) {
      alert('Sueño registrado correctamente');
    } else {
      alert('ADVERTENCIA: Hora fuera de rango. El día será marcado como FALLADO.');
    }

    document.getElementById('form-sueño').reset();
    this.render();
  }

  /**
   * Renderiza la página
   */
  render() {
    this.renderEstadoDia();
    this.renderHistorico();
  }

  /**
   * Renderiza estado del día
   */
  renderEstadoDia() {
    const sueño = this.storage.getSueño(this.hoy);
    const statusEl = document.getElementById('day-status');

    if (!sueño) {
      statusEl.classList.remove('alert-success');
      statusEl.classList.add('alert-danger');
      statusEl.innerHTML = `<strong>Estado: PENDIENTE</strong> (Sin registro)`;
    } else {
      const esValido = Validators.validarSueño(sueño);
      
      if (esValido) {
        statusEl.classList.remove('alert-danger');
        statusEl.classList.add('alert-success');
        statusEl.innerHTML = `<span class="text-success">✓ Estado: CUMPLIDO</span>`;
      } else {
        statusEl.classList.remove('alert-success');
        statusEl.classList.add('alert-danger');
        statusEl.innerHTML = `<span class="text-danger">✗ Estado: FALLADO</span>`;
      }
    }
  }

  /**
   * Renderiza histórico de 30 últimos días
   */
  renderHistorico() {
    const tbody = document.getElementById('tbody-historico');
    tbody.innerHTML = '';

    const hoy = new Date();
    for (let i = 29; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaISO = fecha.toISOString().split('T')[0];

      const sueño = this.storage.getSueño(fechaISO);

      const row = document.createElement('tr');

      if (sueño) {
        const esValido = Validators.validarSueño(sueño);
        const estadoClass = esValido ? 'text-success' : 'text-danger';
        const estadoText = esValido ? 'CUMPLIDO' : 'FALLADO';
        
        const tipoTexto = {
          'normal': 'Normal',
          'partido': 'Partido',
          'fiesta': 'Fiesta'
        }[sueño.tipo_dia] || 'N/A';

        row.innerHTML = `
          <td>${Utils.formatFecha(fechaISO)}</td>
          <td>${tipoTexto}</td>
          <td>${sueño.hora_dormir}</td>
          <td><span class="${estadoClass}">${estadoText}</span></td>
          <td>
            <button class="btn btn-danger" onclick="horarioPage.eliminarRegistro('${fechaISO}')">
              Eliminar
            </button>
          </td>
        `;
      } else {
        row.innerHTML = `
          <td>${Utils.formatFecha(fechaISO)}</td>
          <td colspan="3" class="text-muted">SIN REGISTRO</td>
          <td></td>
        `;
      }

      tbody.appendChild(row);
    }
  }

  /**
   * Elimina un registro de sueño
   */
  eliminarRegistro(fecha) {
    if (confirm('¿Eliminar registro del ' + Utils.formatFecha(fecha) + '?')) {
      const data = this.storage.getData();
      delete data.sueño[fecha];
      this.storage.setRaw(data);
      this.render();
    }
  }
}

// Variable global
let horarioPage;
