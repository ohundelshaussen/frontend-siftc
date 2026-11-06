import axios from 'axios'
import { ENDPOINTS } from './endpoints'
import { PERIODOS, PERIODO_POR_DEFECTO } from '../constants/periodos'
import { aEntidades, aSesion, aSerieOhlc } from './adaptadores'
import { esTokenVigente } from '../utils/jwt'
import { normalizarIdentificador, normalizarPassword } from '../utils/texto'

// Render (plan gratuito) duerme el servicio tras ~15 min sin tráfico:
// la primera petición puede tardar 30-60 s mientras la instancia arranca.
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? 60000)

// Modo simulado eliminado: siempre en falso para no alterar componentes consumidores.
export const USA_DATOS_DE_EJEMPLO = false

// Servidor de la API externo desplegado en Render (contrato oficial: docs/api/openapi-v1.json)
const RAIZ_SERVIDOR = import.meta.env.VITE_API_URL || 'https://siftc.onrender.com'
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

// Autentica contra el Backend .NET (POST /api/v1/auth/login), devolviendo la sesión normalizada
export async function login(identificador, password) {
  const usuarioNormalizado = normalizarIdentificador(identificador)
  const passwordNormalizado = normalizarPassword(password)

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
  const res = await conReintentoDeArranque(() => http.get(ENDPOINTS.entidades))
  return aEntidades(res.data)
}

// El servidor sólo expone GET /api/v1/metricas. Falta confirmar si su respuesta
// trae el índice general y el top: ejecuta `npm run explorar:api` y ajusta aquí.
export async function getIndiceGeneral() {
  // No existe /indice-general en el servidor: se deriva de las entidades REALES
  // (promedio del IC y de su variación) para no mezclar datos reales con simulados.
  const lista = await getEntidades()
  const validas = lista.filter((e) => Number.isFinite(e.indice_competitividad))
  if (validas.length === 0) throw new Error('Sin entidades para calcular el índice general')
  const prom = (campo) => validas.reduce((s, e) => s + (Number(e[campo]) || 0), 0) / validas.length
  const valor = prom('indice_competitividad')
  const puntos = prom('variacion')
  const anterior = valor - puntos
  return {
    fecha: new Date().toISOString().slice(0, 10),
    valor,
    puntos,
    variacion: anterior ? (puntos / anterior) * 100 : 0,
  }
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
  const res = await conReintentoDeArranque(() =>
    http.get(ENDPOINTS.ohlc(id), { params: { periodo } }),
  )
  return aSerieOhlc(res.data)
}

// GET /api/v1/metricas -> array de métricas por entidad, fecha y dimensión.
// Parámetros admitidos: sector, periodo, fecha, dimension, page, size, sort, dir
export async function getMetricas(filtros = {}) {
  const res = await conReintentoDeArranque(() =>
    http.get(ENDPOINTS.metricas, { params: filtros }),
  )
  return res.data
}

// Los catálogos de filtros no tienen endpoint propio: se derivan de los datos reales.
async function catalogoDerivado(nombre, obtenerValores) {
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
  // /ranking admite diario|mensual|trimestral; /ohlc admite Diaria|Mensual|Trimestral.
  const ALIAS_RANKING = { diaria: 'diario' }
  const periodo = filtros.periodo
    ? (ALIAS_RANKING[String(filtros.periodo).toLowerCase()] ?? String(filtros.periodo).toLowerCase())
    : undefined
  const res = await conReintentoDeArranque(() =>
    http.get(ENDPOINTS.ranking, { params: { ...filtros, ...(periodo && { periodo }) } }),
  )
  return res.data
}

// Sectores: valores únicos del campo 'sector' en /entidades
export async function getSectores() {
  return catalogoDerivado('sectores', async () => (await getEntidades()).map((e) => e.sector))
}

// Dimensiones: valores únicos del campo 'dimension' en /metricas
export async function getDimensiones() {
  return catalogoDerivado('dimensiones', async () => (await getMetricas({ size: 500 })).map((m) => m.dimension))
}

// Periodos: lista acordada con Backend (no hay endpoint de catálogo en la API).
export async function getPeriodos() {
  return PERIODOS
}
