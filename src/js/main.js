/* ============================================
   DISCIPLINA AUDIT - SISTEMA DE ALMACENAMIENTO
   StorageManager + Validadores + Sincronización
   ============================================ */

/**
 * StorageManager
 * Gestor centralizado de datos en localStorage
 * Maneja CRUD, validación y sincronización entre pestañas
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'disciplina_audit';
    this.init();
    this.setupSyncListener();
  }

  /**
   * Inicializa localStorage con estructura vacía si no existe
   */
  init() {
    if (!this.exists()) {
      const initialData = {
        user_profile: {
          peso_inicial: 96.0,
          objetivo_grasa: 12,
          fecha_inicio: this.getTodayISO(),
        },
        entrenamiento: {},
        nutricion: {},
        peso_diario: {},
        sueño: {},
      };
      this.setRaw(initialData);
    }
  }

  /**
   * Obtiene hoy en formato ISO (YYYY-MM-DD)
   */
  getTodayISO() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Obtiene la estructura completa de datos
   */
  getData() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Guarda la estructura completa
   */
  setRaw(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.broadcastChange();
  }

  /**
   * Verifica si localStorage tiene datos
   */
  exists() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * ============ ENTRENAMIENTO ============
   */

  /**
   * Obtiene datos de entrenamiento del día
   */
  getEntrenamiento(fecha = null) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    return data.entrenamiento[fecha] || null;
  }

  /**
   * Guarda datos de entrenamiento
   */
  setEntrenamiento(fecha, entrenamiento) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    if (!data.entrenamiento[fecha]) {
      data.entrenamiento[fecha] = {};
    }
    data.entrenamiento[fecha] = entrenamiento;
    this.setRaw(data);
  }

  /**
   * ============ NUTRICIÓN ============
   */

  /**
   * Obtiene datos de nutrición del día
   */
  getNutricion(fecha = null) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    return data.nutricion[fecha] || null;
  }

  /**
   * Guarda datos de nutrición
   */
  setNutricion(fecha, nutricion) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    if (!data.nutricion[fecha]) {
      data.nutricion[fecha] = {};
    }
    data.nutricion[fecha] = nutricion;
    this.setRaw(data);
  }

  /**
   * ============ PESO DIARIO ============
   */

  /**
   * Obtiene peso del día
   */
  getPesoDiario(fecha = null) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    return data.peso_diario[fecha] || null;
  }

  /**
   * Guarda peso del día
   */
  setPesoDiario(fecha, peso) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    data.peso_diario[fecha] = peso;
    this.setRaw(data);
  }

  /**
   * Obtiene histórico de pesos (últimos 90 días)
   */
  getHistoricoPesos(dias = 90) {
    const data = this.getData();
    const hoy = new Date();
    const pesos = [];

    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaISO = fecha.toISOString().split('T')[0];
      const peso = data.peso_diario[fechaISO];
      
      if (peso !== undefined) {
        pesos.push({
          fecha: fechaISO,
          peso: peso,
        });
      }
    }
    return pesos;
  }

  /**
   * ============ SUEÑO ============
   */

  /**
   * Obtiene datos de sueño del día
   */
  getSueño(fecha = null) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    return data.sueño[fecha] || null;
  }

  /**
   * Guarda datos de sueño
   */
  setSueño(fecha, sueño) {
    fecha = fecha || this.getTodayISO();
    const data = this.getData();
    if (!data.sueño[fecha]) {
      data.sueño[fecha] = {};
    }
    data.sueño[fecha] = sueño;
    this.setRaw(data);
  }

  /**
   * ============ SINCRONIZACIÓN ============
   */

  /**
   * Configura listener para cambios de storage (otras pestañas)
   */
  setupSyncListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        // Disparar evento personalizado para que páginas se actualicen
        window.dispatchEvent(new CustomEvent('disciplina-storage-change', {
          detail: { newData: JSON.parse(e.newValue) }
        }));
      }
    });
  }

  /**
   * Emite evento de cambio para sincronización entre pestañas
   */
  broadcastChange() {
    window.dispatchEvent(new CustomEvent('disciplina-storage-change', {
      detail: { newData: this.getData() }
    }));
  }
}

/**
 * VALIDADORES
 * Lógica binaria estricta: cumple o falla
 */

class Validators {
  /**
   * Valida datos de cardio
   * Debe ser EXACTO: 5 km/h + 15% inclinación
   */
  static validarCardio(cardio) {
    if (!cardio) return false;
    return (
      cardio.velocidad === 5.0 &&
      cardio.inclinacion === 15 &&
      cardio.tiempo >= 15 // mínimo 15 minutos
    );
  }

  /**
   * Valida datos de sobrecarga (Press inclinado, Curl Scott)
   */
  static validarSobrecarga(registros) {
    if (!registros || !Array.isArray(registros)) return false;
    return registros.length > 0;
  }

  /**
   * Valida comida específica
   * Retorna true si es EXACTA, false si desviación
   */
  static validarComida(tipo, cantidades) {
    const especificaciones = {
      '06_00_platano': { cantidad: 1, unidad: 'unidad' },
      'intra_clase': { cantidad: 0.5, unidad: 'litros' },
      '11_00_bocadillo': { pan: 2, lomo: 7, queso: 1 },
      '14_30_comida': { completada: true },
      '20_30_cena': { huevos: 3 }
    };

    const esp = especificaciones[tipo];
    if (!esp) return false;

    // Validación exacta
    for (const [clave, valor] of Object.entries(esp)) {
      if (cantidades[clave] !== valor) return false;
    }
    return true;
  }

  /**
   * Valida nutrición del día COMPLETA
   * Si alguna comida falla -> día completo falla
   */
  static validarNutricionDia(nutricion) {
    if (!nutricion) return false;

    const comidas = [
      '06_00_platano',
      'intra_clase',
      '11_00_bocadillo',
      '14_30_comida',
      '20_30_cena'
    ];

    // Si está marcado como "día_fallado", retorna false
    if (nutricion.dia_fallado === true) return false;

    // Todas las comidas deben estar completadas
    for (const comida of comidas) {
      if (nutricion[comida] !== true) return false;
    }

    return true;
  }

  /**
   * Valida horario de sueño según tipo de día
   */
  static validarSueño(sueño) {
    if (!sueño || !sueño.hora_dormir) return false;

    const horaDormir = this.parseHora(sueño.hora_dormir);
    const tipoDia = sueño.tipo_dia || 'normal';

    const limites = {
      'normal': { min: 21, max: 22 },
      'partido': { min: 21, max: 23 },
      'fiesta': { min: 0, max: 24 }
    };

    const limite = limites[tipoDia];
    if (!limite) return false;

    if (tipoDia === 'fiesta') {
      // Fiesta no tiene límite, siempre cumple registro
      return true;
    }

    return horaDormir >= limite.min && horaDormir < limite.max;
  }

  /**
   * Convierte "HH:MM" a número decimal (ej: "21:30" -> 21.5)
   */
  static parseHora(horaStr) {
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas + minutos / 60;
  }

  /**
   * Calcula falta de sueño para "Fiesta"
   * Retorna horas faltantes desde hora ideal (8 horas desde 21:00 = despertar 05:00)
   */
  static calcularFaltaSueño(horaDormir) {
    const horas = this.parseHora(horaDormir);
    const horaIdealDespertar = 5.0; // 05:00
    
    let diferencia;
    if (horas > horaIdealDespertar) {
      // Durmió "ayer tarde", despertar hoy
      diferencia = 24 - horas + horaIdealDespertar;
    } else {
      // Durmió "madrugada"
      diferencia = horaIdealDespertar - horas;
    }

    return Math.max(0, 8 - diferencia);
  }
}

/**
 * UTILIDADES GLOBALES
 */

class Utils {
  /**
   * Obtiene estado del día (CUMPLIDO / FALLADO)
   */
  static getDiaStatus(fecha = null) {
    const storage = new StorageManager();
    fecha = fecha || storage.getTodayISO();

    const entrenamiento = storage.getEntrenamiento(fecha);
    const nutricion = storage.getNutricion(fecha);
    const sueño = storage.getSueño(fecha);

    // Todos deben estar completados y válidos
    const entrenamientoOk = entrenamiento && Validators.validarCardio(entrenamiento.cardio);
    const nutricionOk = nutricion && Validators.validarNutricionDia(nutricion);
    const sueñoOk = sueño && Validators.validarSueño(sueño);

    return {
      fecha,
      cumplido: entrenamientoOk && nutricionOk && sueñoOk,
      detalles: {
        entrenamiento: entrenamientoOk,
        nutricion: nutricionOk,
        sueño: sueñoOk
      }
    };
  }

  /**
   * Obtiene estatus de la semana
   */
  static getProgresoSemanal() {
    const storage = new StorageManager();
    const hoy = new Date();
    const dias = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaISO = fecha.toISOString().split('T')[0];
      const status = Utils.getDiaStatus(fechaISO);
      dias.push(status);
    }

    const cumplidos = dias.filter(d => d.cumplido).length;
    return {
      dias,
      cumplidos,
      total: dias.length,
      porcentaje: (cumplidos / dias.length) * 100
    };
  }

  /**
   * Formatea número a formato legible
   */
  static formatNumber(num, decimales = 1) {
    return Number(num).toFixed(decimales);
  }

  /**
   * Formatea fecha ISO a formato legible
   */
  static formatFecha(fechaISO) {
    const fecha = new Date(fechaISO + 'T00:00:00');
    const opciones = { weekday: 'short', month: 'short', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  /**
   * Convierte hora decimal a formato HH:MM
   */
  static formatHora(horaDecimal) {
    const horas = Math.floor(horaDecimal);
    const minutos = Math.round((horaDecimal - horas) * 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }
}

/**
 * CLOCK
 * Reloj en tiempo real para el dashboard
 */
class Clock {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) return;
    this.update();
    setInterval(() => this.update(), 1000);
  }

  update() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    this.element.textContent = `${horas}:${minutos}:${segundos}`;
  }
}

/**
 * Exportar para uso en otros archivos
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, Validators, Utils, Clock };
}
