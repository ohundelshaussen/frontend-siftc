# ALZA · Portal Web Frontend (SIFTC)

> **Sistema de Información Financiera de Trazabilidad y Competitividad (SIFTC)**  
> **Identidad Comercial:** **ALZA** (*Datos trazables. Entidades que cotizan* · *Compara, decide, avanza*)  
> **Equipo Frontend:** Oscar Andrés Hundelshaussen Barreto · Rafael José Barriga Mejía · Sara Belén Alarcano Rincones · Reinel Alfaro Rosado

---

## 1. Arquitectura y Tecnologías

- **Framework & Build:** React `19.2` + Vite `8` (con *code-splitting* por ruta y separación de chunks en [`vite.config.js`](./vite.config.js): `vendor-react`, `vendor-charts`, `vendor-signalr`) + React Router `7`.
- **Gráficos Financieros:** TradingView Lightweight Charts (`lightweight-charts` `5`).
- **Cliente HTTP:** Axios `1.20` ([`src/services/api.js`](./src/services/api.js)) con inyección JWT automática, manejo de errores RFC 9457 (*Problem Details*), caché corta en memoria aislada por sesión (`15 s`), cola de concurrencia (`MAX_SIMULTANEAS = 3`), reintentos de arranque en frío y *circuit breaker* de `60 s` en `/api/v1/ranking`.
- **Tiempo Real:** SignalR (`@microsoft/signalr` `11`) conectado a `/hubs/cotizaciones` para actualizar la cinta bursátil (`Ticker`) bajo un `<Layout />` persistente entre rutas.
- **Iconografía y Diseño:** Lucide React (`lucide-react`) + CSS modular con tema claro/oscuro ([`src/styles/variables.css`](./src/styles/variables.css), [`src/styles/tema.css`](./src/styles/tema.css)) y estándar institucional `Clean Financial Design` (`360px` a `1440px+`).
- **Backend Oficial en Producción (Render):**
  - URL base por defecto: `https://siftc.onrender.com`
  - Prefijo de API: `/api/v1`
  - Contrato único de verdad: [`docs/api/openapi-v1.json`](./docs/api/openapi-v1.json)
- **Modo Estricto (100 % API Real):** Cero mocks, cero datos fabricados o recalculados en cliente desde otros endpoints, y cero filtración del CSV local de diccionario en el bundle de producción.

---

## 2. Módulos, Rutas y Control de Acceso (RBAC)

La autorización sigue los 6 roles canónicos (`Administrador`, `Data Steward`, `Analista financiero`, `Gerente / Directivo`, `Auditor`, `Usuario móvil`) definidos en [`docs/seguridad/matriz-permisos-roles.md`](./docs/seguridad/matriz-permisos-roles.md) y [`src/constants/permisos.js`](./src/constants/permisos.js):

| Ruta | Módulo | Acceso por Rol | Endpoints Principales |
| :--- | :--- | :--- | :--- |
| `/login` | Autenticación JWT y control de intentos | Público | `POST /api/v1/auth/login` |
| `/dashboard` | Tablero de mercado (IC general, Top 5 Alzas/Bajas) | Todos los autenticados | `GET /api/v1/entidades` |
| `/grafica` | Gráficas OHLC (`Diaria`, `Mensual`, `Trimestral`) y 9 métricas por dimensión | Todos los autenticados *(badge `#puesto / total` oculto para `Gerente / Directivo` y `Usuario móvil`)* | `GET /api/v1/entidades/{id}/ohlc`, `GET /api/v1/metricas`, `GET /api/v1/ranking` |
| `/ranking` | Ranking de competitividad por sector, dimensión y periodo | Todos excepto `Usuario móvil` (`HTTP 403`) · *Decisión D1: `Gerente / Directivo` sin columnas `Pos.` ni `Cambio`* | `GET /api/v1/ranking`, `GET /api/v1/entidades` |
| `/comparar` | Comparador de 2 a 4 entidades (tabla y gráfica de líneas) | Todos excepto `Usuario móvil` (`HTTP 403`) · *`Gerente / Directivo` sin columna `Posición`* | `GET /api/v1/entidades`, `GET /api/v1/ranking`, `GET /api/v1/entidades/{id}/ohlc` |
| `/aprobaciones` | Bandeja de aprobación por lotes | Lectura: `Administrador`, `Data Steward`, `Analista financiero`, `Auditor` · Decisión: solo `Analista financiero` | `GET /api/v1/aprobaciones`, `POST /api/v1/aprobaciones/{idLote}/aprobar`, `POST /api/v1/aprobaciones/{idLote}/rechazar` |
| `/diccionario` | Diccionario de datos y glosario oficial (carga inicial automática, búsqueda, ficha y carga CSV) | Consulta: todos los autenticados (sensibilidad filtrada por servidor) · Carga CSV: solo `Administrador` y `Data Steward` | `GET /api/v1/diccionario`, `GET /api/v1/diccionario/{codigo}`, `POST /api/v1/diccionario/cargar` |
| `/administracion` | CRUD de usuarios y configuración de pesos del IC | Exclusivo `Administrador` | `GET/POST/PUT/DELETE /api/v1/usuarios*`, `GET /api/v1/ic/configuracion`, `POST /api/v1/ic/configuracion/versiones` |

*Nota sobre Watchlist (`Decisión D2`):* Los endpoints `/api/v1/watchlist*` están configurados en [`src/services/endpoints.js`](./src/services/endpoints.js) y restringidos en escritura exclusivamente a `Usuario móvil`.

---

## 3. Requisitos Previos e Instalación

- **Node.js** `20+` y **npm**

```powershell
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev
```

### Variables de Entorno (opcional)

El repositorio **no almacena archivo `.env`** (está excluido en `.gitignore`). Por defecto, el cliente apunta automáticamente a `https://siftc.onrender.com/api/v1` con timeout de `60000 ms`. Si necesitas sobrescribir la URL o prefijo en desarrollo local, crea `.env.local` a partir de [`.env.example`](./.env.example):

```powershell
Copy-Item .env.example .env.local -Force
```

---

## 4. Scripts del Proyecto

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Levanta el servidor local de desarrollo con HMR en `http://localhost:5173`. |
| `npm run build` | Compila y empaqueta la aplicación optimizada de producción en `dist/`. |
| `npm run lint` | Ejecuta el análisis estático con ESLint (incluyendo reglas de React 19 Hooks). |
| `npm run preview` | Sirve localmente el bundle generado en `dist/`. |
| `npm run diagnostico:api` | Despierta Render, descarga el OpenAPI activo y lo contrasta con `endpoints.js`. |
| `npm run explorar:api` | Inspecciona el contrato real de la API (y permite probar login pasando `-- usuario clave`). |
| `npm run probar:filtros` | Valida filtros de `/metricas` y `/ranking` contra el backend (`-- usuario clave`). |
| `npm run ver:parametros` | Lista parámetros y enums aceptados por cada endpoint desde el OpenAPI. |
| `npm run ver:ohlc` | Muestra la respuesta cruda de `/entidades/{id}/ohlc` (`-- usuario clave [periodo]`). |

---

## 5. Estructura del Código (`src/`)

- `assets/`: Logotipos oficiales ALZA (claro/oscuro) e imagen del login.
- `components/`: Componentes organizados por módulo (`Admin/`, `charts/`, `common/`, `comparador/`, `diccionario/`, `ficha/`, `layout/`, `ranking/`, `tablero/`, `ticker/`).
- `constants/`: Catálogos de periodos, dimensiones, unidades, validaciones, roles y matriz de permisos RBAC.
- `context/`: `AuthContext.jsx` (sesión JWT y validación UTF-8) y `ThemeContext.jsx` (tema claro/oscuro).
- `hooks/`: `useComparacion.js` y `useCotizacionesSignalR.js`.
- `pages/`: Vistas de nivel superior (`Login.jsx`, `Dashboard.jsx`, `BandejaAprobaciones.jsx`, `Diccionario.jsx`, `Administracion.jsx`).
- `routes/`: `AppRouter.jsx` (con `<Layout />` persistente y rutas lazy) y `ProtectedRoute.jsx`.
- `services/`: `api.js`, `endpoints.js`, `adaptadores.js`, `authService.js`, `adminService.js`, `diccionarioService.js`, `cotizacionesSignalR.js`.
- `styles/` y `utils/`: Tokens de marca, formateo numérico/fechas y helpers puros.

---

## 6. Documentación del Repositorio

### En la Raíz y Reglas del Agente
- [`README.md`](./README.md): Visión general, módulos, RBAC, instalación y scripts.
- [`AGENTS.md`](./AGENTS.md): Reglas obligatorias de código, contrato backend, RBAC y diseño visual.
- [`.agent/skills/clean-financial-design/SKILL.md`](./.agent/skills/clean-financial-design/SKILL.md): Métricas cuantitativas y estándares visuales institucionales.
- [`DESPLIEGUE.md`](./DESPLIEGUE.md): Guía de compilación, publicación estática (Netlify/Vercel) y requisitos de CORS.
- [`LIBRERIAS.md`](./LIBRERIAS.md): Catálogo y justificación técnica de dependencias instaladas.
- [`MANUAL_MARCA_ALZA.md`](./MANUAL_MARCA_ALZA.md): Identidad visual, paleta oficial y accesibilidad financiera.

### Documentación Técnica (`docs/`)
- [`docs/api/openapi-v1.json`](./docs/api/openapi-v1.json): Especificación OpenAPI oficial del backend.
- [`docs/historias-usuario-frontend.md`](./docs/historias-usuario-frontend.md): Especificación consolidada de historias HU-FE-01 a HU-FE-09.
- [`docs/seguridad/matriz-permisos-roles.md`](./docs/seguridad/matriz-permisos-roles.md): Matriz oficial de permisos por rol y sensibilidad del dato.
- [`docs/LOGIN_CONTEXT.md`](./docs/LOGIN_CONTEXT.md): Contexto y controles de seguridad de autenticación (ISO/IEC 27001 y OWASP ASVS).
- [`docs/auditoria-nombres-api.md`](./docs/auditoria-nombres-api.md): Auditoría de nombres de DTOs frente al OpenAPI.
- [`docs/LIMPIEZA_BACKEND_OBSOLETO_Y_ALCANCE_FRONTEND.md`](./docs/LIMPIEZA_BACKEND_OBSOLETO_Y_ALCANCE_FRONTEND.md): Saneamiento de artefactos obsoletos y alcance exclusivo frontend.
- [`docs/PR_LIMPIEZA_MOCK.md`](./docs/PR_LIMPIEZA_MOCK.md): Registro de eliminación del modo simulado (mocks).
