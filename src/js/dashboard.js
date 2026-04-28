/* ============================================
   DASHBOARD - Lógica de renderizado
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar reloj
  new Clock('clock');

  // Inicializar dashboard
  const dashboard = new Dashboard();
  dashboard.render();

  // Escuchar cambios de storage (sincronización entre pestañas)
  window.addEventListener('disciplina-storage-change', () => {
    dashboard.render();
  });
});

class Dashboard {
  constructor() {
    this.storage = new StorageManager();
  }

  /**
   * Renderiza el dashboard completo
   */
  render() {
    this.renderProgressStats();
    this.renderModuleCards();
  }

  /**
   * Renderiza estadísticas de la semana
   */
  renderProgressStats() {
    const progreso = Utils.getProgresoSemanal();
    const container = document.getElementById('progress-stats');
    
    container.innerHTML = `
      <div class="stat-box">
        <div class="stat-value text-success">${progreso.cumplidos}</div>
        <div class="stat-label">Días Cumplidos</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${progreso.total}</div>
        <div class="stat-label">Días Totales (Semana)</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${Utils.formatNumber(progreso.porcentaje, 0)}%</div>
        <div class="stat-label">Cumplimiento</div>
      </div>
    `;
  }

  /**
   * Renderiza las 4 tarjetas de módulos
   */
  renderModuleCards() {
    const status = Utils.getDiaStatus();
    const hoy = status.fecha;

    // ENTRENAMIENTO
    this.renderCard(
      'card-entrenamiento',
      'status-entrenamiento',
      status.detalles.entrenamiento
    );

    // NUTRICIÓN
    this.renderCard(
      'card-nutricion',
      'status-nutricion',
      status.detalles.nutricion
    );

    // PROGRESO (siempre "completable", no tiene validación estricta hoy)
    this.renderCard(
      'card-progreso',
      'status-progreso',
      this.storage.getPesoDiario(hoy) !== null
    );

    // HORARIO
    this.renderCard(
      'card-horario',
      'status-horario',
      status.detalles.sueño
    );
  }

  /**
   * Actualiza una tarjeta individual
   */
  renderCard(cardId, statusId, cumplido) {
    const card = document.getElementById(cardId);
    const statusEl = document.getElementById(statusId);

    if (cumplido) {
      card.classList.remove('card-danger');
      card.classList.add('card-success');
      statusEl.textContent = 'CUMPLIDO';
      statusEl.classList.remove('text-danger');
      statusEl.classList.add('text-success');
    } else {
      card.classList.remove('card-success');
      card.classList.add('card-danger');
      statusEl.textContent = 'FALLADO';
      statusEl.classList.remove('text-success');
      statusEl.classList.add('text-danger');
    }
  }
}
