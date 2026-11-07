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
| **Layout Global** | Contenedor `.contenido` | `max-width: 1380px`<br>`padding: clamp(12px, 2.5vw, 28px)` | Fluido desde `360px` hasta monitores `1440px+`. |
| **Header & Nav** | Barra `.nav` y navegación | Escritorio (`> 768px`): 1 sola fila de `52px`, enlaces visibles (`height: 34px`, `font-size: 13px`)<br>Móvil/Tablet (`<= 768px`): 1 sola fila de `48px` con **Menú Hamburguesa** (`Menu`/`X`) | Prohibido hacer wrap en 2 filas en móvil o mostrar barras de scroll horizontal en `.nav-links`. |
| **Header Controles** | `.boton-tema`, `.nav-salir`, `.nav-avatar` | `height: 32px–34px`<br>`border-radius: 6px` (`50%` avatar `30px`)<br>`font-size: 12.5px` | En móvil (`<= 768px`), la info de usuario y el botón `Salir` pasan dentro del panel desplegable del menú hamburguesa. |
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
| **Gráficas** | Lienzo `lightweight-charts` | Escritorio (`>= 640px`): `height: 360px–380px`<br>Móvil (`< 640px`): `height: 260px–280px` | Uso obligatorio de `ResizeObserver` para redimensionado fluido. |
| **Rejillas (Grids)** | Tira OHLC / Celdas resumen | `grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))`<br>`gap: 10px` | Se adapta sola de 5 columnas (desktop) a 2 columnas (móvil). |
| **Rejillas (Grids)** | Celdas de Métricas por Dimensión | `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`<br>`gap: 10px` | Padding de celda `10px 12px`, máximo 3 datos visibles por celda. |

---

## 2. Reglas de Redacción y Densidad de Texto (Zero Instructional Copy)

En una plataforma financiera profesional, la interfaz se explica por su estructura visual, nunca mediante párrafos de ayuda:

1. **Cero subtítulos redundantes bajo el `<h1>`:**
   - ❌ Prohibido: *"Resumen del Índice de Competitividad de las entidades"*, *"Gestiona usuarios, roles y parámetros del sistema"*, *"Elige de 2 a 4 entidades para ver sus métricas..."*.
   - ✅ Permitido: Únicamente el `<h1>` limpio (y, si aporta valor real, un contador o fecha de corte en `.mono-num`).
2. **Cero instrucciones de uso de la interfaz:**
   - ❌ Prohibido: *"Haz clic en el título de una columna para ordenar"*, *"Pasa el cursor sobre la gráfica para ver el detalle"*, *"Haz clic de nuevo sobre una elegida para quitarla"*, *"Los filtros quedan guardados en la dirección..."*, *"Clic en una entidad para ver su gráfica"*.
3. **Máximo 3 elementos de texto por celda en rejillas (`MetricasPorDimension`):**
   - Cada celda de métrica solo puede mostrar:
     1. **Fila superior:** Código en `.mono-num` (`ROE`) + indicador sutil `→`. (Sin repetir la palabra `"Mensual"` en cada tarjeta).
     2. **Centro:** Nombre de la métrica truncado a máximo 1–2 líneas.
     3. **Fila inferior:** Valor crudo (`18,40`) a la izquierda y puntaje (`78,5 pts`) a la derecha sobre la barra de `3px`. (Sin repetir las etiquetas `"Valor crudo"` ni `"Puntaje"` en cada tarjeta, y sin duplicar el decimal `(0,79)` que pertenece solo al modal de detalle).
4. **Cero banners promocionales internos y cero líneas de debug:**
   - ❌ Prohibido mostrar banners tipo *"Compara, decide, avanza"* dentro del Tablero o rutas técnicas como *"Conectado al backend: https://..."* en las vistas de usuario.

---

## 3. Reglas de Adaptabilidad Responsiva Multi-Pantalla (Breakpoints Oficiales)

Todo componente debe probarse y responder limpiamente en los siguientes 4 puntos de corte:

1. **`>= 1280px` (Desktop / Monitores amplios):**
   - Contenedor hasta `1380px`.
   - Tablero en 2 columnas asimétricas (`1.8fr 1fr`).
   - Rejilla de métricas de 4 a 5 columnas por fila.
2. **`769px – 1024px` (Tablet horizontal / Laptop compacta):**
   - Barra `.nav` de una sola fila compacta (`52px`).
   - Paneles de dos columnas (`.fila-principal`, `.cmp-panel`) pasan a `1fr` debajo de `900px`.
3. **`<= 768px` (Tablet vertical y Móvil — Menú Hamburguesa Activo):**
   - La barra `.nav` se mantiene en **1 sola fila de `48px`**: Logo (`height: 28px`) a la izquierda, y `BotonTema` (`32px`) + botón **Hamburguesa (`32px`)** a la derecha.
   - Los enlaces de navegación y el bloque de usuario (`Avatar + Nombre + Rol + Salir`) se muestran dentro de un panel desplegable limpio (`drawer`/`dropdown`) al abrir el menú, cerrándose automáticamente al cambiar de ruta o presionar `Escape`.
4. **`360px – 479px` (Móvil vertical estándar):**
   - Padding de contenedor reducido a `12px`.
   - Selectores de entidad y filtros al `100%` de ancho.
   - Tablas con `overflow-x: auto` sin desbordar jamás el `body`.

---

## 4. Uso Funcional del Color (Semáforo Bursátil)
- **Verde (`--color-bullish` / `--color-verde-alza`):** Exclusivamente para variaciones positivas (`▲`) o validación exitosa.
- **Rojo (`--color-bearish`):** Exclusivamente para variaciones negativas (`▼`) o errores.
- **Neutralidad:** Superficies, etiquetas de sector y roles usan grises neutros (`#F1F3F5` en claro, `rgba(255,255,255,0.06)` en oscuro) con texto `var(--color-text-muted)`.
