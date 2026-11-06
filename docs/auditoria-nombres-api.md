# Auditoría de Nombres y Modelos: Frontend vs. OpenAPI (docs/api/openapi-v1.json)

**Fecha:** 6 de noviembre de 2026  
**Ámbito:** Frontend SIFTC (`frontend-siftc`)  
**Fuente de verdad única del Backend:** `docs/api/openapi-v1.json`

---

## 1. Objetivo

Identificar las discrepancias de nomenclatura, campos inventados, renombrados artificiales en adaptadores y dispersión de constantes de dominio entre la implementación actual del frontend y el contrato oficial del backend expuesto en `docs/api/openapi-v1.json`.

---

## 2. Inventario de Campos: OpenAPI vs. Frontend

### 2.1 Entidades (`EntidadDto` y `EntidadDetalleDto`)

| Campo en el OpenAPI | Tipo OpenAPI | Nombre usado hoy en Frontend | Archivo:Línea | Observación |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | `id` | `adaptadores.js:10` | Coincide. Usado como identificador de ruta en `/entidades/{id}/ohlc`. |
| `codigo` | `string` | `codigo_entidad` | `adaptadores.js:11`<br>`Tablero.jsx:53,62`<br>`Ticker.jsx:25,26`<br>`FinancialChart.jsx:68,223,262`<br>`SelectorEntidades.jsx:17,47,57`<br>`Comparador.jsx:57,67` | **Renombrado innecesario.** OpenAPI define `codigo`. El adaptador lo traduce a `codigo_entidad` en snake_case. |
| `nombre` | `string` | `nombre_entidad` | `adaptadores.js:12`<br>`TopLista.jsx:15`<br>`Tablero.jsx:56,65`<br>`FinancialChart.jsx:222,270`<br>`SelectorEntidades.jsx:17,61`<br>`Comparador.jsx:53,69` | **Renombrado innecesario.** OpenAPI define `nombre`. El adaptador lo traduce a `nombre_entidad`. |
| `sector` | `string` | `sector` | `adaptadores.js:13`<br>`FinancialChart.jsx:224`<br>`RankingTabla.jsx:78`<br>`TopLista.jsx:16`<br>`SelectorEntidades.jsx:17,62`<br>`Comparador.jsx:69` | Coincide. |
| `ic` | `double` | `indice_competitividad` | `adaptadores.js:14`<br>`Tablero.jsx:130,131`<br>`TopLista.jsx:18`<br>`Ticker.jsx:27`<br>`FinancialChart.jsx:280`<br>`SelectorEntidades.jsx:65`<br>`Comparador.jsx:107` | **Renombrado innecesario.** OpenAPI define `ic`. El frontend lo expande artificialmente a `indice_competitividad`. En ranking se usa `ic` directamente. |
| `variacion` | `double` | `variacion` | `adaptadores.js:15`<br>`Tablero.jsx:132` | Coincide en nombre, aunque en componentes se ignora en favor de la variación porcentual. |
| `variacionPct` | `double` | `variacion_porcentual` | `adaptadores.js:16`<br>`Tablero.jsx:23,24,57,66`<br>`TopLista.jsx:19`<br>`Ticker.jsx:22,23,29`<br>`FinancialChart.jsx:228`<br>`Comparador.jsx:108` | **Renombrado innecesario.** OpenAPI define `variacionPct` (camelCase). El adaptador lo traduce a `variacion_porcentual`. En ranking se usa `variacionPct`. |
| *(No existe en OpenAPI)* | — | `direccion` (`'UP'\|'DOWN'\|'EQUAL'`) | `adaptadores.js:17` | **Campo sintético.** Calculado en cliente a partir del signo de `variacionPct`. |
| *(Campos de `EntidadDetalleDto`)*: `nit`, `estado`, `icActual`, `ultimaActualizacion` | `string`, `double`, `date-time` | No se consumen directamente en componentes | `api.js:143` (`getEntidad`) | El endpoint existe en `api.js` pero la vista de detalle dedicada aún no consume estos campos. |

---

### 2.2 Serie OHLC (`OhlcResponseDto` y `OhlcPuntoDto`)

| Campo en el OpenAPI | Tipo OpenAPI | Nombre usado hoy en Frontend | Archivo:Línea | Observación |
| :--- | :--- | :--- | :--- | :--- |
| `entidadId` | `uuid` | `entidadId` | `adaptadores.js:91` | Coincide. |
| `entidad` | `string` | `entidad` | `adaptadores.js:91` | Coincide. |
| `periodo` | `string` | `periodo` | `adaptadores.js:91` | Coincide. |
| `serie` | `array` | `serie` | `adaptadores.js:121,127` | Coincide. |
| `fecha` | `date-time` | `time` | `adaptadores.js:135`<br>`FinancialChart.jsx:187,198,377`<br>`comparador.js:103,108` | **Renombrado por biblioteca externa.** `lightweight-charts` exige la propiedad `time`. `adaptadores.js` normaliza `fecha` (o alias históricos) a `time` en formato `YYYY-MM-DD`. |
| `apertura` | `double` | `open` | `adaptadores.js:136`<br>`FinancialChart.jsx:234,381` | Renombrado a inglés (`open`) para la biblioteca de velas. |
| `maximo` | `double` | `high` | `adaptadores.js:137`<br>`FinancialChart.jsx:385` | Renombrado a inglés (`high`) para la biblioteca de velas. |
| `minimo` | `double` | `low` | `adaptadores.js:138`<br>`FinancialChart.jsx:389` | Renombrado a inglés (`low`) para la biblioteca de velas. |
| `cierre` | `double` | `close` | `adaptadores.js:139`<br>`FinancialChart.jsx:187,235,394`<br>`comparador.js:102` | Renombrado a inglés (`close`) para la biblioteca de velas y cálculo de línea comparativa. |
| `variacion` | `double` | No mapeado en `aSerieOhlc` | `adaptadores.js:134-140` | Se descarta en la normalización de la serie; no se expone a los componentes de gráficas. |
| `variacionPct` | `double` | Calculado al vuelo en UI | `FinancialChart.jsx:234-236` | Se recalcula manualmente entre `close` y `open` en vez de leer el campo oficial entregado por el backend. |

---

### 2.3 Métricas (`MetricaDto`)

| Campo en el OpenAPI | Tipo OpenAPI | Nombre usado hoy en Frontend | Archivo:Línea | Observación |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | No consumido individualmente | `api.js:186` | Coincide en la respuesta cruda de `getMetricas`. |
| `entidadId` | `uuid` | No consumido | `api.js:186` | — |
| `codigoEntidad` | `string` | No consumido | `api.js:186` | — |
| `nombreEntidad` | `string` | No consumido | `api.js:186` | — |
| `sector` | `string` | Usado en filtros | `api.js:186` | — |
| `fecha` | `date-time` | Usado en filtros | `api.js:186` | — |
| `dimension` | `string` | `dimension` | `api.js:203` | Coincide. Usado para derivar el catálogo de dimensiones con `m.dimension`. |
| `nombre` | `string` | No consumido | `api.js:186` | — |
| `valor` | `double` | No consumido | `api.js:186` | — |
| `unidad` | `string` | No consumido | `api.js:186` | — |
| `peso` | `double` | Documentado en constantes | `comparador.js:29-32` | Pesos de dimensiones hardcodeados en comentarios de `COLUMNAS_METRICAS` (35%, 20%, 20%, 25%). |
| `contribucionIc` | `double` | No consumido | `api.js:186` | — |

---

### 2.4 Ranking (`RankingResponseDto` y `RankingItemDto`)

| Campo en el OpenAPI | Tipo OpenAPI | Nombre usado hoy en Frontend | Archivo:Línea | Observación |
| :--- | :--- | :--- | :--- | :--- |
| `periodo` | `string` | `periodo` | `api.js:218`<br>`Ranking.jsx:20`<br>`Comparador.jsx:75` | Coincide. En el OpenAPI admite `diario`, `mensual`, `trimestral`. |
| `total` | `int32` | `total` | `RankingTabla.jsx:27,94` | Coincide. |
| `items` | `array` | `items` | `Ranking.jsx:72`<br>`Comparador.jsx:23` | Coincide. |
| `posicion` | `int32` | `posicion` | `RankingTabla.jsx:6,71`<br>`Comparador.jsx:109`<br>`TablaComparativa.jsx:23` | Coincide exactamente. |
| `cambioPosicion` | `int32` | `cambioPosicion` | `RankingTabla.jsx:72` | Coincide exactamente. |
| `entidadId` | `uuid` | `entidadId` | `RankingTabla.jsx:70,74`<br>`Comparador.jsx:24,88` | Coincide exactamente. |
| `entidad` | `string` | `entidad` | `RankingTabla.jsx:8,75` | Coincide exactamente (nombre de la entidad). |
| `sector` | `string` | `sector` | `RankingTabla.jsx:9,78` | Coincide exactamente. |
| `ic` | `double` | `ic` | `RankingTabla.jsx:10,81`<br>`Comparador.jsx:107`<br>`TablaComparativa.jsx:43` | Coincide exactamente. |
| `variacionPct` | `double` | `variacionPct` | `RankingTabla.jsx:11,87`<br>`Comparador.jsx:108`<br>`TablaComparativa.jsx:43` | Coincide exactamente. |

> **Nota:** La pantalla de Ranking y el módulo de Comparador respetan de manera limpia los nombres de `RankingItemDto` sin pasar por `adaptadores.js`.

---

### 2.5 Autenticación y Usuarios

| Endpoint / Dto en OpenAPI | Campo OpenAPI | Nombre usado hoy en Frontend | Archivo:Línea | Observación |
| :--- | :--- | :--- | :--- | :--- |
| `POST /auth/login`<br>(`AutenticarUsuarioCommand`) | `usuario` | `usuario` | `api.js:111` | Coincide. Enviado en cuerpo JSON. |
| `AutenticarUsuarioCommand` | `password` | `password` | `api.js:111` | Coincide. |
| `AuthResponseDto` | `token` | `token` | `adaptadores.js:64,78`<br>`AuthContext.jsx:53,99` | Coincide. |
| `AuthResponseDto` | `expiraEn` | `expiraEn` | `adaptadores.js:69,84` | Coincide. |
| `UsuarioSesionDto` (hijo de `AuthResponseDto`) | `id` (`uuid`) | `idUsuario` / `id` | `adaptadores.js:71,86` | **Campo inventado.** El OpenAPI define `id`. El frontend inventó `idUsuario` como alias redundante. |
| `UsuarioSesionDto` | `nombre` (`string`) | `nombreCompleto` / `nombre` | `adaptadores.js:73,74,88,89`<br>`AuthContext.jsx:28,33` | **Campo inventado.** El OpenAPI define `nombre`. El frontend inventó `nombreCompleto`. |
| `UsuarioSesionDto` | `rol` (`string`) | `rol` | `adaptadores.js:75,90`<br>`AuthContext.jsx:81,92`<br>`roles.js:14`<br>`ProtectedRoute.jsx:18` | Coincide en la lectura del claim/propiedad. |
| *(No existe en `UsuarioSesionDto`)* | — | `email` | `adaptadores.js:72,87`<br>`AuthContext.jsx:106` | **Campo inventado en sesión.** El backend devuelve únicamente `{ id, nombre, rol }` en el login. El frontend inyecta `email` artificialmente en `sesion.usuario` deduciéndolo del identificador ingresado. |
| `POST /usuarios/registrar`<br>(`RegistrarUsuarioCommand`) | `email` | `email` | `authService.js:54` | Coincide con `RegistrarUsuarioCommand`. |
| `RegistrarUsuarioCommand` | `password` | `password` | `authService.js:55` | Coincide. |
| `RegistrarUsuarioCommand` | `primerNombre` | `primerNombre` | `authService.js:56` | Coincide. |
| `RegistrarUsuarioCommand` | `primerApellido` | `primerApellido` | `authService.js:57` | Coincide. |
| `RegistrarUsuarioCommand` | `idRol` (`uuid`) | `idRol` | `authService.js:58` | Coincide. |

---

## 3. Señalamiento de Inconsistencias Críticas

### 3.1 Nombres inventados en Frontend ausentes en el OpenAPI
1. **`idUsuario`:** Inventado en `src/services/adaptadores.js:71,86`. El modelo oficial `UsuarioSesionDto` en OpenAPI define `id`.
2. **`nombreCompleto`:** Inventado en `src/services/adaptadores.js:73,88`. El modelo oficial `UsuarioSesionDto` define `nombre`.
3. **`email` en sesión:** Inyectado artificialmente en `src/services/adaptadores.js:72,87` y `src/context/AuthContext.jsx:106`. El backend en `POST /api/v1/auth/login` no devuelve el correo del usuario en `AuthResponseDto`.
4. **`direccion`:** Generado en `src/services/adaptadores.js:17` (`UP`, `DOWN`, `EQUAL`). No existe en ningún DTO del OpenAPI.

### 3.2 Renombrados innecesarios en `adaptadores.js`
La función `aEntidad` transforma innecesariamente el DTO oficial `EntidadDto` a una nomenclatura mixta snake_case heredada de convenciones previas:
- `codigo` → `codigo_entidad`
- `nombre` → `nombre_entidad`
- `ic` → `indice_competitividad`
- `variacionPct` → `variacion_porcentual`

Esto genera una fractura en la base de código:
- En `Tablero.jsx`, `TopLista.jsx`, `Ticker.jsx`, `FinancialChart.jsx` y `SelectorEntidades.jsx` se usan los nombres adaptados (`codigo_entidad`, `indice_competitividad`, etc.).
- En `RankingTabla.jsx` y `Comparador.jsx` se usan los nombres oficiales del OpenAPI (`codigo`, `ic`, `variacionPct`).

### 3.3 Diferencias de mayúsculas, formato y plurales
1. **Discrepancia en el parámetro `periodo` entre endpoints:**
   - `GET /api/v1/entidades/{id}/ohlc` exige Capital Case: `'Diaria'`, `'Mensual'`, `'Trimestral'` (`docs/api/openapi-v1.json:200`).
   - `GET /api/v1/ranking` exige minúsculas: `'diario'`, `'mensual'`, `'trimestral'` (`docs/api/openapi-v1.json:547`).
   - `GET /api/v1/metricas` exige minúsculas: `'diario'`, `'mensual'`, `'trimestral'` (`docs/api/openapi-v1.json:370`).
   - Actualmente `api.js:103-108` tiene que aplicar una función de normalización manual (`normalizarPeriodoMinusculas`) para que el ranking no falle con 400.
2. **Diferencias en nombres de dimensiones:**
   - En `GET /api/v1/ranking`: admite solo 4 dimensiones (`Rentabilidad`, `Liquidez`, `Solvencia`, `Crecimiento`).
   - En `GET /api/v1/metricas`: admite 6 dimensiones (`Rentabilidad`, `Liquidez`, `Solvencia`, `Crecimiento`, `Mercado`, `Trazabilidad`).

### 3.4 Duplicación y dispersión de constantes de dominio
- **Periodos:** Declarados en `src/constants/periodos.js:6-10` (`PERIODOS`), pero `src/constants/comparador.js:10` redeclara `PARAM_PERIODO` y lógica de normalización propia en `src/utils/comparador.js:43-48`.
- **Dimensiones:**
  - Declaradas en `src/constants/periodos.js:16-21` (`DIMENSIONES_RANKING`).
  - Reduplicadas con metadata propia en `src/constants/comparador.js:25-35` (`COLUMNAS_METRICAS` y `DIMENSIONES_COMPARADOR`).
  - Consultadas dinámicamente con fallback en `src/services/api.js:202-207` (`getDimensiones`).

---

### 3.5 Comparativa de Roles: Frontend vs. OpenAPI

En `src/constants/roles.js:1-8` el frontend define actualmente:
```javascript
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  ANALISTA: 'Analista financiero',
  GERENTE: 'Gerente',
  DATA_STEWARD: 'Data Steward',
  AUDITOR: 'Auditor',
  USUARIO_MOVIL: 'Usuario móvil',
};
```

**Contraste con el OpenAPI (`docs/api/openapi-v1.json`):**
- El OpenAPI únicamente menciona **dos roles oficiales** en sus descripciones de seguridad:
  1. **`Administrador`** (mencionado en `POST /auth/login`, `POST /usuarios/registrar`, `POST /parametros/actualizar-umbral`, `POST /cargas`).
  2. **`Analista financiero`** (mencionado en `POST /auth/login`: *"Solo usuarios activos con roles Administrador o Analista financiero pueden acceder a la plataforma web"*).
- Los roles **`Gerente`**, **`Data Steward`**, **`Auditor`** y **`Usuario móvil`** **NO existen en el contrato OpenAPI**. Fueron inventados y no tienen permisos ni endpoints asociados en el backend.

---

## 4. Propuesta de Regla Arquitectural de Unificación

Para asegurar que el frontend sea un cliente fiel y robusto del backend en Render, se establecen dos reglas obligatorias:

1. **Regla de Modelos Internos (OpenAPI como Única Fuente de Verdad):**
   - Todos los modelos de datos en memoria, componentes y estados de React deben utilizar **exactamente** los mismos nombres y tipos de campo definidos en los DTOs de `docs/api/openapi-v1.json` (`codigo`, `nombre`, `sector`, `ic`, `variacion`, `variacionPct`, `id`, `rol`, etc.).
   - Se debe eliminar la capa de traducción artificial de `adaptadores.js` que convierte a snake_case (`codigo_entidad`, `indice_competitividad`, etc.), unificando el Tablero, Ticker y Gráfica para que consuman `EntidadDto` directamente como ya lo hacen el Ranking y el Comparador.
   - Las bibliotecas visuales de terceros (ej: `lightweight-charts`) que requieran propiedades específicas (`time`, `open`, `high`, `low`, `close`) deben recibir esa transformación exclusivamente en el componente gráfico correspondiente, sin contaminar los modelos de dominio.

2. **Regla de Constantes de Dominio Centralizadas:**
   - Los valores permitidos para parámetros de API (`periodos`, `dimensiones`, `roles`, `ordenamiento`) deben residir en un único archivo canónico (`src/constants/apiContrato.js` o mantener `src/constants/periodos.js` y `src/constants/roles.js` estrictamente purgados).
   - Eliminar de `src/constants/roles.js` cualquier rol que no sea `Administrador` o `Analista financiero`.
   - Ningún componente o hook debe redeclarar o escribir a mano cadenas de dimensiones o periodos en archivos dispersos.
