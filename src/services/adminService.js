// HU-FE-07 Usuarios, roles y parametros
// Servicio del modulo de administracion. Ningun componente llama a la API directo: todo pasa por aqui.
//
// Como funciona:
// - Con VITE_USE_MOCK=false (backend real) TODO sale del servidor del equipo de backend.
//   Nunca se inventan datos: si una ruta aun no existe, la pantalla dice cual falta.
// - Crear usuario usa la ruta REAL POST /api/v1/usuarios/registrar (ya existe).
// - Listar, editar, activar/desactivar usuarios y los pesos dependen de HU-BE-02 y HU-BE-09.
//   Cuando backend publique cada ruta, se escribe en endpoints.js y queda conectada sola.
// - Con VITE_USE_MOCK=true (sin servidor) se usan datos de prueba solo para desarrollar.

import { http } from './api'
import { ENDPOINTS } from './endpoints'
import { registrarUsuario } from './authService'
import { ROLES_CATALOGO, nombreRol } from '../constants/roles'
import { normalizarIdentificador } from '../utils/texto'
import { validarPesos, aCentesimas } from '../constants/validaciones'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Estados validos en el backend (entidad Usuario): 'activo', 'inactivo', 'bloqueado'
export const ESTADOS_USUARIO = Object.freeze({ ACTIVO: 'activo', INACTIVO: 'inactivo', BLOQUEADO: 'bloqueado' })

// Rutas que el frontend espera del backend (para mostrarlas en pantalla si faltan)
export const RUTAS_ESPERADAS = Object.freeze({
  listarUsuarios: 'GET /api/v1/usuarios',
  editarUsuario: 'PUT /api/v1/usuarios/{id}',
  cambiarEstadoUsuario: 'PATCH /api/v1/usuarios/{id}/estado',
  pesosDimensiones: 'GET y PUT /api/v1/parametros/pesos',
})

// Indica si una ruta ya esta publicada (o si estamos en modo de prueba)
export const rutaDisponible = (clave) => USE_MOCK || Boolean(ENDPOINTS[clave])

// Error cuando el backend aun no tiene la ruta. La pantalla lo reconoce por "pendiente"
function errorRutaPendiente(clave) {
  const detail = `El backend todavía no publica la ruta ${RUTAS_ESPERADAS[clave]}.`
  const err = new Error(detail)
  err.pendiente = clave
  err.response = { status: 501, data: { status: 501, detail } }
  return err
}

// Error con la misma forma que manda .NET (RFC 9457), para que extraerMensajeError lo lea igual
function errorLocal(status, detail) {
  const err = new Error(detail)
  err.response = { status, data: { status, detail } }
  return err
}

// Le agrega el nombre del rol a cada usuario para mostrarlo en la tabla
const conRol = (u) => ({
  ...u,
  estado: String(u.estado ?? ESTADOS_USUARIO.ACTIVO).toLowerCase(),
  rol: u.rol ?? nombreRol(u.idRol),
  nombreCompleto: u.nombreCompleto ?? `${u.primerNombre ?? ''} ${u.primerApellido ?? ''}`.trim(),
})

// ---------------------------------------------------------------- Datos de prueba (solo VITE_USE_MOCK=true)

const LLAVE_DEMO = 'siftc_admin_demo_v1'
const DIMENSIONES_DEMO = ['Rentabilidad', 'Liquidez', 'Solvencia', 'Crecimiento']
const ID_ROL = Object.fromEntries(ROLES_CATALOGO.map((r) => [r.nombre, r.id]))

// Usuarios semilla de docs/setup-backend/init-seguridad.sql (mismos que la base local)
const DEMO_INICIAL = {
  usuarios: [
    { id: '01966f2a-4c3b-7a10-9e21-8b3d4c5e6f71', primerNombre: 'Oscar', primerApellido: 'Administrador', email: 'admin@siftc.edu.co', idRol: ID_ROL.Administrador, estado: 'activo' },
    { id: '01966f2a-4c3b-7a10-9e21-8b3d4c5e6f70', primerNombre: 'Juan', primerApellido: 'Pérez', email: 'analista@siftc.edu.co', idRol: ID_ROL['Analista financiero'], estado: 'activo' },
  ],
  pesos: DIMENSIONES_DEMO.map((dimension) => ({ dimension, peso: 25 })),
}

function leerDemo() {
  try {
    const crudo = localStorage.getItem(LLAVE_DEMO)
    if (crudo) return JSON.parse(crudo)
  } catch {
    // si el navegador no deja leer, se usan los datos iniciales
  }
  return JSON.parse(JSON.stringify(DEMO_INICIAL))
}

function guardarDemo(datos) {
  try {
    localStorage.setItem(LLAVE_DEMO, JSON.stringify(datos))
  } catch {
    // si el navegador no deja guardar, los cambios solo duran mientras la pagina este abierta
  }
}

const esperar = (dato) => new Promise((ok) => setTimeout(() => ok(dato), 250))

// ---------------------------------------------------------------- Usuarios

export async function listarUsuarios() {
  if (USE_MOCK) return esperar(leerDemo().usuarios.map(conRol))
  if (!ENDPOINTS.listarUsuarios) throw errorRutaPendiente('listarUsuarios')
  const { data } = await http.get(ENDPOINTS.listarUsuarios)
  return (Array.isArray(data) ? data : data?.items ?? []).map(conRol)
}

export async function crearUsuario({ email, password, primerNombre, primerApellido, idRol }) {
  const correo = normalizarIdentificador(email)
  const nombre = String(primerNombre).normalize('NFC').trim()
  const apellido = String(primerApellido).normalize('NFC').trim()

  // Backend real: POST /api/v1/usuarios/registrar (ruta que ya existe)
  if (!USE_MOCK) {
    return registrarUsuario({ email: correo, password, primerNombre: nombre, primerApellido: apellido, idRol })
  }

  const demo = leerDemo()
  if (demo.usuarios.some((u) => u.email === correo)) throw errorLocal(409, 'El correo ya está registrado.')
  const id = `demo-${Date.now()}`
  demo.usuarios.push({ id, primerNombre: nombre, primerApellido: apellido, email: correo, idRol, estado: 'activo' })
  guardarDemo(demo)
  return esperar(id)
}

export async function editarUsuario(id, { primerNombre, primerApellido, idRol }) {
  const cambios = {
    primerNombre: String(primerNombre).normalize('NFC').trim(),
    primerApellido: String(primerApellido).normalize('NFC').trim(),
    idRol,
  }
  if (!USE_MOCK) {
    if (!ENDPOINTS.editarUsuario) throw errorRutaPendiente('editarUsuario')
    const { data } = await http.put(ENDPOINTS.editarUsuario.replace('{id}', id), cambios)
    return data
  }
  const demo = leerDemo()
  const usuario = demo.usuarios.find((u) => u.id === id)
  if (!usuario) throw errorLocal(404, 'El usuario ya no existe.')
  Object.assign(usuario, cambios)
  guardarDemo(demo)
  return esperar(conRol(usuario))
}

// Desactivar NO borra: el usuario queda guardado para la bitacora y la auditoria
export async function cambiarEstadoUsuario(id, estado) {
  if (!Object.values(ESTADOS_USUARIO).includes(estado)) throw errorLocal(422, 'Estado de usuario no válido.')
  if (!USE_MOCK) {
    if (!ENDPOINTS.cambiarEstadoUsuario) throw errorRutaPendiente('cambiarEstadoUsuario')
    const { data } = await http.patch(ENDPOINTS.cambiarEstadoUsuario.replace('{id}', id), { estado })
    return data
  }
  const demo = leerDemo()
  const usuario = demo.usuarios.find((u) => u.id === id)
  if (!usuario) throw errorLocal(404, 'El usuario ya no existe.')
  usuario.estado = estado
  guardarDemo(demo)
  return esperar(conRol(usuario))
}

// ---------------------------------------------------------------- Pesos

export async function obtenerPesos() {
  if (USE_MOCK) return esperar(leerDemo().pesos)
  if (!ENDPOINTS.pesosDimensiones) throw errorRutaPendiente('pesosDimensiones')
  // El servidor manda pesoIc de 0 a 1 (columna analitica.dim_dimension.peso_ic); en pantalla va en %
  const { data } = await http.get(ENDPOINTS.pesosDimensiones)
  return data.map((d) => ({
    idDimension: d.idDimension,
    dimension: d.nombre ?? d.dimension,
    peso: Math.round(Number(d.pesoIc) * 1000) / 10,
  }))
}

export async function guardarPesos(pesos) {
  // Segunda barrera: aunque la pantalla ya bloquea el boton, aqui tampoco se deja pasar si no suman 100
  const revision = validarPesos(pesos)
  if (!revision.valido) throw errorLocal(422, revision.error)

  const limpios = pesos.map((p) => ({ idDimension: p.idDimension, dimension: p.dimension, peso: aCentesimas(p.peso) / 100 }))

  if (!USE_MOCK) {
    if (!ENDPOINTS.pesosDimensiones) throw errorRutaPendiente('pesosDimensiones')
    // Se envia como pesoIc de 0 a 1 (25,5 % -> 0.255), igual que la columna peso_ic
    const cuerpo = limpios.map((p) => ({ idDimension: p.idDimension, nombre: p.dimension, pesoIc: aCentesimas(p.peso) / 10000 }))
    await http.put(ENDPOINTS.pesosDimensiones, cuerpo)
    return limpios
  }
  const demo = leerDemo()
  demo.pesos = limpios
  guardarDemo(demo)
  return esperar(limpios)
}
