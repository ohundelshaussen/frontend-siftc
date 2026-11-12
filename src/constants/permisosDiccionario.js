// HU-DD-08 CA 3: que niveles de sensibilidad puede ver cada rol en el diccionario.
// Fuente: Matriz de permisos por rol y sensibilidad del dato (Backend, v1.1, 2026-11-08)
//   - Publico e Interno: todos los usuarios autenticados.
//   - Confidencial: Administrador, Data Steward, Analista financiero y Auditor.
//     Gerente y Usuario movil no tienen acceso (SA en la matriz).
//   - Restringido: solo el Administrador. Ademas Frell no exporta estos datos al CSV.
// Si un rol no se reconoce, solo ve lo Publico (se cierra por defecto).

import { claveComparacion } from '../utils/texto'

export const NIVELES = Object.freeze({
  PUBLICO: 'publico',
  INTERNO: 'interno',
  CONFIDENCIAL: 'confidencial',
  RESTRINGIDO: 'restringido',
})

export const ETIQUETA_NIVEL = Object.freeze({
  publico: 'Público',
  interno: 'Interno',
  confidencial: 'Confidencial',
  restringido: 'Restringido',
})

// Rol (normalizado sin tildes) -> niveles que puede leer
const NIVELES_POR_ROL = {
  administrador: [NIVELES.PUBLICO, NIVELES.INTERNO, NIVELES.CONFIDENCIAL, NIVELES.RESTRINGIDO],
  'data steward': [NIVELES.PUBLICO, NIVELES.INTERNO, NIVELES.CONFIDENCIAL],
  'analista financiero': [NIVELES.PUBLICO, NIVELES.INTERNO, NIVELES.CONFIDENCIAL],
  auditor: [NIVELES.PUBLICO, NIVELES.INTERNO, NIVELES.CONFIDENCIAL],
  gerente: [NIVELES.PUBLICO, NIVELES.INTERNO],
  'usuario movil': [NIVELES.PUBLICO, NIVELES.INTERNO],
}

// "Público" -> "publico", "Confidencial" -> "confidencial". Un nivel desconocido se trata como restringido.
export function normalizarNivel(valor) {
  const n = claveComparacion(valor)
  return Object.values(NIVELES).includes(n) ? n : NIVELES.RESTRINGIDO
}

export function nivelesPermitidos(usuario) {
  let rol = claveComparacion(usuario?.rol ?? '')
  // La matriz lo llama "Gerente / Directivo"
  if (rol.startsWith('gerente')) rol = 'gerente'
  return NIVELES_POR_ROL[rol] ?? [NIVELES.PUBLICO]
}

export function puedeVer(usuario, clasificacion) {
  return nivelesPermitidos(usuario).includes(normalizarNivel(clasificacion))
}
