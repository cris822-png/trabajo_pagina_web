# 🎯 DISCIPLINA AUDIT

**Panel de Control Estricto para Auditoría de Disciplina Personal**

Un sistema binario (cumple o falla) diseñado en modo oscuro para auditar 4 pilares de la disciplina: Entrenamiento, Nutrición, Progreso y Horario de Sueño. Sin motivaciones, sin interfaces amigables. Solo datos, validaciones exactas y lógica booleana.

---

## 🏗️ Características

### ✅ Arquitectura
- **Vanilla JavaScript** — Sin frameworks pesados (solo HTML, CSS, JS puro)
- **localStorage** — Persistencia de datos sin servidor
- **Sincronización entre pestañas** — Cambios en tiempo real via `StorageEvent`
- **Chart.js** — Gráficas de línea para seguimiento de peso
- **CSS Variables** — Tema oscuro dinámico (#121212, verde #55FF55, rojo #FF5555)

### 🎨 Interfaz
- **Dark Mode Estricto** — Fondo #121212, texto blanco, detalles en colores binarios
- **Semántica HTML5** — `<main>`, `<section>`, `<article>`, `<form>` correctamente estructurados
- **Responsive** — Funciona en mobile, tablet y desktop
- **Reloj en Tiempo Real** — Dashboard principal con hora actualizada cada segundo

### 🔒 Validaciones Binarias
- **Entrenamiento**: Cardio exacto (5 km/h + 15% inclinación) o FALLO
- **Nutrición**: 5 comidas con cantidades exactas o día FALLADO
- **Progreso**: Gráfica de peso con tendencia hacia objetivo 12% grasa
- **Horario**: Sueño por rango (Normal 21-22h, Partido ≤23h, Fiesta sin límite)

---

## 📁 Estructura del Proyecto

```
trabajo_pagina_web/
├── index.html                    # Dashboard principal
├── package.json                  # Dependencias (Chart.js)
├── README.md                     # Este archivo
│
├── src/
│   ├── css/
│   │   └── style.css             # Estilos globales + CSS Variables
│   │
│   ├── js/
│   │   ├── main.js               # StorageManager, Validators, Utils, Clock
│   │   ├── dashboard.js          # Lógica del dashboard
│   │   ├── entrenamiento.js      # Gestión de cardio y sobrecarga
│   │   ├── nutricion.js          # Validación de comidas
│   │   ├── progreso.js           # Gráficas y peso
│   │   └── horario.js            # Auditoría de sueño
│   │
│   └── pages/
│       ├── entrenamiento.html    # Módulo de Entrenamiento
│       ├── nutricion.html        # Módulo de Nutrición
│       ├── progreso.html         # Módulo de Progreso
│       └── horario.html          # Módulo de Horario/Descanso
│
├── assets/                       # (Vacío para futuro uso)
└── xml/                          # (Vacío para futuro uso)
```

---

## 🚀 Cómo Ejecutar

### Requisitos
- **Python 3.6+** (para servidor HTTP)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

### Pasos

1. **Navega al directorio del proyecto**
   ```bash
   cd /home/cris/proyectos/trabajo_pagina_web
   ```

2. **Inicia el servidor HTTP**
   ```bash
   python3 -m http.server 8000
   ```
   
   Verás:
   ```
   Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
   ```

3. **Abre en tu navegador**
   ```
   http://localhost:8000
   ```

---

## 📊 Módulos de la Aplicación

### 1️⃣ **DASHBOARD** (`index.html`)

**Página de inicio con resumen diario.**

**Componentes:**
- ⏰ **Reloj en tiempo real** (HH:MM:SS) — Actualiza cada segundo
- 📈 **Progreso Semanal** — Muestra días cumplidos/totales y porcentaje
- 4️⃣ **Grid de 4 tarjetas** — Estado de cada módulo (verde/rojo)

**Colores:**
- 🟢 **Verde** = Módulo completado/cumplido
- 🔴 **Rojo** = Módulo pendiente/fallado

---

### 2️⃣ **ENTRENAMIENTO** (`src/pages/entrenamiento.html`)

**Registro de entrenamiento con sobrecarga progresiva.**

#### Sección 1: Cardio Obligatorio
- **Velocidad**: DEBE SER 5.0 km/h exacto
- **Inclinación**: DEBE SER 15% exacto
- **Tiempo**: Mínimo 15 minutos
- ⚠️ Cualquier desviación marca el día como **FALLADO**

#### Sección 2: Press Inclinado en Máquina (Unilateral)
- Registro de peso **izquierdo** y **derecho** por separado
- Tabla de histórico con opción de eliminar registros

#### Sección 3: Curl en Banco Scott (Unilateral)
- Registro de peso **izquierdo** y **derecho** por separado
- Tabla de histórico con opción de eliminar registros

**Validación:**
```javascript
Cardio VÁLIDO si: velocidad === 5.0 AND inclinacion === 15 AND tiempo >= 15
```

---

### 3️⃣ **NUTRICIÓN** (`src/pages/nutricion.html`)

**Checklist de 5 comidas obligatorias con cantidades exactas.**

| Hora | Comida | Cantidades Exactas |
|------|--------|-------------------|
| 06:00 | Plátano | 1 unidad |
| 08:15-14:15 | Batido Intra-clase | 0.5L leche + 1 scoop proteína + creatina |
| 11:00 (Recreo) | Bocadillo | 2 rodajas pan 35% avena + 7 lonchas lomo + 1 queso |
| 14:30-15:00 | Comida Principal | Completa (sin sustituciones) |
| 20:30 | Cena | 3 huevos en tortilla + ensalada (tomate+cebolla) |

**Lógica:**
- Si **TODAS** las comidas están completadas = **CUMPLIDO** ✓
- Si **ALGUNA** desviación en cantidades = **FALLADO** ✗
- El día se marca automáticamente como "FALLADO" si hay alteración

**Estado Visual:**
- 🟢 **CUMPLIDO** (verde) — Todas exactas
- 🔴 **FALLADO** (rojo) — Alguna desviación o incompleta

---

### 4️⃣ **PROGRESO** (`src/pages/progreso.html`)

**Gráfica de peso corporal hacia objetivo de 12% grasa.**

**Componentes:**

#### Input de Peso
- Rango: 60-130 kg
- ⏰ Recomendación: 18:15-18:30 (post-entreno)
- Se permite registrar fuera del rango (con advertencia)

#### Gráfica Chart.js
- **Eje X**: Fechas (últimos 90 días)
- **Eje Y**: Peso en kg
- **Línea Verde**: Tu peso registrado
- **Línea Roja Punteada**: Objetivo 12% grasa (~82 kg estimado)

#### Estadísticas
- Días registrados
- Peso mínimo/máximo
- Peso promedio
- Objetivo estimado

#### Histórico
- Tabla de últimos 30 registros
- Cambio de peso respecto al día anterior
- Opción de eliminar registros

---

### 5️⃣ **HORARIO Y DESCANSO** (`src/pages/horario.html`)

**Auditoría de sueño con validación por tipo de día.**

#### Tipos de Día

| Tipo | Rango Permitido | Validación |
|------|-----------------|-----------|
| **Normal** | 21:00 - 22:00 | ✓ Si cumple, ✗ Si no |
| **Partido** | 21:00 - 23:00 | ✓ Si cumple, ✗ Si no |
| **Fiesta** | Sin límite | Calcula falta de sueño vs 8h |

**Ejemplos:**
- Dormir 21:30 (Normal) → ✓ CUMPLIDO
- Dormir 23:45 (Normal) → ✗ FALLADO
- Dormir 02:00 (Fiesta) → Sin fallo, pero -3 horas vs 8h

#### Cálculo de Falta de Sueño (Fiesta)
```
Horas esperadas = 8
Horario ideal despertar = 05:00
Si duermes 02:00 → Falta = 3 horas
```

#### Histórico
- Tabla de últimos 30 días
- Tipo de día, hora de dormir, estado
- Opción de eliminar registros

---

## 💾 Estructura de Datos (localStorage)

Todos los datos se guardan en **localStorage** bajo la clave `disciplina_audit`:

```json
{
  "user_profile": {
    "peso_inicial": 96.0,
    "objetivo_grasa": 12,
    "fecha_inicio": "2026-04-28"
  },
  "entrenamiento": {
    "2026-04-28": {
      "cardio": {
        "velocidad": 5.0,
        "inclinacion": 15,
        "tiempo": 20,
        "timestamp": "2026-04-28T11:35:00Z"
      },
      "press_inclinado": [
        {"lado": "izq", "peso": 20.0, "reps": 8},
        {"lado": "der", "peso": 20.0, "reps": 8}
      ],
      "curl_scott": [
        {"lado": "izq", "peso": 15.0, "reps": 10},
        {"lado": "der", "peso": 15.0, "reps": 10}
      ]
    }
  },
  "nutricion": {
    "2026-04-28": {
      "06_00_platano": true,
      "intra_clase": true,
      "11_00_bocadillo": true,
      "14_30_comida": true,
      "20_30_cena": true,
      "dia_fallado": false,
      "detalles": {...},
      "timestamp": "2026-04-28T14:30:00Z"
    }
  },
  "peso_diario": {
    "2026-04-28": 96.5,
    "2026-04-27": 96.3
  },
  "sueño": {
    "2026-04-28": {
      "hora_dormir": "21:30",
      "tipo_dia": "normal",
      "cumple_norma": true,
      "timestamp": "2026-04-28T21:30:00Z"
    }
  }
}
```

---

## 🔄 Sincronización entre Pestañas

La aplicación sincroniza datos en tiempo real entre pestañas del mismo navegador:

1. **Pestaña A**: Registra un peso en Progreso
2. **Pestaña B** (Dashboard): Se actualiza automáticamente sin refrescar
3. Mecanismo: `StorageEvent` listener en `src/js/main.js`

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| **HTML5** | Semántica pura, sin custom elements |
| **CSS3** | Dark mode con variables, Flexbox/Grid |
| **JavaScript (Vanilla)** | Lógica, validadores, StorageManager |
| **Chart.js** | Gráficas de línea (CDN) |
| **localStorage** | Persistencia de datos |
| **Python http.server** | Servidor local para desarrollo |

---

## 📝 Clases Principales

### `StorageManager`
Gestor centralizado de datos en localStorage.

```javascript
const storage = new StorageManager();

// Métodos principales
storage.getEntrenamiento(fecha);
storage.setEntrenamiento(fecha, data);
storage.getNutricion(fecha);
storage.setNutricion(fecha, data);
storage.getPesoDiario(fecha);
storage.setPesoDiario(fecha, peso);
storage.getSueño(fecha);
storage.setSueño(fecha, data);
storage.getHistoricoPesos(dias);
```

### `Validators`
Validadores estrictos con lógica binaria.

```javascript
Validators.validarCardio(cardio);           // Retorna true/false
Validators.validarNutricionDia(nutricion);  // Retorna true/false
Validators.validarSueño(sueño);             // Retorna true/false
Validators.calcularFaltaSueño(horaDormir);  // Retorna horas
```

### `Utils`
Utilidades globales.

```javascript
Utils.getDiaStatus(fecha);        // Retorna {cumplido, detalles}
Utils.getProgresoSemanal();       // Retorna {dias, cumplidos, porcentaje}
Utils.formatNumber(num, decimales);
Utils.formatFecha(fechaISO);
Utils.formatHora(horaDecimal);
```

### `Clock`
Reloj en tiempo real.

```javascript
new Clock('clock');  // Inicializa y actualiza cada segundo
```

---

## 🎨 Variables CSS Personalizables

En `src/css/style.css`, puedes modificar los colores:

```css
:root {
  --bg-primary: #121212;      /* Fondo principal */
  --text-primary: #ffffff;    /* Texto principal */
  --success: #55FF55;         /* Verde para cumplidos */
  --danger: #FF5555;          /* Rojo para fallos */
  --border: #333333;          /* Bordes */
}
```

---

## 🧪 Cómo Probar

### Test 1: Dashboard
1. Abre `http://localhost:8000`
2. Verifica reloj actualiza cada segundo
3. Todas las tarjetas deben estar en ROJO (sin registros)

### Test 2: Entrenamiento
1. Ve a Entrenamiento
2. Ingresa Velocidad: `5.0`, Inclinación: `15`, Tiempo: `20`
3. Haz clic "Registrar Cardio"
4. Vuelve al Dashboard → Tarjeta debe cambiar a VERDE

### Test 3: Nutrición
1. Ve a Nutrición
2. Marca todos los checkboxes
3. Ingresa cantidades EXACTAS (ver tabla arriba)
4. Haz clic "Guardar Nutrición del Día"
5. Vuelve al Dashboard → Tarjeta debe cambiar a VERDE

### Test 4: Progreso
1. Ve a Progreso
2. Ingresa peso: `96.5`
3. Haz clic "Registrar Peso"
4. Verifica gráfica se actualiza

### Test 5: Sincronización
1. Abre 2 pestañas de Dashboard
2. En Pestaña 1 ve a Nutrición y guarda
3. En Pestaña 2 (sin refrescar) verifica cambio inmediato

---

## 📱 Responsividad

La aplicación es **fully responsive**:

| Dispositivo | Ancho | Funcionamiento |
|-------------|-------|---|
| Mobile | < 480px | Grid 1 columna, inputs full-width |
| Tablet | 480-1024px | Grid 2 columnas |
| Desktop | > 1024px | Grid 4 columnas (dashboard) |

---

## ⚠️ Limitaciones Actuales

1. **Sin autenticación** — Todos comparten localStorage del navegador
2. **Sin sincronización servidor** — Solo localStorage local
3. **Límite de datos** — localStorage max ~5-10MB (suficiente para 1 año)
4. **Sin export/import** — Solo lectura de datos via DevTools

---

## 🔮 Posibles Mejoras Futuras

- [ ] Backend con API REST
- [ ] Autenticación de usuarios
- [ ] Export de datos (JSON, CSV)
- [ ] Alertas/notificaciones en horarios clave
- [ ] Modo claro (toggle dark/light)
- [ ] Análisis avanzados (tendencias, correlaciones)
- [ ] Integración con wearables (peso automático)

---

## 📄 Licencia

MIT — Libre para uso personal y educativo.

---

## 👨‍💻 Autor

**Cris** — Sistema de auditoría de disciplina personal  
Desarrollado en **Vanilla JS, HTML5 semántico y CSS3 moderno**  
Abril 2026

---

## 🆘 Soporte

**¿Problemas?**

1. Abre **DevTools** (F12) → **Application** → **Local Storage** → verifica datos
2. Revisa la **Console** (F12 → Console) para errores de JavaScript
3. Prueba eliminar localStorage: `localStorage.clear()`
4. Reinicia el servidor HTTP

---

**Versión**: 1.0.0  
**Última actualización**: 28 de abril de 2026  
**Estado**: ✅ Producción