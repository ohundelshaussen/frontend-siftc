import { entidades } from './marketMocks'

// Catálogos (en la API real vienen de /dimensiones y /periodos).
export const catalogoDimensiones = [
  { id: 'general', nombre: 'IC general' },
  { id: 'rentabilidad', nombre: 'Rentabilidad' },
  { id: 'liquidez', nombre: 'Liquidez' },
  { id: 'solvencia', nombre: 'Solvencia' },
  { id: 'crecimiento', nombre: 'Crecimiento' },
]

export const catalogoPeriodos = [
  { id: '2026-09', nombre: 'Septiembre 2026' },
  { id: '2026-08', nombre: 'Agosto 2026' },
  { id: '2026-07', nombre: 'Julio 2026' },
]

const CAMPO_DIMENSION = {
  general: 'indice_competitividad',
  rentabilidad: 'dimension_rentabilidad',
  liquidez: 'dimension_liquidez',
  solvencia: 'dimension_solvencia',
  crecimiento: 'dimension_crecimiento',
}

const ORDENABLES = [
  'posicion', 'nombre_entidad', 'sector', 'indice_competitividad', 'dimension_rentabilidad',
  'dimension_liquidez', 'dimension_solvencia', 'dimension_crecimiento', 'variacion_porcentual',
]

const limitar = (n) => Math.round(Math.min(99, Math.max(1, n)) * 10) / 10
const ajuste = (i, k) => (((i * 7 + k * 3) % 9) - 4) * 1.2

function filasDelPeriodo(indicePeriodo, periodo) {
  return entidades.map((e, i) => {
    const mover = indicePeriodo * (((i * 5) % 7) - 3) * 0.5
    const ic = limitar(e.indice_competitividad + mover)
    return {
      codigo_entidad: e.codigo_entidad,
      nombre_entidad: e.nombre_entidad,
      sector: e.sector,
      periodo,
      indice_competitividad: ic,
      variacion_porcentual: e.variacion_porcentual,
      dimension_rentabilidad: limitar(ic + ajuste(i, 1)),
      dimension_liquidez: limitar(ic + ajuste(i, 2)),
      dimension_solvencia: limitar(ic + ajuste(i, 3)),
      dimension_crecimiento: limitar(ic + ajuste(i, 4)),
    }
  })
}

// Simula GET /ranking?sector&dimension&periodo&orden&dir
export function consultarRanking({ sector, dimension = 'general', periodo, orden = 'posicion', dir = 'asc' } = {}) {
  const indice = Math.max(0, catalogoPeriodos.findIndex((p) => p.id === periodo))
  const campoDim = CAMPO_DIMENSION[dimension] ?? CAMPO_DIMENSION.general

  const lista = filasDelPeriodo(indice, catalogoPeriodos[indice].id)
    .filter((f) => !sector || f.sector === sector)
    .sort((a, b) => b[campoDim] - a[campoDim])
    .map((f, i) => ({ ...f, posicion: i + 1 }))

  const campo = ORDENABLES.includes(orden) ? orden : 'posicion'
  const signo = dir === 'desc' ? -1 : 1
  return lista.sort((a, b) => {
    const x = a[campo]
    const y = b[campo]
    return (typeof x === 'string' ? x.localeCompare(y, 'es') : x - y) * signo
  })
}