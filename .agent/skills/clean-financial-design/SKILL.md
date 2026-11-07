---
name: clean-financial-design
description: >-
  Guía de diseño y estándares visuales de interfaz financiera institucional (alta densidad y bajo ruido).
  Usar para diseñar, refactorizar o auditar componentes de interfaz en SIFTC (ALZA), eliminando el
  ruido visual típico de plantillas de IA (cajas anidadas, sombras pesadas, exceso de bordes y badges redundantes).
---

# 🏛️ Guía de Diseño Financiero Institucional: Clean Financial Design (ALZA)

Esta guía define las reglas de diseño para transformar la interfaz de **SIFTC (ALZA)** en una plataforma financiera moderna, sobria y de nivel profesional (inspirada en terminales como Koyfin, TradingView, Bloomberg Web y el minimalismo de Linear), eliminando el "ruido visual de IA".

---

## 1. El Manifiesto Anti-Ruido Visual

### 🚫 Patrones Prohibidos (Vicios Típicos de IA)
1. **Cajas anidadas (Cards within Cards):** Nunca coloques tarjetas con fondo blanco, bordes y sombras dentro de un contenedor que ya tiene borde o fondo de tarjeta.
2. **Sombras y elevaciones pesadas:** Prohibido usar sombras difusas de más de `2px` o elevaciones `translateY(-3px)` con rebotes artificiales. La información bursátil debe sentirse sólida, plana y precisa.
3. **Sobre-etiquetado redundante:** No agregues etiquetas como `"Puntaje:"`, `"Valor:"`, `"Frecuencia:"` antes de cada dato. El contexto y la jerarquía tipográfica deben comunicar qué es cada número.
4. **Badges y pastillas multicolores en cada esquina:** Limitar el uso de badges con bordes redondeados completos (`pill badges`). En finanzas, los datos se presentan en celdas limpias, no en botones de juguete.
5. **Barras de progreso infladas:** Las barras de métricas no deben superar `3px` o `4px` de altura (`hairline progress`). Deben ser discretas, no barras de videojuegos.

---

## 2. Principios de Diseño Bursátil Institucional

### A. Jerarquía Plana y Superficies Limpias (Flat & Border-Subtle)
- Las secciones se delimitan por **espaciado (`gap`)** o **divisores ultra finos de 1px** (`border-bottom: 1px solid var(--color-border)`).
- Fondos: Fondo general en blanco hueso neutro (`#F8F9FA` / `#F6F5F3`) y superficies de trabajo en blanco puro (`#FFFFFF`) con bordes sutiles de contraste bajo (`rgba(0, 0, 0, 0.07)` en tema claro, `rgba(255, 255, 255, 0.08)` en tema oscuro).

### B. Tipografía de Datos y Cifras Numéricas
- **Números:** Todo valor numérico debe llevar la clase `.mono-num` (`font-variant-numeric: tabular-nums`).
- **Alineación:** Las cifras en tablas y resúmenes siempre se alinean a la **derecha**.
- **Etiquetas de soporte:** Micro-tipografía en mayúsculas sutiles:
  ```css
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  ```

### C. Paleta Semántica Restringida (Uso Funcional del Color)
- El color comunica **estado de mercado**, no decoración:
  - **Verde bursátil:** Exclusivamente para variaciones positivas (`▲ +X.X %`).
  - **Rojo bursátil:** Exclusivamente para variaciones negativas (`▼ -X.X %`).
  - **Azul pizarra / noche:** Color de marca y navegación.
  - **Gris neutro:** Para todo lo demás (bordes, fondos de métricas, textos secundarios).

---

## 3. Especificación de Componentes Clave

### 📊 Ficha de Entidad y Rejilla de Métricas
- En vez de tarjetas independientes con bordes pesados:
  - Organizar las métricas como una **cuadrícula de datos (Data Grid)** o celdas compactas.
  - Cada celda muestra:
    1. Código de métrica discreto (ej. `ROE`, `ROA`).
    2. Nombre descriptivo en gris legible.
    3. Valor principal en número grande tabular (`mono-num`).
    4. Barra de calibración ultra fina (`h: 3px`) integrada en la base.

### 📈 Gráfica Financiera
- La gráfica interactiva de TradingView debe ser la protagonista:
  - Contenedor con borde simple de 1px, sin bordes redondeados gigantescos (`border-radius: 8px`).
  - Selectores de periodo (Diaria / Mensual / Trimestral) como botones segmentados compactos (`segmented controls`), no botones flotantes con sombras.

### 📋 Tablas de Ranking y Comparador
- Tablas estilo terminal bursátil:
  - Filas compactas con altura uniforme (`min-height: 40px`).
  - Línea separadora horizontal de 1px.
  - Efecto hover sobrio (`background: rgba(0, 0, 0, 0.02)`).

---

## 4. Cero Prosa Explicativa (Zero Instructional Copy) y Adaptabilidad Multi-Pantalla

### A. Prohibición de Textos Tutoriales y Subtítulos Redundantes
En una aplicación financiera profesional, la interfaz se explica por su estructura, no con párrafos de ayuda:
1. **Sin subtítulos obvios bajo el `<h1>`:** No pongas frases como *"Resumen del Índice de Competitividad de las entidades"* o *"Gestiona usuarios, roles y parámetros del sistema"*. El título de la sección es suficiente.
2. **Sin instrucciones de uso de UI:** Prohibido escribir textos como *"Haz clic en el título de una columna para ordenar"*, *"Pasa el cursor sobre la gráfica para ver el detalle"*, *"Haz clic de nuevo para quitarla"* o *"Los filtros quedan guardados en la dirección"*.
3. **Sin etiquetas repetidas en cada celda:** En rejillas de métricas (`MetricasPorDimension`), no repitas las palabras `"Valor crudo"`, `"Puntaje"` ni la frecuencia (`"Mensual"`) ni el valor entre paréntesis `(0,79)` dentro de cada tarjeta. Muestra solo el código (`ROE`), el nombre del indicador, el valor principal a la izquierda y el puntaje (`78,5 pts`) a la derecha sobre la barra de 3px. El desglose técnico va exclusivamente en el modal al hacer clic.
4. **Sin banners promocionales internos ni líneas de debug:** No mostrar banners de *"Compara, decide, avanza"* dentro del Tablero ni líneas técnicas como *"Conectado al backend: https://..."* en Administración.

### B. Diseño Fluido y Responsivo Multi-Pantalla (360px → 1440px+)
- **Contenedor principal (`.contenido`):** Ancho máximo fluido (`max-width: 1380px`) con `padding: clamp(12px, 2.5vw, 28px)`.
- **Rejillas adaptativas (`auto-fit` / `auto-fill`):**
  - Estadísticas OHLC y celdas de resumen: `grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))` (5 en escritorio, 2-3 en tablet/móvil).
  - Rejilla de métricas por dimensión: `grid-template-columns: repeat(auto-fill, minmax(210px, 1fr))` (4-5 por fila en escritorio, 2 en tablet, 1 en móvil).
- **Gráficas responsivas:** El lienzo de `lightweight-charts` debe usar `ResizeObserver` (además de `window.resize`) y ajustar su altura automáticamente (`380px` en escritorio, `280px` en pantallas `< 640px`).
- **Tablas en móvil y tablet:** Contenedor con `overflow-x: auto`, `-webkit-overflow-scrolling: touch` y columnas clave compactas.
