---
name: clean-financial-design
description: >-
  Guía de diseño, métricas visuales exactas y estándares de interfaz financiera institucional (alta densidad,
  cero prosa explicativa, control de acceso por rol y sensibilidad del dato, y adaptabilidad responsiva multi-pantalla).
  Usar obligatoriamente para diseñar, refactorizar o auditar cualquier componente en SIFTC (ALZA).
---

# 🏛️ Guía y Métricas de Diseño Financiero Institucional: Clean Financial Design (ALZA)

Esta skill define las **métricas numéricas exactas**, reglas de redacción, principios de diseño responsivo y **control de acceso por rol y sensibilidad del dato** para que **SIFTC (ALZA)** mantenga siempre una estética de terminal financiera institucional (inspirada en Koyfin, TradingView, Bloomberg Web y Linear), libre de ruido visual y de vicios típicos de plantillas de IA.

---

## 1. Matriz de Métricas Visuales y Tokens Cuantitativos

Todo componente nuevo o refactorizado debe cumplir estrictamente estas medidas:

| Categoría | Elemento / Token | Métrica / Valor Exacto | Regla / Restricción |
| :--- | :--- | :--- | :--- |
| **Layout Global** | Contenedor `.contenido` y `.nav-inner` | `max-width: 1440px`<br>`padding: clamp(12px, 2vw, 24px)`<br>`margin: 0 auto` | El contenido del `.nav` y `.contenido` deben compartir el mismo eje vertical (`1440px`) en monitores grandes. |
| **Header & Nav** | Barra `.nav` y navegación | Escritorio (`> 768px`): 1 sola fila de `52px`, enlaces visibles (`height: 34px`, `font-size: 13px`)<br>Móvil/Tablet (`<= 768px`): 1 sola fila de `48px` con **Menú Hamburguesa** | Prohibido hacer wrap en 2 filas en móvil o mostrar barras de scroll horizontal en `.nav-links`. |
| **Menú Móvil** | Panel Lateral (`.nav-drawer`) y `.nav-backdrop` | Backdrop: `position: fixed; inset: 0; bg: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px); z-index: 999`<br>Drawer: `position: fixed; top: 0; right: 0; bottom: 0; width: min(280px, 82vw); height: 100dvh; z-index: 1000` | Bloqueo obligatorio de scroll (`document.body.style.overflow = 'hidden'`), cierre al pulsar fuera (`backdrop`) o `Escape`. |
| **Cinta Bursátil** | `.ticker` | Escritorio: `height: 34px` (`font-size: 0.82rem`)<br>Móvil (`<= 768px`): `height: 28px` (`font-size: 0.76rem`) | Compacta para no restar espacio vertical al área de trabajo. |
| **Superficies** | Contenedores / Tarjetas | `border-radius: 8px`<br>`padding: 16px 20px` (`14px` en móvil) | Prohibido `border-radius > 10px` o `padding > 24px`. |
| **Bordes** | Bordes de contenedor y celdas | `1px solid rgba(0, 0, 0, 0.08)` (claro)<br>`1px solid rgba(255, 255, 255, 0.08)` (oscuro) | Prohibido usar bordes de `1.5px` o `2px` en cajas o inputs. |
| **Sombras** | Elevación de contenedores | `0 1px 2px rgba(0, 0, 0, 0.03)` (`none` en oscuro) | Prohibidas sombras difusas (`> 4px`) y efectos `translateY` en hover. |
| **Controles** | Inputs, Selects y Botones | `height: 34px–36px`<br>`padding: 6px 12px`<br>`border-radius: 6px`<br>`font-size: 13px` | Alineación horizontal uniforme en barras de filtros y herramientas. |
| **Segmented Controls** | Selector de Periodo / Tipo | Contenedor: `padding: 3px`, `border-radius: 6px`, `bg: #F1F3F5`<br>Botón: `min-height: 28px`, `padding: 4px 10px`, `font-size: 12px` | Botón activo con fondo `#FFFFFF` y sombra `0 1px 2px rgba(0,0,0,0.06)`. |
| **Tipografía** | Título de página (`h1`) | `font-size: clamp(1.30rem, 1.8vw, 1.55rem)`<br>`font-weight: 700`<br>`letter-spacing: -0.02em` | Sin subtítulos explicativos debajo del `h1`. |
| **Tipografía** | Cabeceras de sección (`h2`, `h3`) | `font-size: 0.92rem` a `1.02rem`<br>`font-weight: 700` | Acompañadas solo de datos o contadores `mono-num`. |
| **Tipografía** | Micro-etiquetas y `thead th` | `font-size: 0.70rem` a `0.72rem`<br>`text-transform: uppercase`<br>`letter-spacing: 0.05em`<br>`font-weight: 600–700` | Color `var(--color-text-muted)`. |
| **Datos Numéricos** | `--font-mono` y `.mono-num` | `--font-mono: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`<br>`font-variant-numeric: tabular-nums`<br>`font-feature-settings: "tnum" 1, "zero" 1` | **Prohibido usar `'Courier New'`** (apariencia de máquina de escribir antigua). Los números deben usar la misma familia sans-serif limpia con ancho tabular fijo (`tabular-nums`). |
| **Barras de Progreso** | Indicadores de IC, dimensión y pesos | `height: 3px` a `4px` (`hairline`)<br>`border-radius: 9999px` | Prohibidas barras gruesas (`>= 6px`). |
| **Tablas Bursátiles** | Filas y celdas (`th`, `td`) | `min-height: 38px–42px`<br>`padding: 10px 14px` (`8px 10px` en móvil) | Separador inferior `1px solid rgba(0,0,0,0.06)` y hover `rgba(0,0,0,0.02)`. |
| **Gráficas** | Lienzo `lightweight-charts` y proporción de velas | Escritorio (`>= 640px`): `height: 380px`<br>Móvil (`< 640px`): `height: 270px`<br>`timeScale: { barSpacing: 10, maxBarSpacing: 18, rightOffset: 3 }` | `maxBarSpacing: 18` obligatorio para evitar que las velas mensuales/trimestrales se deformen como bloques gigantes en monitores anchos. |
| **Tira OHLC** | Barra de datos de sesión | Tira horizontal compacta (`min-height: 38px`, `padding: 8px 14px`, `bg: #F8F9FA`) en vez de 5 tarjetas gigantes separadas | Muestra `Fecha`, `Apertura`, `Máximo`, `Mínimo` y `Cierre` en línea con divisores verticales sutiles (`1px`). |
| **Terminal Split** | Layout Gráfica + Ficha en Desktop (`>= 1100px`) | Rejilla de 2 columnas: `grid-template-columns: minmax(0, 1.65fr) minmax(340px, 1fr)` (`gap: 16px`) | A la izquierda la Gráfica + Tira OHLC; a la derecha el panel de **Métricas por Dimensión** visible sin hacer scroll vertical. |

---

## 2. Armonía Visual en Pantallas Grandes (`>= 1100px`)

1. **Tipografía Numérica Moderna (Adiós a `'Courier New'`):**
   - En Windows, cuando no están instaladas `JetBrains Mono` ni `Fira Code`, el navegador caía en `'Courier New'` (fuente serif de máquina de escribir que desentona con `Inter`). Al usar `Inter` con `font-variant-numeric: tabular-nums`, los números mantienen alineación vertical milimétrica y estética institucional moderna.
2. **Cabecera de Cotización Unificada en Gráficas (`FinancialChart`):**
   - **Izquierda (Identidad + Precio):** Nombre de la entidad (`h1`), código (`ENT001`), tags de sector y puesto (`#4 / 12`), y junto a ellos el **Valor del IC (`55,0`) y su Variación (`▼ -0,96 %`)** como bloque protagonista.
   - **Derecha (Selector Limpio):** Únicamente el `<select>` compacto para cambiar de entidad, sin repetir la etiqueta `"ENTIDAD"` arriba ni separar el precio del nombre.
3. **Proporción de Velas (`maxBarSpacing: 18`):**
   - Evita que 20 velas se estiren ocupando todo el monitor como ladrillos gruesos.
4. **Layout Split de Terminal (`Gráfica` a la izquierda + `Métricas por Dimensión` a la derecha en `>= 1100px`):**
   - Aprovecha el ancho de monitores grandes mostrando la gráfica + tira OHLC a la izquierda y el desglose de dimensiones a la derecha en paralelo.

---

## 3. Comportamiento Estándar del Menú Móvil (`<= 768px`)

1. **Panel Lateral Derecho (`Side Drawer`):** Se abre desde el borde derecho (`position: fixed; top: 0; right: 0; bottom: 0; width: min(280px, 82vw); height: 100dvh; z-index: 1000`) con cabecera propia (título/logo + botón `X`), enlaces verticales y pie de usuario + botón `Salir`.
2. **Fondo Oscurecido en Segundo Plano (`.nav-backdrop`):** Capa fija (`position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px); z-index: 999`). Al tocar o hacer clic fuera del panel lateral (sobre el `.nav-backdrop`), el menú se cierra inmediatamente.
3. **Bloqueo de Deslizamiento (`Scroll Lock`):** Mientras `menuAbierto === true`, se aplica `document.body.style.overflow = 'hidden'` en un `useEffect` (y se restaura a `''` al cerrar o desmontar) para impedir que la pantalla trasera se deslice.

---

## 4. Matriz de Permisos por Rol y Sensibilidad del Dato (HU-FE-07 CA 1)

1. **6 Roles Canónicos:** `Administrador`, `Data Steward`, `Analista financiero`, `Gerente / Directivo`, `Auditor`, `Usuario móvil`.
2. **4 Niveles de Sensibilidad:**
   - **Pública:** Catálogo de entidades, Series históricas OHLC.
   - **Interna:** IC y valores de métricas, Ranking sin posición, Watchlist personal ver, Aprobaciones bandeja, Parámetros del sistema, Auditoría.
   - **Confidencial:** Posición en el ranking, Matriz financiera cruda carga, Datos financieros detallados.
   - **Restringida:** Gestión de usuarios, roles y credenciales.
3. **Reglas de UI Obligatorias:**
   - **Decisión D1 (Ranking sin posición para Gerente / Directivo):** El Gerente / Directivo ve el ranking (entidades, sector, IC, variación) pero **sin posición ni cambio de posición**. Ocultar columnas `Pos.` y `Cambio` en la tabla y ocultar la columna `Posición` en el comparador. En `FinancialChart`, el badge `#puesto / total` no se renderiza para Gerente / Directivo ni para Usuario móvil.
   - **Decisión D2 (Watchlist exclusiva):** Exclusivamente el `Usuario móvil` puede agregar o quitar entidades de la watchlist. Los demás roles solo tienen lectura (`L`).
   - **Restricción de Usuario móvil:** El `Usuario móvil` no tiene acceso a `/ranking` ni a `/comparar` (recibe 403 del servidor). Ocultar estos enlaces en navegación y proteger las rutas con redirección amigable.
   - **Manejo de HTTP 403 Forbidden:** Si el backend responde 403, capturarlo limpiamente y mostrar un aviso de restricción institucional (`Tu perfil no tiene permisos para acceder a este recurso`) sin quebrar la interfaz ni generar bucles de petición.
