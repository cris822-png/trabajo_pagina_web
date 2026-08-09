# Explicación Detallada de los Archivos HTML - DISCIPLINA AUDIT

Este documento contiene la explicación de la estructura y línea por línea (agrupado por bloques lógicos para mayor legibilidad) de todos los archivos HTML que componen la aplicación web **DISCIPLINA AUDIT**.

La aplicación consta de 6 archivos HTML principales:
1. `index.html` - Dashboard principal.
2. `src/pages/auth.html` - Página de autenticación (Login/Registro).
3. `src/pages/entrenamiento.html` - Módulo de entrenamiento (Fuerza y Cardio).
4. `src/pages/nutricion.html` - Módulo de nutrición (Ingestas diarias).
5. `src/pages/progreso.html` - Módulo de progreso (Peso, objetivos y gráficas).
6. `src/pages/horario.html` - Módulo de horario y descanso (Auditoría de sueño).

---

## Estructura Común (Head y Scripts)
Para evitar repetir la explicación de las mismas líneas en todos los archivos, aquí se describe la estructura base que todos comparten al inicio y final del documento:

- `<!DOCTYPE html>`: Define el tipo de documento como HTML5, necesario para que los navegadores rendericen la página correctamente.
- `<html lang="es">`: Etiqueta raíz del documento, estableciendo el idioma de la página a español (`es`).
- `<head>`: Contenedor de metadatos, enlaces a estilos y título de la página. Todo lo de aquí es invisible en la página pero vital.
  - `<meta charset="UTF-8">`: Establece la codificación de caracteres a UTF-8 para soportar tildes, eñes y caracteres especiales.
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`: Hace que la página sea responsiva y se adapte al ancho del dispositivo móvil o de escritorio.
  - `<title>...</title>`: Define el título visible en la pestaña superior del navegador web.
  - `<link rel="stylesheet" href="...">`: Vincula la hoja de estilos CSS correspondiente para dar colores, márgenes y diseño a la página.
- `<body>`: Etiqueta principal que contiene todo el contenido visible de la página (textos, botones, imágenes).
- `<header>` y `<nav>`: Cabecera superior y barra de navegación. Generalmente incluye el título de la página y botones de retorno o inicio de sesión.
- `<main>`: Contenedor semántico principal donde residen las diferentes secciones (`<section>`) y el contenido único de la página.
- `<footer>`: Pie de página con información de copyright, versión o descripción de la aplicación.
- `<script src="..."></script>`: (Al final del body) Enlaces a los archivos JavaScript encargados de la lógica de programación y la interactividad. Se colocan al final para que la página visual cargue primero.

---

## 1. `index.html` (Dashboard Principal)

- **Líneas 1-9**: Estructura común del `<head>`. Incluye estilos generales (`src/css/style.css`) y específicos del dashboard (`src/css/index.css`).
- **Línea 10**: `<body class="page-dashboard">` Asigna una clase para aplicarle estilos específicos al fondo del dashboard.
- **Líneas 12-28**: `<header>` (Cabecera).
  - Contiene un `<nav class="header-top">` dividido en tres partes: el título principal (`<h1>`), un reloj en tiempo real (`<div class="clock-center">` con un `span` de id `#clock` que se actualiza vía JavaScript), y el menú de usuario (`<div class="user-menu">`) con un botón para iniciar sesión (`#user-action-btn`).
- **Líneas 30-108**: `<main>` (Cuerpo Principal de la Aplicación).
  - **Líneas 32-38**: Sección de Progreso Semanal (`<h2>`). Contiene un div `<div id="progress-stats">` vacío que será inyectado dinámicamente por JavaScript con las estadísticas semanales.
  - **Líneas 40-106**: Sección de Módulos de Auditoría (`<div class="grid grid-4">`). Define una cuadrícula que contiene 4 tarjetas clicables (`<a>`):
    - **Líneas 45-58**: Tarjeta 1 - ENTRENAMIENTO. Enlaza a `entrenamiento.html`. Tiene un título y un estado (`#status-entrenamiento`) que se pondrá en "CUMPLIDO" o "PENDIENTE" vía JS.
    - **Líneas 60-73**: Tarjeta 2 - NUTRICIÓN. Enlaza a `nutricion.html`.
    - **Líneas 75-88**: Tarjeta 3 - PROGRESO. Enlaza a `progreso.html`.
    - **Líneas 90-103**: Tarjeta 4 - HORARIO. Enlaza a `horario.html`.
- **Líneas 110-113**: `<footer>` con el texto de versión de la aplicación.
- **Líneas 115-117**: Importación de scripts globales y del dashboard (`main.js` y `dashboard.js`).
- **Líneas 118-141**: Script en línea (dentro de la etiqueta `<script>`) que contiene la función `updateUserActionButton()`. Esta función lee la memoria del navegador (`sessionStorage`) para verificar si el usuario ha iniciado sesión. Si es así, reemplaza el texto de "INICIAR SESIÓN" por el nombre del usuario. Se dispara al evento `DOMContentLoaded`.

---

## 2. `src/pages/auth.html` (Autenticación - Iniciar Sesión / Registro)

- **Líneas 1-8**: Estructura `<head>` estándar con importación de `auth.css`.
- **Línea 10**: `<div class="auth-page">` Contenedor principal para centrar visualmente toda la interfaz de login.
- **Línea 11**: `<div class="auth-card">` Caja blanca (tarjeta) que enmarca visualmente los campos del formulario.
- **Líneas 12-15**: Bloque de cabecera de autenticación (`auth-header`) con el título (`<h1 id="auth-title">`) y un párrafo de subtítulo explicativo.
- **Líneas 17-20**: Botones de alternancia (`auth-toggle`). Contiene dos botones (`#btn-login` y `#btn-register`) que cuando el usuario hace clic en ellos cambian el modo entre iniciar sesión y registrar una nueva cuenta (manejado por auth.js).
- **Líneas 22-39**: Formulario (`<form id="auth-form">`). Agrupa los campos de entrada:
  - **Líneas 23-26**: Grupo para el Nombre de "Usuario" (`<input type="text" id="usuario">`). Este input tiene su propio `id` (`group-usuario`) para poder ocultarlo cuando el modo es solo "Iniciar sesión".
  - **Líneas 28-31**: Grupo de "Correo electrónico" (`<input type="email" id="correo">`). Exige que tenga formato con `@`.
  - **Líneas 33-36**: Grupo de "Contraseña" (`<input type="password" id="contrasena">`). Oculta el texto tipado.
  - **Línea 38**: Botón principal (`<button type="submit" id="submit-button">`) que dispara el evento de enviar los datos (`Entrar`).
- **Línea 41**: Etiqueta `<p id="auth-error">`. Inicialmente vacía. Si hay un error (ej: contraseña incorrecta), JS escribirá aquí un texto rojo.
- **Línea 45**: `<script src="../js/auth.js"></script>` Carga la lógica de validación de usuarios.

---

## 3. `src/pages/entrenamiento.html` (Módulo de Entrenamiento)

- **Líneas 1-17**: Head y Cabecera. El botón de retroceso (`<a href="../../index.html">← Volver</a>`) apunta de vuelta al dashboard.
- **Líneas 22-54**: `<section>` **Fuerza**. Contiene un formulario (`#form-fuerza`) para registrar levantamiento de pesas.
  - Divide la vista en filas (`<div class="form-row">`).
  - Pide datos usando `<input>` de diferentes tipos: Nombre del ejercicio (texto), Peso en kg (número, permitiendo decimales con `step="0.5"`), Repeticiones (número entero).
  - Incluye un selector desplegable (`<select id="fuerza-tipo">`) para especificar si el ejercicio es "Bilateral" o "Unilateral".
  - Botón de submit (Línea 52) para añadir a la sesión actual.
- **Líneas 56-85**: `<section>` **Cardio**. Contiene un formulario (`#form-cardio`) enfocado a rutinas de máquinas aeróbicas.
  - Utiliza inputs numéricos para recolectar: Tipo de Máquina (texto), Duración en minutos, Inclinación en % y Velocidad en km/h. Todos son campos requeridos (`required`).
- **Líneas 87-107**: `<section>` **Entrenando**. Este bloque es el "panel de control" interactivo durante la sesión en vivo de gimnasio.
  - Posee botones para `#btn-iniciar-entrenamiento` y `#btn-terminar-entrenamiento`.
  - Tiene un cronómetro (`<span id="entrenamiento-timer">`) que arrancará en 00:00:00.
  - Un contenedor vacío (`<div id="entrenando-content">`) que JS alimentará con todos los ejercicios que se van agregando mediante los formularios de arriba.
- **Líneas 109-124**: `<section>` **Histórico de Entrenamientos**. Define una tabla HTML (`<table id="table-historico-entrenamientos">`) genérica (solo la cabecera `<thead>`). El `<tbody>` se rellenará vía script con las sesiones guardadas de días anteriores.
- **Líneas 126-167**: `<section>` **Histórico** (Sección inferior). Define un layout en cuadrícula (`history-grid`) para mostrar de forma desglosada dos tablas paralelas: una tabla con todo el histórico línea a línea de los ejercicios de Fuerza, y otra paralela para el Cardio.
- **Líneas 177-178**: Importación de scripts (`main.js` y `entrenamiento.js`).

---

## 4. `src/pages/nutricion.html` (Módulo de Nutrición)

- **Líneas 1-17**: Head y Cabecera estándar del módulo Nutrición.
- **Líneas 22-70**: `<section>` **Registro Diario de Nutrición**. Un formulario (`#form-ingesta`) destinado a capturar cada comida.
  - **Líneas 28-35**: Inputs de Hora del consumo (`type="time"`) y Nombre del alimento consumido (`type="text"`).
  - **Líneas 38-51**: Selector `<select id="ingesta-unidad">` para clasificar en Gramos, Litros o Unidades, seguido del `<input type="number">` de la cantidad.
  - **Líneas 53-57**: Checkbox de control (`<input type="checkbox" id="ingesta-mezcla">`) utilizado para indicar si la ingesta es un "batido" o una "comida compleja" con varios elementos.
  - **Líneas 59-62**: Caja de texto múltiple (`<textarea id="ingesta-ingredientes">`). Esta parte inicia oculta (`class="hidden"`) y Javascript le quitará el ocultamiento si el usuario activa el checkbox superior.
  - **Línea 64-66**: Alerta roja de validación. Permanecerá oculta a menos que el usuario intente enviar una "mezcla" pero deje vacío el campo de ingredientes.
- **Líneas 72-74**: Contenedor div (`#status-dia`) que funciona como banner dinámico superior. JS lo usará para decir: "Llevas 3 ingestas hoy" (Estado).
- **Líneas 76-95**: `<section>` **Tabla diaria**. Tabla HTML con cabeceras para listar, ordenar y permitir visualizar/eliminar (`#tbody-ingesta`) todas las comidas metidas en el día en curso.
- **Líneas 105-106**: Importa los scripts `main.js` y `nutricion.js`.

---

## 5. `src/pages/progreso.html` (Módulo de Progreso)

- **Línea 8**: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`: Una inclusión muy importante. Conecta con el servidor de contenido (CDN) de Chart.js para cargar esta poderosa librería externa y así poder dibujar gráficas (en vez de hacerlas a mano).
- **Líneas 23-27**: Alerta azul (`alert-info`) que actúa como recordatorio de texto fijo para recomendar un horario al pesarse.
- **Líneas 29-50**: `<section>` **Configuración de Objetivo**. Formulario (`#form-config`) para la parametrización de metas del usuario:
  - Tres `<input type="number">`: Peso de origen (dónde arrancó), Peso objetivo (meta), y Objetivo de Grasa corporal en %. Poseen límites matemáticos como `min="40"` y `max="200"`.
- **Líneas 52-63**: `<section>` **Registro de Peso Diario**. Un simple formulario (`#form-peso`) con un único campo numérico para apuntar el pesaje actual.
- **Líneas 65-81**: `<section>` **Resumen de Objetivos**. Presentación de datos. Utiliza tres cajas de clase `.stat-box` cuyos valores (por ejemplo, `#stat-origen`) arrancan en el símbolo `-` y serán sustituidos por Javascript usando los datos del LocalStorage.
- **Líneas 83-88**: `<section>` **Gráfica de Progreso**. Contiene un `<canvas id="progress-chart"></canvas>`. El canvas es un lienzo en blanco para HTML5; el script `progreso.js` utilizará Chart.js sobre él para pintar líneas y puntos.
- **Líneas 90-110**: `<section>` **Estadísticas**. Cuatro pequeñas tarjetas estadísticas (`.stat-box`) que mostrarán: Total de días registrados, Peso Mínimo histórico, Máximo y Promedio (Todos los cálculos se hacen automáticos en el JS).
- **Líneas 112-127**: `<section>` **Histórico de Registros**. La tabla HTML `#table-historico` listará de forma descendente los pesajes. Una columna interesante es "Cambio", donde JS mostrará con un +/- verde o rojo el progreso respecto al día anterior.
- **Líneas 137-138**: Importación de scripts (`main.js` y `progreso.js`).

---

## 6. `src/pages/horario.html` (Módulo de Horario y Descanso)

- **Líneas 23-35**: Explicación de texto de la auditoría de sueño. Además, un bloque de alerta gigante (`<div id="day-status">`) que cambiará dinámicamente de gris (PENDIENTE) a verde (CUMPLE) o rojo (FALLA).
- **Líneas 37-78**: `<section>` **Formulario de Sueño** (`#form-sueño`).
  - **Líneas 42-54**: Selector HTML `<select id="tipo-dia">`. Permite elegir si es un día "Normal", "Día de Partido" o "Día de Fiesta". Tiene un atributo `onchange="horarioPage.actualizarLimite()"` incrustado en el HTML que dispara una función inmediatamente al elegir una opción, indicando los horarios.
  - **Líneas 57-69**: Input de tiempo (`<input type="time" id="hora-dormir">`). Llama al atributo HTML `onchange="horarioPage.validarHora()"` para verificar si la hora elegida está dentro del rango del tipo de día seleccionado.
  - **Líneas 72-74**: Caja de Alerta de Validación. Si se rompe una regla antes del envío final del form, aparecerá un texto advertencia aquí.
- **Líneas 80-115**: `<section>` **Especificaciones por Tipo de Día**. Bloque netamente informativo (estático). Crea un layout de grid de 3 columnas para enseñar al usuario las reglas lógicas del negocio (Límites para dormir en días normales vs partidos vs fiesta).
- **Líneas 117-130**: `<section id="section-falta-sueño">` **Cálculo de Falta de Sueño**. Está oculta por defecto mediante su clase CSS (`hidden`). Si el usuario seleccionó "Día de Fiesta", Javascript removerá el `.hidden` y utilizará los elementos `#horas-dormidas` y `#horas-faltantes` para enseñar el cálculo matemático de cuánto se debe descansar para compensar.
- **Líneas 132-149**: `<section>` **Histórico de Sueño**. La clásica tabla HTML (`#table-historico`) para que el usuario pueda auditar todos sus registros guardados de descanso.
- **Líneas 159-160**: Importación de scripts (`main.js` y `horario.js`).

---
> **Nota**: El estilo y posicionamiento estructural de estos archivos dependen enteramente de `style.css` y las funcionalidades dinámicas están controladas por los archivos de la carpeta `js/`.
