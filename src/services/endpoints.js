// Mapa único de rutas de la API SIFTC (https://siftc.onrender.com).
// Si Backend cambia una ruta, se corrige SOLO aquí: ningún componente escribe rutas a mano.
//
// Confirmadas contra el OpenAPI del servidor desplegado (docs/api/openapi-v1.json).

export const ENDPOINTS = {
  // --- Health ---
  // OJO: health cuelga de la RAIZ del servidor, NO del prefijo /api/v1.
  // Por eso en api.js se pide con URL absoluta y no con el baseURL de axios.
  health: '/health',

  // --- Auth (grupo "Auth") ---
  login: '/auth/login',

  // --- Usuarios (grupo "Usuarios") ---
  registrarUsuario: '/usuarios/registrar',
  roles: null,

  // --- Entidades (grupo "Entidades") ---
  entidades: '/entidades',
  entidad: (id) => `/entidades/${id}`,
  ohlc: (id) => `/entidades/${id}/ohlc`,

  // --- Métricas ---
  metricas: '/metricas',

  // --- Ranking (grupo "Ranking") ---
  ranking: '/ranking',

  // --- Parámetros e IC (grupo "Parametros" y "ConfiguracionIC") ---
  sectores: null,
  dimensiones: null,
  periodos: null,
  actualizarUmbral: '/parametros/actualizar-umbral',
  icConfiguracion: '/ic/configuracion',
  icVersiones: '/ic/configuracion/versiones',

  // --- Cargas (subida de la matriz financiera CSV) ---
  cargas: '/cargas',

<<<<<<< HEAD

 // --- --- Aprobaciones por Lote (HU-FE-08 / HU-BE-05) --- ---
  aprobacionesPendientes: '/aprobaciones',
  aprobarLote: (idLote) => `/aprobaciones/${idLote}/aprobar`,
  rechazarLote: (idLote) => `/aprobaciones/${idLote}/rechazar`,
=======
  // --- Aprobaciones (flujo de aprobación de lotes) ---
  aprobaciones: '/aprobaciones',
  aprobarLote: (idLote) => `/aprobaciones/${idLote}/aprobar`,
  rechazarLote: (idLote) => `/aprobaciones/${idLote}/rechazar`,

  // --- Watchlist (favoritos y seguimiento personal - Solo Usuario móvil) ---
  watchlist: '/watchlist',
  watchlistEntidad: (idEntidad) => `/watchlist/${idEntidad}`,
>>>>>>> 724b11401948a0daff4cd5d275a4ad243ba3a932
}

export default ENDPOINTS
