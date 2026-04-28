/* ============================================
   PROGRESO - Gráfica y registro de peso
   ============================================ */

let chart = null;

document.addEventListener('DOMContentLoaded', () => {
  const progreso = new ProgresoPage();
  progreso.init();

  // Escuchar cambios
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
    this.setupForm();
    this.render();
  }

  setupForm() {
    const form = document.getElementById('form-peso');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.guardarPeso();
    });
  }

  /**
   * Guarda peso del día
   */
  guardarPeso() {
    const peso = parseFloat(document.getElementById('peso-input').value);
    
    if (!peso || peso < 60 || peso > 130) {
      alert('Ingresa un peso válido (60-130 kg)');
      return;
    }

    this.storage.setPesoDiario(this.hoy, peso);
    alert('Peso registrado: ' + Utils.formatNumber(peso, 1) + ' kg');
    
    document.getElementById('form-peso').reset();
    this.render();
  }

  /**
   * Renderiza la página completa
   */
  render() {
    this.renderGrafica();
    this.renderEstadisticas();
    this.renderHistorico();
  }

  /**
   * Renderiza gráfica con Chart.js
   */
  renderGrafica() {
    const historico = this.storage.getHistoricoPesos(90);
    
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    // Destruir gráfica anterior
    if (chart) {
      chart.destroy();
    }

    // Preparar datos
    const labels = historico.map(p => Utils.formatFecha(p.fecha));
    const datos = historico.map(p => p.peso);

    // Crear gráfica
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Peso Corporal (kg)',
            data: datos,
            borderColor: '#55FF55',
            backgroundColor: 'rgba(85, 255, 85, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#55FF55',
            pointBorderColor: '#121212',
            pointBorderWidth: 2,
            pointHoverRadius: 6
          },
          {
            label: 'Objetivo 12% Grasa',
            data: Array(labels.length).fill(this.calcularPesoObjetivo()),
            borderColor: '#FF5555',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#ffffff',
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#2a2a2a',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#555555',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + Utils.formatNumber(context.parsed.y, 1) + ' kg';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 80,
            max: 110,
            grid: {
              color: '#333333'
            },
            ticks: {
              color: '#cccccc'
            },
            title: {
              display: true,
              text: 'Peso (kg)',
              color: '#ffffff'
            }
          },
          x: {
            grid: {
              color: '#333333'
            },
            ticks: {
              color: '#cccccc'
            }
          }
        }
      }
    });
  }

  /**
   * Calcula peso objetivo estimado (12% grasa)
   * Basado en 96.0 kg inicial
   */
  calcularPesoObjetivo() {
    // Estimación simple: 12% grasa corporal
    // Para hombre de ~180cm, ~80-82 kg es razonable
    return 82.0;
  }

  /**
   * Renderiza estadísticas
   */
  renderEstadisticas() {
    const historico = this.storage.getHistoricoPesos(90);
    
    document.getElementById('stat-dias').textContent = historico.length;
    document.getElementById('objetivo-peso').textContent = Utils.formatNumber(this.calcularPesoObjetivo(), 1);

    if (historico.length === 0) {
      document.getElementById('stat-minimo').textContent = '-';
      document.getElementById('stat-maximo').textContent = '-';
      document.getElementById('stat-promedio').textContent = '-';
      return;
    }

    const pesos = historico.map(p => p.peso);
    const minimo = Math.min(...pesos);
    const maximo = Math.max(...pesos);
    const promedio = pesos.reduce((a, b) => a + b, 0) / pesos.length;

    document.getElementById('stat-minimo').textContent = Utils.formatNumber(minimo, 1);
    document.getElementById('stat-maximo').textContent = Utils.formatNumber(maximo, 1);
    document.getElementById('stat-promedio').textContent = Utils.formatNumber(promedio, 1);
  }

  /**
   * Renderiza histórico de pesos
   */
  renderHistorico() {
    const historico = this.storage.getHistoricoPesos(30);
    const tbody = document.getElementById('tbody-historico');
    tbody.innerHTML = '';

    if (historico.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin registros de peso</td></tr>';
      return;
    }

    for (let i = historico.length - 1; i >= 0; i--) {
      const registro = historico[i];
      const pesoAnterior = i < historico.length - 1 ? historico[i + 1].peso : null;
      
      let cambioText = '-';
      let cambioClass = '';
      
      if (pesoAnterior !== null) {
        const cambio = registro.peso - pesoAnterior;
        cambioText = (cambio > 0 ? '+' : '') + Utils.formatNumber(cambio, 1) + ' kg';
        cambioClass = cambio < 0 ? 'text-success' : 'text-danger';
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${Utils.formatFecha(registro.fecha)}</td>
        <td>${Utils.formatNumber(registro.peso, 1)}</td>
        <td><span class="${cambioClass}">${cambioText}</span></td>
        <td>
          <button class="btn btn-danger" onclick="progreso.eliminarRegistro('${registro.fecha}')">
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    }
  }

  /**
   * Elimina un registro de peso
   */
  eliminarRegistro(fecha) {
    if (confirm('¿Eliminar registro del ' + Utils.formatFecha(fecha) + '?')) {
      const data = this.storage.getData();
      delete data.peso_diario[fecha];
      this.storage.setRaw(data);
      this.render();
    }
  }
}

// Variable global
let progreso;
document.addEventListener('DOMContentLoaded', () => {
  progreso = new ProgresoPage();
  progreso.init();
});
