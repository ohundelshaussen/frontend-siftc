import axios from 'axios'
import { aEntidades, aTop, aIndiceGeneral, aSesion } from './adaptadores'
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

const respuesta = (dato) => new Promise((ok) => setTimeout(() => ok(dato), 150))

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
  return aSesion(res.data)
}

export async function getEntidades() {
  return conRespaldoMock(
    async () => aEntidades((await http.get('/entidades')).data),
    () => entidades,
  )
}

export async function getIndiceGeneral() {
  return conRespaldoMock(
    async () => aIndiceGeneral((await http.get('/indice-general')).data),
    () => indiceGeneral,
  )
}

export async function getTop() {
  return conRespaldoMock(
    async () => {
      const [top, lista] = await Promise.all([
        http.get('/mercado/top', { params: { limite: 5 } }),
        getEntidades(),
      ])
      return aTop(top.data, lista)
    },
    calcularTopMock,
  )
}

export async function getOhlc(id, periodo = '1M') {
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
  return conRespaldoMock(
    async () => (await http.get(`/entidades/${id}/ohlc`, { params: { periodo: periodoApi } })).data,
    () => obtenerOhlcMock(id, periodo),
  )
}

export async function getRanking(filtros = {}) {
  return conRespaldoMock(
    async () => (await http.get('/ranking', { params: filtros })).data,
    () => consultarRanking(filtros),
  )
}

export async function getSectores() {
  return conRespaldoMock(
    async () => (await http.get('/sectores')).data,
    () => catalogoSectores,
  )
}

export async function getDimensiones() {
  return conRespaldoMock(
    async () => (await http.get('/dimensiones')).data,
    () => catalogoDimensiones,
  )
}

export async function getPeriodos() {
  return conRespaldoMock(
    async () => (await http.get('/periodos')).data,
    () => catalogoPeriodos,
  )
}
