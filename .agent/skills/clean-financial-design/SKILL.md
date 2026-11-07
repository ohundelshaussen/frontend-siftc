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
5. **Barras de progreso infladas:** Las barras de métricas no deben superar `4px` o `6px` de altura (`hairline progress`). Deben ser discretas, no barras de videojuegos.

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
    4. Barra de calibración ultra fina (`h: 4px`) integrada en la base o borde.

### 📈 Gráfica Financiera
- La gráfica interactiva de TradingView debe ser la protagonista:
  - Contenedor con borde simple de 1px, sin bordes redondeados gigantescos (`border-radius: 8px` o `12px` máximo).
  - Selectores de periodo (Diaria / Mensual / Trimestral) como botones segmentados compactos (`segmented controls`), no botones flotantes con sombras.

### 📋 Tablas de Ranking y Comparador
- Tablas estilo terminal bursátil:
  - Filas compactas con altura uniforme (`min-height: 44px`).
  - Línea separadora horizontal de 1px.
  - Efecto hover sobrio (`background: rgba(0, 0, 0, 0.02)`).
  - Paginador discreto y alineado.
