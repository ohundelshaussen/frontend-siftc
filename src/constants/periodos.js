// Periodos que ACEPTA el servidor, verificado contra la API el 2026-11-01.
// GET /entidades/{id}/ohlc?periodo=... responde 400 con cualquier otro valor:
//   "El parámetro periodo admite: Diaria, Mensual o Trimestral."
// (Nota: el equipo de Backend mencionó diario/quincenal/mensual/semestral/anual,
//  pero el servidor desplegado sólo admite estos tres. Confirmar con ellos.)
//
// 'id' es lo que viaja en ?periodo=, 'nombre' es lo que se muestra en pantalla.
// Si Backend amplía la lista, se corrige SOLO en este archivo.

export const PERIODOS = [
  { id: 'Diaria', nombre: 'Diaria' },
  { id: 'Mensual', nombre: 'Mensual' },
  { id: 'Trimestral', nombre: 'Trimestral' },
]

export const PERIODO_POR_DEFECTO = 'Mensual'

export const nombrePeriodo = (id) => PERIODOS.find((p) => p.id === id)?.nombre ?? id
