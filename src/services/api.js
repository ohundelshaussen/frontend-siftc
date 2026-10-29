import axios from 'axios'
import { aEntidades, aTop, aIndiceGeneral, aSesion, aSerieOhlc } from './adaptadores'
import { obtenerOhlcMock } from './mocks/ohlcMocks'
import { entidades, indiceGeneral } from './mocks/marketMocks'
import { consultarRanking, catalogoSectores, catalogoDimensiones, catalogoPeriodos } from './mocks/rankingMocks'
import { esTokenVigente } from '../utils/jwt'
import { normalizarIdentificador, normalizarPassword } from '../utils/texto'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Para avisar en pantalla cuando los datos provienen de simulación o respaldo local.
export let USA_DATOS_DE_EJEMPLO = USE_MOCK

// Base URL: Render en producción/nube o localhost si se configura
export const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'https://siftc.onrender.com'}${import.meta.env.VITE_API_PREFIX ?? '/api/v1'}`

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
    const originalUrl = err.config?.url || ''
    const esLogin = originalUrl.includes('/auth/login')
    const esRanking = originalUrl.includes('/ranking')

    // Si ranking o un recurso opcional da 401, dejamos que el catch lo gestione sin cerrar sesión abruptamente
    if (err.response?.status === 401 && !esLogin && !esRanking) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

const respuesta = (dato) => Promise.resolve(dato)

// Caché en memoria de alto rendimiento para garantizar velocidad inmediata (0 ms) en filtros y cambios de vista
const cacheMemoria = {
  entidades: null,
  indiceGeneral: null,
  top: null,
  rankingGeneral: null,
  rankingPorFiltro: new Map(),
  ohlc: new Map(),
  catalogos: {
    sectores: null,
    dimensiones: null,
    periodos: null,
  },
}

export function limpiarCache() {
  cacheMemoria.entidades = null
  cacheMemoria.indiceGeneral = null
  cacheMemoria.top = null
  cacheMemoria.rankingGeneral = null
  cacheMemoria.rankingPorFiltro.clear()
  cacheMemoria.ohlc.clear()
  cacheMemoria.catalogos.sectores = null
  cacheMemoria.catalogos.dimensiones = null
  cacheMemoria.catalogos.periodos = null
}

// Si un endpoint analítico aún no está implementado en el backend (404/5xx/red o 401 en datos opcionales),
// usa los datos simulados de respaldo sin ocultar errores de autorización en rutas críticas.
async function conRespaldoMock(peticionReal, obtenerMock) {
  if (USE_MOCK) return respuesta(obtenerMock())
  try {
    const dato = await peticionReal()
    if (Array.isArray(dato) && dato.length === 0) {
      USA_DATOS_DE_EJEMPLO = true
      return obtenerMock()
    }
    return dato
  } catch (err) {
    const status = err?.response?.status
    // Si ranking o entidad pide autenticación y aún no hay token o falló el microservicio, usar respaldo
    if (status === 401) {
      USA_DATOS_DE_EJEMPLO = true
      return obtenerMock()
    }
    if (status === 403) throw err
    USA_DATOS_DE_EJEMPLO = true
    return obtenerMock()
  }
}

function calcularTopMock() {
  const orden = [...entidades].sort((a, b) => b.variacion_porcentual - a.variacion_porcentual)
  return { ganadores: orden.slice(0, 5), perdedores: orden.slice(-5).reverse() }
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

    limpiarCache()
    return aSesion({
      idUsuario: '01966f2a-4c3b-7a10-9e21-8b3d4c5e6f70',
      email: usuarioNormalizado.includes('@') ? usuarioNormalizado : `${usuarioNormalizado}@siftc.edu.co`,
      nombreCompleto: usuarioNormalizado.includes('@') ? usuarioNormalizado.split('@')[0] : identificador.trim(),
      rol: rolSimulado,
      token: 'mock-jwt-token-siftc-alza-2026',
    })
  }

  // Compatible con Backend Render ({ usuario, password }) y Docker local ({ email, password })
  const email = usuarioNormalizado.includes('@') ? usuarioNormalizado : `${usuarioNormalizado}@siftc.edu.co`
  const payload = {
    usuario: usuarioNormalizado,
    email,
    password: passwordNormalizado,
  }
  const res = await http.post('/auth/login', payload)
  limpiarCache()
  return aSesion(res.data)
}

export async function getEntidades() {
  if (cacheMemoria.entidades && cacheMemoria.entidades.length > 0) {
    return cacheMemoria.entidades
  }
  const datos = await conRespaldoMock(
    async () => aEntidades((await http.get('/entidades')).data),
    () => entidades,
  )
  if (datos && datos.length > 0) {
    cacheMemoria.entidades = datos
  }
  return datos
}

export async function getIndiceGeneral() {
  if (cacheMemoria.indiceGeneral) {
    return cacheMemoria.indiceGeneral
  }
  const datos = await conRespaldoMock(
    async () => aIndiceGeneral((await http.get('/indice-general')).data),
    () => indiceGeneral,
  )
  if (datos) cacheMemoria.indiceGeneral = datos
  return datos
}

export async function getTop() {
  if (cacheMemoria.top) {
    return cacheMemoria.top
  }
  const datos = await conRespaldoMock(
    async () => {
      const [top, lista] = await Promise.all([
        http.get('/mercado/top', { params: { limite: 5 } }),
        getEntidades(),
      ])
      return aTop(top.data, lista)
    },
    calcularTopMock,
  )
  if (datos) cacheMemoria.top = datos
  return datos
}

export async function getOhlc(id, periodo = '1M', entidadOpcional = null) {
  const mapeoPeriodo = {
    '1D': 'Diaria',
    '1S': 'Diaria',
    '1M': 'Mensual',
    '1T': 'Trimestral',
    '1A': 'Trimestral',
    'Máx.': 'Trimestral',
    'MAX': 'Trimestral',
    'Diaria': 'Diaria',
    'Mensual': 'Mensual',
    'Trimestral': 'Trimestral',
  }
  const periodoApi = mapeoPeriodo[periodo] || periodo
  const codigoOConsulta = entidadOpcional?.codigo_entidad || entidadOpcional?.codigo || id
  const claveCache = `${String(codigoOConsulta).toUpperCase()}-${periodo}`

  if (cacheMemoria.ohlc.has(claveCache)) {
    return cacheMemoria.ohlc.get(claveCache)
  }

  const resultado = await conRespaldoMock(
    async () => {
      const res = await http.get(`/entidades/${id}/ohlc`, { params: { periodo: periodoApi } })
      const adaptado = aSerieOhlc(res.data)
      if (adaptado.length === 0) throw new Error('Serie OHLC vacía')
      return adaptado
    },
    () => aSerieOhlc(obtenerOhlcMock(codigoOConsulta, periodo, entidadOpcional)),
  )

  if (resultado && resultado.length > 0) {
    cacheMemoria.ohlc.set(claveCache, resultado)
  }
  return resultado
}

export async function getRanking(filtros = {}) {
  const clave = JSON.stringify(filtros)
  if (cacheMemoria.rankingPorFiltro.has(clave)) {
    return cacheMemoria.rankingPorFiltro.get(clave)
  }

  const resultado = await conRespaldoMock(
    async () => (await http.get('/ranking', { params: filtros })).data,
    () => consultarRanking(filtros),
  )

  if (resultado) {
    cacheMemoria.rankingPorFiltro.set(clave, resultado)
  }
  return resultado
}

export async function getSectores() {
  if (cacheMemoria.catalogos.sectores) {
    return cacheMemoria.catalogos.sectores
  }
  const datos = await conRespaldoMock(
    async () => (await http.get('/sectores')).data,
    () => catalogoSectores,
  )
  if (datos) cacheMemoria.catalogos.sectores = datos
  return datos
}

export async function getDimensiones() {
  if (cacheMemoria.catalogos.dimensiones) {
    return cacheMemoria.catalogos.dimensiones
  }
  const datos = await conRespaldoMock(
    async () => (await http.get('/dimensiones')).data,
    () => catalogoDimensiones,
  )
  if (datos) cacheMemoria.catalogos.dimensiones = datos
  return datos
}

export async function getPeriodos() {
  if (cacheMemoria.catalogos.periodos) {
    return cacheMemoria.catalogos.periodos
  }
  const datos = await conRespaldoMock(
    async () => (await http.get('/periodos')).data,
    () => catalogoPeriodos,
  )
  if (datos) cacheMemoria.catalogos.periodos = datos
  return datos
}
