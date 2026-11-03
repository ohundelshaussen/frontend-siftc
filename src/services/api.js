import axios from 'axios'
import { ENDPOINTS } from './endpoints'
import { PERIODOS, PERIODO_POR_DEFECTO } from '../constants/periodos'
import { aEntidades, aSesion, aSerieOhlc } from './adaptadores'
import { obtenerOhlcMock } from './mocks/ohlcMocks'
import { entidades, indiceGeneral } from './mocks/marketMocks'
import { consultarRanking, catalogoSectores, catalogoDimensiones } from './mocks/rankingMocks'
import { esTokenVigente } from '../utils/jwt'
import { normalizarIdentificador, normalizarPassword } from '../utils/texto'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Respaldo con datos simulados cuando un endpoint real falla.
// Por defecto DESACTIVADO: contra un servidor real conviene ver el error, no datos falsos.
const FALLBACK_MOCK = import.meta.env.VITE_FALLBACK_MOCK === 'true'

// Render (plan gratuito) duerme el servicio tras ~15 min sin tráfico:
// la primera petición puede tardar 30-60 s mientras la instancia arranca.
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? 60000)

// Para avisar en pantalla cuando los datos provienen de simulación o respaldo local.
export let USA_DATOS_DE_EJEMPLO = USE_MOCK

// Puerto por defecto: 7123 para Docker Compose (.NET), 5057 para dotnet run local
const RAIZ_SERVIDOR = import.meta.env.VITE_API_URL ?? 'http://localhost:7123'
export const API_BASE_URL = `${RAIZ_SERVIDOR}${import.meta.env.VITE_API_PREFIX ?? '/api/v1'}`

// /health cuelga de la raíz del servidor, no de /api/v1: se pide con URL absoluta.
const URL_HEALTH = `${RAIZ_SERVIDOR}${ENDPOINTS.health}`

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, application/problem+json',
  },
})

// Inyectar Authorization Bearer solo si el token existe y sigue vigente
http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token')
  if (token) {
    if (esTokenVigente(token)) {
      cfg.headers.Authorization = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
  return cfg
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    // En el login un 401 es "clave incorrecta": no se redirige, para que la UI muestre el mensaje RFC 9457
    const esLogin = err.config?.url?.includes(ENDPOINTS.login)
    if (err.response?.status === 401 && !esLogin) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

// --- Arranque en frío de Render -------------------------------------------------

// Un fallo "de arranque": no hay respuesta HTTP (red caída, instancia dormida)
// o venció el timeout. Un 4xx/5xx NO entra aquí: el servidor sí contestó.
const esFalloDeArranque = (err) =>
  err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK' || !err?.response

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms))

// Reintenta una vez si la instancia estaba dormida y la primera petición murió esperando.
async function conReintentoDeArranque(peticion, intentos = 2) {
  let ultimoError
  for (let i = 0; i < intentos; i += 1) {
    try {
      return await peticion()
    } catch (err) {
      ultimoError = err
      if (!esFalloDeArranque(err) || i === intentos - 1) throw err
      console.warn(`[API] El backend no respondió (intento ${i + 1}/${intentos}). Puede estar despertando en Render; reintentando...`)
      await esperar(3000)
    }
  }
  throw ultimoError
}

/**
 * Despierta la instancia de Render antes de que el usuario intente iniciar sesión.
 * Se llama una sola vez al arrancar la app (src/main.jsx).
 * Nunca lanza: si falla, la app sigue y el error aparecerá en la petición real.
 */
export async function despertarBackend() {
  if (USE_MOCK) return { despierto: true, mock: true }
  const inicio = Date.now()
  try {
    await conReintentoDeArranque(() => http.get(URL_HEALTH))
    const ms = Date.now() - inicio
    console.info(`[API] Backend disponible en ${ms} ms (${API_BASE_URL})`)
    return { despierto: true, ms }
  } catch (err) {
    console.warn(`[API] No se pudo contactar ${URL_HEALTH}:`, err?.message)
    return { despierto: false, error: err }
  }
}

const respuesta = (dato) => new Promise((ok) => setTimeout(() => ok(dato), 150))

// Ejecuta la petición real. Si VITE_FALLBACK_MOCK='true' y el endpoint analítico
// todavía no existe (404/5xx/red), cae a datos simulados; en caso contrario propaga
// el error para que el fallo sea visible en vez de disfrazarse de dato bueno.
// Los errores de autorización (401/403) siempre se propagan.
async function conRespaldoMock(peticionReal, obtenerMock, nombre = 'endpoint') {
  if (USE_MOCK) return respuesta(obtenerMock())
  try {
    const dato = await conReintentoDeArranque(peticionReal)
    if (Array.isArray(dato) && dato.length === 0 && FALLBACK_MOCK) {
      console.warn(`[API] ${nombre} devolvió una lista vacía; usando datos de ejemplo.`)
      USA_DATOS_DE_EJEMPLO = true
      return obtenerMock()
    }
    return dato
  } catch (err) {
    const status = err?.response?.status
    if (status === 401 || status === 403) throw err
    console.error(`[API] Falló ${nombre} (${status ?? err?.code ?? 'sin respuesta'}):`, err?.message)
    if (!FALLBACK_MOCK) throw err
    USA_DATOS_DE_EJEMPLO = true
    return obtenerMock()
  }
}

// Endpoint que el backend TODAVÍA no publica (ver src/services/endpoints.js: ruta en null).
// Se sirve el mock y se marca la pantalla como "datos de ejemplo", sin intentar la llamada.
function pendienteEnBackend(nombre, obtenerMock) {
  if (!USE_MOCK) {
    console.warn(`[API] ${nombre} aún no existe en el servidor; mostrando datos de ejemplo.`)
    USA_DATOS_DE_EJEMPLO = true
  }
  return respuesta(obtenerMock())
}

// Duracion de la sesion de prueba (modo mock): 8 horas
const DURACION_SESION_MOCK_SEG = 8 * 60 * 60

// Pasa un objeto a Base64URL aceptando tildes y enies (UTF-8)
function aBase64Url(objeto) {
  const bytes = new TextEncoder().encode(JSON.stringify(objeto))
  let binario = ''
  bytes.forEach((b) => { binario += String.fromCharCode(b) })
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Crea un token con forma de JWT para el modo mock.
// Antes era un texto fijo sin forma de JWT: al recargar la pagina se tomaba como
// vencido, se borraba la sesion y la app mandaba al login.
// No lleva firma real porque solo sirve para pruebas sin servidor.
function crearTokenMock({ idUsuario, email, nombre, rol }) {
  const ahora = Math.floor(Date.now() / 1000)
  const cabecera = { alg: 'none', typ: 'JWT' }
  const datos = {
    sub: idUsuario,
    email,
    name: nombre,
    role: rol,
    iat: ahora,
    exp: ahora + DURACION_SESION_MOCK_SEG,
  }
  return `${aBase64Url(cabecera)}.${aBase64Url(datos)}.mock`
}

// Autentica contra el Backend .NET (POST /api/v1/auth/login) o Mock, devolviendo la sesión normalizada
export async function login(identificador, password) {
  const usuarioNormalizado = normalizarIdentificador(identificador)
  const passwordNormalizado = normalizarPassword(password)

  if (USE_MOCK) {
    if (!usuarioNormalizado || !passwordNormalizado) throw new Error('Credenciales inválidas')
    const rolSimulado = usuarioNormalizado.includes('admin')
      ? 'Administrador'
      : usuarioNormalizado.includes('gerente')
      ? 'Gerente'
      : 'Analista financiero'

    const idUsuario = '01966f2a-4c3b-7a10-9e21-8b3d4c5e6f70'
    const email = usuarioNormalizado.includes('@') ? usuarioNormalizado : `${usuarioNormalizado}@siftc.edu.co`
    const nombreCompleto = usuarioNormalizado.includes('@') ? usuarioNormalizado.split('@')[0] : identificador.trim()

    return aSesion({
      idUsuario,
      email,
      nombreCompleto,
      rol: rolSimulado,
      token: crearTokenMock({ idUsuario, email, nombre: nombreCompleto, rol: rolSimulado }),
    })
  }

  // Contrato real verificado en el OpenAPI (2026-11-01):
  // POST /api/v1/auth/login recibe { usuario, password } -- NO { email }.
  // Se envía el identificador tal cual lo escribió la persona (alias o correo).
  // El login NO cae a mock: una credencial debe validarse siempre contra el servidor real.
  const res = await conReintentoDeArranque(() =>
    http.post(ENDPOINTS.login, { usuario: usuarioNormalizado, password: passwordNormalizado }),
  )
  // Respuesta: { token, expiraEn, usuario: { id, nombre, rol } }
  return aSesion(res.data)
}

export async function getEntidades() {
  return conRespaldoMock(
    async () => aEntidades((await http.get(ENDPOINTS.entidades)).data),
    () => entidades,
    ENDPOINTS.entidades,
  )
}

// El servidor sólo expone GET /api/v1/metricas. Falta confirmar si su respuesta
// trae el índice general y el top: ejecuta `npm run explorar:api` y ajusta aquí.
export async function getIndiceGeneral() {
  return pendienteEnBackend('indice general', () => indiceGeneral)
}

// No existe /mercado/top en el servidor, pero el top son las mismas entidades
// ordenadas por variación: se calcula aquí con los datos REALES de /entidades.
export async function getTop() {
  const lista = await getEntidades()
  const orden = [...lista].sort((a, b) => b.variacion_porcentual - a.variacion_porcentual)
  return { ganadores: orden.slice(0, 5), perdedores: orden.slice(-5).reverse() }
}

// El periodo viaja tal cual a la API: 'diario' | 'quincenal' | 'mensual' | 'semestral' | 'anual'
// (ver src/constants/periodos.js)
export async function getOhlc(id, periodo = PERIODO_POR_DEFECTO) {
  return conRespaldoMock(
    async () => aSerieOhlc((await http.get(ENDPOINTS.ohlc(id), { params: { periodo } })).data),
    () => obtenerOhlcMock(id, periodo),
    ENDPOINTS.ohlc(id),
  )
}

// GET /api/v1/metricas -> array de métricas por entidad, fecha y dimensión.
// Parámetros admitidos: sector, periodo, fecha, dimension, page, size, sort, dir
export async function getMetricas(filtros = {}) {
  return conRespaldoMock(
    async () => (await http.get(ENDPOINTS.metricas, { params: filtros })).data,
    () => [],
    ENDPOINTS.metricas,
  )
}

// Los catálogos de filtros no tienen endpoint propio: se derivan de los datos reales.
// Si la derivación falla, se cae a los catálogos de ejemplo para no romper la pantalla.
async function catalogoDerivado(nombre, obtenerValores, mock) {
  if (USE_MOCK) return respuesta(mock)
  try {
    const valores = [...new Set((await obtenerValores()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
    // Lista vacía = el servidor todavía no tiene esos datos. Se devuelve vacío a propósito:
    // ofrecer opciones de ejemplo que no filtran nada confunde más que no ofrecer ninguna.
    if (valores.length === 0) {
      console.warn(`[API] El servidor no tiene datos de ${nombre}; el filtro queda deshabilitado.`)
      return []
    }
    return valores.map((nombreValor, i) => ({ id: i + 1, nombre: nombreValor }))
  } catch (err) {
    console.warn(`[API] No se pudo consultar el catálogo de ${nombre}.`, err?.message)
    return []
  }
}

export async function getRanking(filtros = {}) {
  return conRespaldoMock(
    async () => (await http.get(ENDPOINTS.ranking, { params: filtros })).data,
    () => consultarRanking(filtros),
    ENDPOINTS.ranking,
  )
}

// Sectores: valores únicos del campo 'sector' en /entidades
export async function getSectores() {
  return catalogoDerivado('sectores', async () => (await getEntidades()).map((e) => e.sector), catalogoSectores)
}

// Dimensiones: valores únicos del campo 'dimension' en /metricas
export async function getDimensiones() {
  return catalogoDerivado('dimensiones', async () => (await getMetricas({ size: 500 })).map((m) => m.dimension), catalogoDimensiones)
}

// Periodos: lista acordada con Backend (no hay endpoint de catálogo en la API).
export async function getPeriodos() {
  return respuesta(PERIODOS)
}

