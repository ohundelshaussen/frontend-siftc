---
name: clean-financial-design
description: >-
  Guía de diseño, métricas visuales exactas y estándares de interfaz financiera institucional (alta densidad,
  cero prosa explicativa y adaptabilidad responsiva multi-pantalla). Usar obligatoriamente para diseñar,
  refactorizar o auditar cualquier componente en SIFTC (ALZA).
---

# 🏛️ Guía y Métricas de Diseño Financiero Institucional: Clean Financial Design (ALZA)

Esta skill define las **métricas numéricas exactas**, reglas de redacción y principios de diseño responsivo para que **SIFTC (ALZA)** mantenga siempre una estética de terminal financiera institucional (inspirada en Koyfin, TradingView, Bloomberg Web y Linear), libre de ruido visual y de vicios típicos de plantillas de IA.

---

## 1. Matriz de Métricas Visuales y Tokens Cuantitativos

Todo componente nuevo o refactorizado debe cumplir estrictamente estas medidas:

| Categoría | Elemento / Token | Métrica / Valor Exacto | Regla / Restricción |
| :--- | :--- | :--- | :--- |
| **Layout Global** | Contenedor `.contenido` y `.nav-inner` | `max-width: 1380px`<br>`padding: 0 clamp(14px, 2.5vw, 28px)`<br>`margin: 0 auto` | El contenido del `.nav` y `.contenido` deben compartir el mismo eje vertical (`1380px`) en monitores grandes. |
| **Header & Nav** | Barra `.nav` | Escritorio (`> 768px`): `height: 52px`, 1 fila<br>Móvil/Tablet (`<= 768px`): `height: 48px`, 1 fila | Prohibido hacer wrap en 2 filas o mostrar barras de scroll horizontal. |
| **Menú Móvil** | Panel Lateral (`.nav-drawer`) y `.nav-backdrop` | Backdrop: `position: fixed; inset: 0; bg: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px)`<br>Drawer: `position: fixed; top: 0; right: 0; bottom: 0; width: min(280px, 82vw); height: 100dvh` | Bloqueo obligatorio de scroll (`document.body.style.overflow = 'hidden'`), cierre al pulsar fuera (`backdrop`) o `Escape`. |
| **Cinta Bursátil** | `.ticker` | Escritorio: `height: 34px` (`font-size: 0.82rem`)<br>Móvil (`<= 768px`): `height: 28px` (`font-size: 0.76rem`) | Compacta para no restar espacio vertical al área de trabajo. |
| **Superficies** | Contenedores / Tarjetas | `border-radius: 8px`<br>`padding: 18px 20px` (`14px` en móvil) | Prohibido `border-radius > 10px` o `padding > 24px`. |
| **Bordes** | Bordes de contenedor y celdas | `1px solid rgba(0, 0, 0, 0.08)` (claro)<br>`1px solid rgba(255, 255, 255, 0.08)` (oscuro) | Prohibido usar bordes de `1.5px` o `2px` en cajas o inputs. |
| **Sombras** | Elevación de contenedores | `0 1px 2px rgba(0, 0, 0, 0.03)` (`none` en oscuro) | Prohibidas sombras difusas (`> 4px`) y efectos `translateY` en hover. |
| **Controles** | Inputs, Selects y Botones | `height: 36px` (`min-height: 36px`)<br>`padding: 6px 12px`<br>`border-radius: 6px`<br>`font-size: 13px` | Alineación horizontal uniforme en barras de filtros. |
| **Segmented Controls** | Selector de Periodo / Tipo | Contenedor: `padding: 3px`, `border-radius: 6px`, `bg: #F1F3F5`<br>Botón: `min-height: 28px`, `padding: 4px 10px`, `font-size: 12px` | Botón activo con fondo `#FFFFFF` y sombra `0 1px 2px rgba(0,0,0,0.06)`. |
| **Tipografía** | Título de página (`h1`) | `font-size: clamp(1.35rem, 2vw, 1.65rem)`<br>`font-weight: 700`<br>`letter-spacing: -0.02em` | Sin subtítulos explicativos debajo del `h1`. |
| **Tipografía** | Cabeceras de sección (`h2`, `h3`) | `font-size: 0.95rem` a `1.05rem`<br>`font-weight: 700` | Acompañadas solo de datos o contadores `mono-num`. |
| **Tipografía** | Micro-etiquetas y `thead th` | `font-size: 0.70rem` a `0.72rem`<br>`text-transform: uppercase`<br>`letter-spacing: 0.05em`<br>`font-weight: 600–700` | Color `var(--color-text-muted)`. |
| **Datos Numéricos** | Cifras, precios, IC, variaciones | Clase obligatoria `.mono-num`<br>(`font-variant-numeric: tabular-nums`) | Alineación obligatoria a la derecha en tablas y comparaciones. |
| **Barras de Progreso** | Indicadores de IC, dimensión y pesos | `height: 3px` a `4px` (`hairline`)<br>`border-radius: 9999px` | Prohibidas barras gruesas (`>= 6px`). |
| **Tablas Bursátiles** | Filas y celdas (`th`, `td`) | `min-height: 38px–42px`<br>`padding: 10px 14px` (`8px 10px` en móvil) | Separador inferior `1px solid rgba(0,0,0,0.06)` y hover `rgba(0,0,0,0.02)`. |
| **Gráficas** | Lienzo `lightweight-charts` | Escritorio (`>= 640px`): `height: 360px`<br>Móvil (`< 640px`): `height: 260px–280px`<br>`timeScale`: `maxBarSpacing: 26`, `barSpacing: 14` | Evita que pocas velas se estiren como bloques gigantes en monitores grandes; usa `ResizeObserver`. |
| **Tira OHLC** | Barra de datos de sesión | Tira horizontal compacta unificada (`border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 6px`, `padding: 8px 14px`) con divisores verticales de `1px` | Prohibido usar 5 tarjetas grandes separadas para Fecha/Apertura/Máximo/Mínimo/Cierre. |
| **Rejillas (Grids)** | Celdas de Métricas por Dimensión | `grid-template-columns: repeat(auto-fill, minmax(210px, 1fr))`<br>`gap: 10px` | Padding de celda `10px 12px`, máximo 3 datos visibles por celda. |

---

## 2. Armonía Visual en Pantallas Grandes (`>= 1280px`)

1. **Alineación de Ejes Verticales:**
   - El contenido interno de `.nav` debe estar envuelto en un `.nav-inner` con `max-width: 1380px; margin: 0 auto; width: 100%;` para que el logo a la izquierda y el bloque de usuario a la derecha queden exactamente alineados con los bordes de las tarjetas de `.contenido`.
2. **Cabecera de Cotización Unificada en Gráficas (`FinancialChart`):**
   - **Izquierda (Identidad + Precio):** Nombre de la entidad (`h1`), código (`ENT001`), tags de sector y puesto (`#4 / 12`), y justo al lado o debajo inmediato el **Valor del IC (`55,0`) y su Variación (`▼ -0,96 %`)** como bloque protagonista.
   - **Derecha (Selector Limpio):** Únicamente el `<select>` compacto para cambiar de entidad (`Cambiar entidad`), sin repetir el precio a la derecha del selector.
3. **Proporción de Velas (`maxBarSpacing`):**
   - Configurar `timeScale: { borderColor: C.borde, timeVisible: true, rightOffset: 2, barSpacing: 14, maxBarSpacing: 26 }` para que en monitores amplios las velas mantengan una proporción estilizada y nunca se deformen en bloques excesivamente anchos.
4. **Tira OHLC Compacta (Data Ribbon):**
   - Presentar `Fecha`, `Apertura`, `Máximo`, `Mínimo` y `Cierre` en una sola tira horizontal compacta debajo de la gráfica (o junto a los controles), reduciendo el alto de `76px` a `42px` para que la sección de **Métricas por Dimensión** sea visible sin hacer scroll innecesario.

---

## 3. Reglas de Redacción y Densidad de Texto (Zero Instructional Copy)

1. **Cero subtítulos redundantes bajo el `<h1>`.**
2. **Cero instrucciones de uso de la interfaz.**
3. **Máximo 3 elementos de texto por celda en rejillas (`MetricasPorDimension`):**
   - (1) Código `ROE` + `→` arriba, (2) nombre de la métrica en el centro, (3) valor crudo a la izquierda y puntaje `78,5 pts` a la derecha sobre la barra de `3px`.
4. **Cero banners promocionales internos y cero líneas de debug.**

---

## 4. Comportamiento Estándar del Menú Móvil (`<= 768px`)

1. **Panel Lateral Derecho (`Side Drawer`):** Se abre desde el borde derecho (`top: 0; right: 0; bottom: 0; width: min(280px, 82vw); height: 100dvh; z-index: 1000`) con transición suave `transform: translateX(...)`.
2. **Fondo Oscurecido en Segundo Plano (`.nav-backdrop`):** Capa fija (`position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px); z-index: 999`). Al hacer clic o tocar cualquier punto del fondo oscurecido, el menú se cierra.
3. **Bloqueo de Deslizamiento (`Scroll Lock`):** Mientras `menuAbierto === true`, `document.body.style.overflow = 'hidden'` impide que la página de atrás se deslice verticalmente.
