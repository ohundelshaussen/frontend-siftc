import { ROLES, tieneRol } from './roles'

/**
 * Matriz de Permisos por Rol y Sensibilidad del Dato
 * Fuente: Documento oficial HU-FE-07 Sprint 4 Criterio CA 1 (2026-11-08)
 *
 * Niveles de sensibilidad:
 * - Publica: Nombre/sector entidad, series OHLC
 * - Interna: Código entidad, IC, valores métricas, pesos IC, bitácora, ranking sin posición, watchlist ver
 * - Confidencial: Posición en ranking, matriz financiera cruda, datos financieros detallados
 * - Restringida: Credenciales, usuarios y roles
 */

// Roles con acceso de lectura al Ranking (General o por Dimensión)
// Nota: Usuario móvil no tiene acceso al ranking (SA -> HTTP 403)
export const ROLES_CON_ACCESO_RANKING = [
  ROLES.ADMINISTRADOR,
  ROLES.DATA_STEWARD,
  ROLES.ANALISTA,
  ROLES.GERENTE,
  ROLES.AUDITOR,
]

// Roles con acceso a la Posición en el Ranking (Confidencial)
// Decisión D1: El Gerente / Directivo ve el ranking pero SIN posición ni cambio de posición (SA)
export const ROLES_CON_ACCESO_POSICION = [
  ROLES.ADMINISTRADOR,
  ROLES.DATA_STEWARD,
  ROLES.ANALISTA,
  ROLES.AUDITOR,
]

// Roles autorizados para Comparar Entidades (HU-FE-05)
// El comparador consulta /ranking, por lo que hereda los roles con acceso al ranking
export const ROLES_CON_ACCESO_COMPARADOR = [
  ROLES.ADMINISTRADOR,
  ROLES.DATA_STEWARD,
  ROLES.ANALISTA,
  ROLES.GERENTE,
  ROLES.AUDITOR,
]

// Decisión D2: Quien agrega o quita en la watchlist -> D2 = A: solo el Usuario móvil
export const ROLES_MODIFICAR_WATCHLIST = [
  ROLES.USUARIO_MOVIL,
]

// Todos los usuarios autenticados pueden ver su propia watchlist
export const ROLES_VER_WATCHLIST = [
  ROLES.ADMINISTRADOR,
  ROLES.DATA_STEWARD,
  ROLES.ANALISTA,
  ROLES.GERENTE,
  ROLES.AUDITOR,
  ROLES.USUARIO_MOVIL,
]

// Carga de Matriz Financiera Cruda (Confidencial)
export const ROLES_CARGA_MATRIZ = [
  ROLES.ADMINISTRADOR,
  ROLES.ANALISTA,
]

// Aprobación de Cálculos (Bandeja y Decisión)
export const ROLES_DECISION_APROBACIONES = [
  ROLES.ANALISTA,
]

export const ROLES_CONSULTA_APROBACIONES = [
  ROLES.ADMINISTRADOR,
  ROLES.DATA_STEWARD,
  ROLES.ANALISTA,
  ROLES.AUDITOR,
]

// Parámetros del Sistema (Pesos, Frecuencias, Umbrales)
export const ROLES_ESCRITURA_PARAMETROS = [
  ROLES.ADMINISTRADOR,
  ROLES.ANALISTA,
]

export const ROLES_LECTURA_PARAMETROS = [
  ROLES.ADMINISTRADOR,
  ROLES.ANALISTA,
  ROLES.AUDITOR,
]

// Gestión de Usuarios y Roles (Restringida)
export const ROLES_GESTION_USUARIOS = [
  ROLES.ADMINISTRADOR,
]

// Auditoría y Bitácora
export const ROLES_CONSULTA_AUDITORIA = [
  ROLES.ADMINISTRADOR,
  ROLES.AUDITOR,
]

/* ==========================================================================
   Helpers de Autorización para Vistas y Componentes
   ========================================================================== */

export const puedeConsultarRanking = (usuario) => tieneRol(usuario, ROLES_CON_ACCESO_RANKING)

export const puedeVerPosicionRanking = (usuario) => tieneRol(usuario, ROLES_CON_ACCESO_POSICION)

export const puedeConsultarComparador = (usuario) => tieneRol(usuario, ROLES_CON_ACCESO_COMPARADOR)

export const puedeModificarWatchlist = (usuario) => tieneRol(usuario, ROLES_MODIFICAR_WATCHLIST)

export const puedeConsultarWatchlist = (usuario) => tieneRol(usuario, ROLES_VER_WATCHLIST)

export const puedeGestionarUsuarios = (usuario) => tieneRol(usuario, ROLES_GESTION_USUARIOS)

export const puedeGestionarParametros = (usuario) => tieneRol(usuario, ROLES_ESCRITURA_PARAMETROS)

export const puedeLeerParametros = (usuario) => tieneRol(usuario, ROLES_LECTURA_PARAMETROS)

export const puedeAccederModuloAdministracion = (usuario) =>
  puedeGestionarUsuarios(usuario) || puedeLeerParametros(usuario)
