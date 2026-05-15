/* ============================================
   PROGRESO - Gráfica y registro de peso
   ============================================ */

let chart = null;

document.addEventListener('DOMContentLoaded', () => {
  window.progreso = new ProgresoPage();
  progreso.init();

  window.addEventListener('disciplina-storage-change', () => {
    progreso.render();
  });
});

class ProgresoPage {
  constructor() {
    this.storage = new StorageManager();
    this.hoy = this.storage.getTodayISO();
  }

  init() {
    this.setupConfigForm();
    this.setupPesoForm();
    this.render();
  }

  setupConfigForm() {
    const form = document.getElementById('form-config');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarConfiguracion();
    });
  }

  setupPesoForm() {
    const form = document.getElementById('form-peso');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarPeso();
    });
  }

  obtenerConfiguracion() {
    const data = this.storage.getData();
    return data.user_profile || {};
  }

  guardarConfiguracion() {
    const origen = parseFloat(document.getElementById('origen-peso').value);
    const objetivo = parseFloat(document.getElementById('objetivo-peso').value);
    const grasa = parseFloat(document.getElementById('objetivo-grasa').value);

    if (!Number.isFinite(origen) || !Number.isFinite(objetivo)) {
      alert('Debes completar el peso de origen y el objetivo de peso.');
      return;
    }

    const data = this.storage.getData();
    data.user_profile = data.user_profile || {};
    data.user_profile.peso_origen = origen;
    data.user_profile.objetivo_peso = objetivo;
    data.user_profile.objetivo_grasa = Number.isFinite(grasa) ? grasa : null;
    this.storage.setRaw(data);

    alert('Configuración de objetivos guardada.');
    this.render();
  }

  guardarPeso() {
    const peso = parseFloat(document.getElementById('peso-input').value);
    if (!peso || peso < 60 || peso > 130) {
      alert('Ingresa un peso válido (60-130 kg)');
      return;
    }

    this.storage.setPesoDiario(this.hoy, peso);
    alert(`Peso registrado: ${Utils.formatNumber(peso, 1)} kg`);
    document.getElementById('form-peso').reset();
    this.render();
  }

  render() {
    this.cargarConfiguracion();
    this.renderGrafica();
    this.renderEstadisticas();
    this.renderHistorico();
  }

  cargarConfiguracion() {
    const config = this.obtenerConfiguracion();
    document.getElementById('stat-origen').textContent = config.peso_origen ? Utils.formatNumber(config.peso_origen, 1) : '-';
    document.getElementById('stat-objetivo-peso').textContent = config.objetivo_peso ? Utils.formatNumber(config.objetivo_peso, 1) : '-';
    document.getElementById('stat-objetivo-grasa').textContent = Number.isFinite(config.objetivo_grasa) ? Utils.formatNumber(config.objetivo_grasa, 1) + '%' : '-';
    document.getElementById('origen-peso').value = config.peso_origen || '';
    document.getElementById('objetivo-peso').value = config.objetivo_peso || '';
    document.getElementById('objetivo-grasa').value = Number.isFinite(config.objetivo_grasa) ? config.objetivo_grasa : '';
  }

  obtenerDatosGrafica() {
    const historico = this.storage.getHistoricoPesos(90);
    const config = this.obtenerConfiguracion();
    const labels = historico.map((registro) => Utils.formatFecha(registro.fecha));
    const datos = historico.map((registro) => registro.peso);
    const objetivo = Number.isFinite(config.objetivo_peso) ? config.objetivo_peso : null;
    const lineaObjetivo = objetivo !== null ? Array(labels.length).fill(objetivo) : [];
    return { labels, datos, lineaObjetivo };
  }

  renderGrafica() {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    const { labels, datos, lineaObjetivo } = this.obtenerDatosGrafica();

    if (chart) {
      chart.destroy();
    }

    const datasets = [
      {
        label: 'Peso Corporal (kg)',
        data: datos,
        borderColor: '#55FF55',
        backgroundColor: 'rgba(85, 255, 85, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#55FF55',
        pointBorderColor: '#121212',
        pointBorderWidth: 2,
      },
    ];

    if (lineaObjetivo.length) {
      datasets.push({
        label: 'Objetivo de Peso',
        data: lineaObjetivo,
        borderColor: '#FF5555',
        borderWidth: 2,
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        tension: 0,
      });
    }

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#ffffff',
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#2a2a2a',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#555555',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${Utils.formatNumber(context.parsed.y, 1)} kg`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: '#333333',
            },
            ticks: {
              color: '#cccccc',
            },
            title: {
              display: true,
              text: 'Peso (kg)',
              color: '#ffffff',
            },
          },
          x: {
            grid: {
              color: '#333333',
            },
            ticks: {
              color: '#cccccc',
            },
          },
        },
      },
    });
  }

  renderEstadisticas() {
    const historico = this.storage.getHistoricoPesos(90);
    const config = this.obtenerConfiguracion();
    document.getElementById('stat-dias').textContent = historico.length;

    if (historico.length === 0) {
      document.getElementById('stat-minimo').textContent = '-';
      document.getElementById('stat-maximo').textContent = '-';
      document.getElementById('stat-promedio').textContent = '-';
      return;
    }

    const pesos = historico.map((registro) => registro.peso);
    const minimo = Math.min(...pesos);
    const maximo = Math.max(...pesos);
    const promedio = pesos.reduce((acc, peso) => acc + peso, 0) / pesos.length;

    document.getElementById('stat-minimo').textContent = Utils.formatNumber(minimo, 1);
    document.getElementById('stat-maximo').textContent = Utils.formatNumber(maximo, 1);
    document.getElementById('stat-promedio').textContent = Utils.formatNumber(promedio, 1);

    document.getElementById('stat-origen').textContent = config.peso_origen ? Utils.formatNumber(config.peso_origen, 1) : '-';
    document.getElementById('stat-objetivo-peso').textContent = config.objetivo_peso ? Utils.formatNumber(config.objetivo_peso, 1) : '-';
    document.getElementById('stat-objetivo-grasa').textContent = Number.isFinite(config.objetivo_grasa) ? `${Utils.formatNumber(config.objetivo_grasa, 1)}%` : '-';
  }

  renderHistorico() {
    const historico = this.storage.getHistoricoPesos(30);
    const tbody = document.getElementById('tbody-historico');
    tbody.innerHTML = '';

    if (!historico.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin registros de peso</td></tr>';
      return;
    }

    historico.forEach((registro, index) => {
      const pesoAnterior = index > 0 ? historico[index - 1].peso : null;
      const cambio = pesoAnterior !== null ? registro.peso - pesoAnterior : null;
      const cambioTexto = cambio !== null ? `${cambio > 0 ? '+' : ''}${Utils.formatNumber(cambio, 1)} kg` : '-';
      const cambioClase = cambio !== null ? (cambio < 0 ? 'text-success' : cambio > 0 ? 'text-danger' : '') : '';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${Utils.formatFecha(registro.fecha)}</td>
        <td>${Utils.formatNumber(registro.peso, 1)}</td>
        <td><span class="${cambioClase}">${cambioTexto}</span></td>
        <td><button class="btn btn-danger btn-small" data-fecha="${registro.fecha}">Eliminar</button></td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll('button[data-fecha]').forEach((button) => {
      button.addEventListener('click', () => {
        this.eliminarRegistro(button.dataset.fecha);
      });
    });
  }

  eliminarRegistro(fecha) {
    if (!confirm(`¿Eliminar registro del ${Utils.formatFecha(fecha)}?`)) return;
    const data = this.storage.getData();
    delete data.peso_diario[fecha];
    this.storage.setRaw(data);
    this.render();
  }
}
