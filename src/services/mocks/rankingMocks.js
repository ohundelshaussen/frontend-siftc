import { entidades } from './marketMocks'
import { claveComparacion } from '../../utils/texto'

// Catálogos oficiales alineados con el Backend

// GET /sectores
export const catalogoSectores = [...new Set(entidades.map((e) => e.sector))]
  .sort((a, b) => a.localeCompare(b, 'es'))
  .map((nombre, i) => ({ id: i + 1, nombre }))

// GET /dimensiones
export const catalogoDimensiones = [
  { id: 1, nombre: 'Rentabilidad' },
  { id: 2, nombre: 'Liquidez' },
  { id: 3, nombre: 'Solvencia' },
  { id: 4, nombre: 'Crecimiento' },
]

// GET /periodos: El único filtro temporal válido del sistema es el reporte financiero por AÑO
export const catalogoPeriodos = [
  { id: '2026', nombre: '2026' },
  { id: '2025', nombre: '2025' },
  { id: '2024', nombre: '2024' },
  { id: '2023', nombre: '2023' },
  { id: '2022', nombre: '2022' },
]

const ORDENABLES = ['posicion', 'entidad', 'sector', 'ic', 'variacionPct']
const TEXTO = ['entidad', 'sector']

const limitar = (n) => Math.round(Math.min(99.5, Math.max(1, n)) * 10) / 10
const ajuste = (i, k) => (((i * 7 + k * 3) % 9) - 4) * 1.6

function puntaje(e, i, dimension, periodo) {
  const anio = parseInt(periodo, 10) || 2026
  const difAnios = 2026 - anio
  const k = Math.max(0, catalogoDimensiones.findIndex((d) => claveComparacion(d.nombre) === claveComparacion(dimension)) + 1)
  const variacionHistorica = (((i * 4 + difAnios * 3) % 7) - 3) * 1.5
  const base = e.indice_competitividad - difAnios * 1.8 + variacionHistorica
  return limitar(k ? base + ajuste(i, k) : base)
}

// Simula GET /ranking estandarizado estrictamente con RankingResponseDto y RankingItemDto del Backend
export function consultarRanking({ sector = '', dimension = '', periodo = '2026', orden = 'ic', dir = 'desc' } = {}) {
  const anioActual = String(periodo || '2026')
  const anioNum = parseInt(anioActual, 10) || 2026
  const anioPrevio = String(anioNum - 1)

  const filtradas = entidades
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => !sector || claveComparacion(e.sector) === claveComparacion(sector))

  const anterior = [...filtradas]
    .sort((a, b) => puntaje(b.e, b.i, dimension, anioPrevio) - puntaje(a.e, a.i, dimension, anioPrevio))
    .map(({ e }) => e.codigo_entidad)

  const items = filtradas
    .map(({ e, i }) => {
      const icActual = puntaje(e, i, dimension, anioActual)
      const icPrevio = puntaje(e, i, dimension, anioPrevio)
      const variacionPct = Math.round(((icActual - icPrevio) / (icPrevio || 1)) * 1000) / 10

      return {
        entidadId: e.codigo_entidad,
        codigo: e.codigo_entidad,
        entidad: e.nombre_entidad,
        nombre: e.nombre_entidad,
        sector: e.sector,
        ic: icActual,
        variacionPct: variacionPct || e.variacion_porcentual,
        _codigo: e.codigo_entidad,
      }
    })
    .sort((a, b) => b.ic - a.ic)
    .map(({ _codigo, ...item }, idx) => ({
      posicion: idx + 1,
      cambioPosicion: anterior.indexOf(_codigo) >= 0 ? anterior.indexOf(_codigo) - idx : 0,
      ...item,
    }))

  const campo = ORDENABLES.includes(orden) ? orden : 'ic'
  const signo = dir === 'asc' ? 1 : -1
  items.sort((a, b) => {
    const x = a[campo]
    const y = b[campo]
    return (TEXTO.includes(campo) ? String(x).localeCompare(String(y), 'es') : (Number(x) - Number(y))) * signo
  })

  return { periodo: anioActual, total: items.length, items }
}
