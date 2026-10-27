import axios from 'axios'
import { aEntidades, aTop, aIndiceGeneral, aSesion } from './adaptadores'
import { mockOhlcData } from './mocks/ohlcMocks'
import { entidades, indiceGeneral } from './mocks/marketMocks'
import { consultarRanking, catalogoSectores, catalogoDimensiones, catalogoPeriodos } from './mocks/rankingMocks'
import { esTokenVigente } from '../utils/jwt'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Para avisar en pantalla cuando los datos son de ejemplo.
export const USA_DATOS_DE_EJEMPLO = USE_MOCK

// Puerto por defecto: 7123 para Docker Compose (.NET), 5057 para dotnet run local
export const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:7123'}${import.meta.env.VITE_API_PREFIX ?? '/api/v1'}`

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
    const esLogin = err.config?.url?.includes('/auth/login')
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

const respuesta = (dato) => new Promise((ok) => setTimeout(() => ok(dato), 150))

// Autentica contra el Backend .NET (POST /api/v1/auth/login) o Mock, devolviendo la sesión normalizada
export async function login(identificador, password) {
  if (USE_MOCK) {
    if (!identificador || !password) throw new Error('Credenciales inválidas')
    const rolSimulado = identificador.toLowerCase().includes('admin')
      ? 'Administrador'
      : identificador.toLowerCase().includes('gerente')
      ? 'Gerente'
      : 'Analista financiero'

    return aSesion({
      idUsuario: '01966f2a-4c3b-7a10-9e21-8b3d4c5e6f70',
      email: identificador.includes('@') ? identificador : `${identificador}@siftc.edu.co`,
      nombreCompleto: identificador.includes('@') ? identificador.split('@')[0] : identificador,
      rol: rolSimulado,
      token: 'mock-jwt-token-siftc-alza-2026',
    })
  }

  // Backend C# recibe AutenticarUsuarioCommand { email, password }
  const email = identificador.includes('@') ? identificador : `${identificador}@siftc.edu.co`
  const res = await http.post('/auth/login', { email, password })
  return aSesion(res.data)
}

export async function getEntidades() {
  if (USE_MOCK) return respuesta(entidades)
  return aEntidades((await http.get('/entidades')).data)
}

export async function getIndiceGeneral() {
  if (USE_MOCK) return respuesta(indiceGeneral)
  return aIndiceGeneral((await http.get('/indice-general')).data)
}

export async function getTop() {
  if (USE_MOCK) {
    const orden = [...entidades].sort((a, b) => b.variacion_porcentual - a.variacion_porcentual)
    return respuesta({ ganadores: orden.slice(0, 5), perdedores: orden.slice(-5).reverse() })
  }
  const [top, lista] = await Promise.all([http.get('/mercado/top', { params: { limite: 5 } }), getEntidades()])
  return aTop(top.data, lista)
}

export async function getOhlc(id, periodo = '1M') {
  if (USE_MOCK) return respuesta(mockOhlcData)
  return (await http.get(`/entidades/${id}/ohlc`, { params: { periodo } })).data
}

export async function getRanking(filtros = {}) {
  if (USE_MOCK) return respuesta(consultarRanking(filtros))
  return (await http.get('/ranking', { params: filtros })).data
}

export async function getSectores() {
  if (USE_MOCK) return respuesta(catalogoSectores)
  return (await http.get('/sectores')).data
}

export async function getDimensiones() {
  if (USE_MOCK) return respuesta(catalogoDimensiones)
  return (await http.get('/dimensiones')).data
}

export async function getPeriodos() {
  if (USE_MOCK) return respuesta(catalogoPeriodos)
  return (await http.get('/periodos')).data
}
