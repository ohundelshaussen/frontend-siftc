// Mapa único de rutas de la API SIFTC (https://siftc.onrender.com).
// Si Backend cambia una ruta, se corrige SOLO aquí: ningún componente escribe rutas a mano.
//
// Las rutas marcadas como POR VERIFICAR no están confirmadas contra el OpenAPI del
// servidor desplegado. Ejecuta `npm run diagnostico:api` para contrastarlas y
// corrige abajo las que no coincidan.

export const ENDPOINTS = {
  // --- Health ---
  // OJO: health cuelga de la RAIZ del servidor, NO del prefijo /api/v1.
  // Por eso en api.js se pide con URL absoluta y no con el baseURL de axios.
  health: '/health',

  // --- Auth (grupo "Auth") ---
  login: '/auth/login',

  // --- Usuarios (grupo "Usuarios") ---
  registrarUsuario: '/usuarios/registrar',
  // HU-FE-07: estas rutas aun no existen en el servidor (dependen de HU-BE-02 y HU-BE-09).
  // Mientras sigan en null, el modulo de administracion usa datos de prueba.
  // Cuando Backend las publique, solo se escribe la ruta aqui.
  listarUsuarios: null,              // GET    /usuarios
  editarUsuario: null,               // PUT    /usuarios/{id}
  cambiarEstadoUsuario: null,        // PATCH  /usuarios/{id}/estado
  // NO EXISTE en el servidor (verificado 2026-11-01): no hay endpoint para listar roles.
  // Los UUID de rol siguen hardcodeados; pídeselos a Backend.
  roles: null,

  // --- Entidades (grupo "Entidades", confirmado en la documentación visible) ---
  entidades: '/entidades',
  entidad: (id) => `/entidades/${id}`,
  ohlc: (id) => `/entidades/${id}/ohlc`,

  // --- Métricas ---
  // El servidor expone UN solo GET /api/v1/metricas (no hay /indice-general ni /mercado/top).
  // Falta confirmar qué trae adentro: ejecuta `npm run explorar:api`.
  metricas: '/metricas',

  // --- Ranking (grupo "Ranking") ---
  ranking: '/ranking',

  // --- Parámetros ---
  // NO EXISTEN los catálogos de filtros (verificado 2026-11-01). Lo único publicado
  // es POST /parametros/actualizar-umbral. Mientras Backend no los implemente,
  // sectores/dimensiones/periodos se sirven desde los mocks locales.
  sectores: null,
  dimensiones: null,
  periodos: null,
  actualizarUmbral: '/parametros/actualizar-umbral',
  // HU-FE-07: pesos de las dimensiones del indice (aun no existe en el servidor)
  pesosDimensiones: null,            // GET y PUT /parametros/pesos

  // --- Cargas (subida de la matriz financiera CSV) ---
  cargas: '/cargas',
}

export default ENDPOINTS
