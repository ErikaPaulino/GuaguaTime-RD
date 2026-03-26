# 🚌 GuaguaTime RD - Simulador de Transporte Público -ERIKA GRACIELA PAULINO 100666248

**GuaguaTime RD** es una aplicación web interactiva diseñada para que los usuarios de Santo Domingo Este (sectores como Los Mina, Sabana Perdida, Ensanche Ozama, etc.) puedan calcular las mejores rutas, tiempos y costos del transporte público dominicano.

Este proyecto ha sido desarrollado para el examen parcial de la Licenciatura en Informática.

## 🚀 Funcionalidades Principales
- **Cálculo de Rutas:** Permite comparar opciones entre Guagua, Concho y Motoconcho.
- **Alertas de Tráfico:** Simulación de impacto por lluvia, hora pico y paros de transporte.
- **Gestión de Favoritos:** Permite seleccionar y organizar rutas de interés durante la sesión.
- **Filtros de Búsqueda:** Ordenamiento por menor tiempo, menor costo o disponibilidad de transbordos.

## 📊 Reglas de Cálculo (Lógica Determinista)
La aplicación utiliza una lógica matemática estricta para garantizar resultados consistentes:

1. **Tiempo Base:** Se toma del valor inicial `tiempo_min` definido en los datos maestros (`vias.json`).
2. **Impacto de Condiciones:** Por cada alerta activa (lluvia, tapón, etc.), se aplica un aumento porcentual:
   $$tiempo\_final = tiempo\_base \times (1 + \frac{porcentaje\_retraso}{100})$$
3. **Costo de Viaje:** Se calcula sumando el pasaje base + el costo extra por transbordo + posibles cargos adicionales por paros de transporte.
4. **Redondeo:** Todos los tiempos se muestran redondeados al minuto más cercano utilizando `Math.round()`.

## 🛠️ Especificaciones Técnicas
- **HTML5 Semántico:** Estructura organizada con etiquetas `<nav>`, `<main>`, `<section>` y `<article>` para mejorar la accesibilidad.
- **CSS3 Moderno:** Diseño basado en **Flexbox** y **CSS Grid**, utilizando **Variables CSS** para una gestión eficiente de los colores.
- **JavaScript Vanilla:** Uso de funciones puras, carga de datos dinámicos con `fetch` desde archivos JSON locales y manipulación del DOM sin librerías externas.

## 📦 Cómo ejecutar el proyecto
1. Descarga o clona este repositorio.
2. Asegúrate de tener las carpetas `css`, `js`, `data` e `imagenes` en el mismo nivel.
3. Abre el archivo `index.html` en tu navegador preferido.

---
© 2026 - Proyecto Académico | UASD | ERIKA GRACIELA PAULINO - 