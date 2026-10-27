// Traduce lo que responde el backend (contrato "Endpoints requeridos por Frontend":
// camelCase, ic, variacionPct, nombre...) a los nombres que usan el tablero y el ticker
// (diccionario de datos: codigo_entidad, indice_competitividad, variacion_porcentual...).
// El ranking y los catálogos ya usan los nombres del contrato, por eso no pasan por aquí.
// Si Backend cambia un nombre de campo, se corrige SOLO en este archivo.

const direccion = (v) => (v > 0 ? 'UP' : v < 0 ? 'DOWN' : 'EQUAL')

export const aEntidad = (e) => ({
  id: e.id,
  codigo_entidad: e.codigo,
  nombre_entidad: e.nombre,
  sector: e.sector,
  indice_competitividad: e.ic,
  variacion: e.variacion,
  variacion_porcentual: e.variacionPct,
  direccion: direccion(e.variacionPct),
})

export const aEntidades = (lista) => lista.map(aEntidad)

// /mercado/top no trae código ni sector: se completan con la lista de entidades (por id).
export function aTop(top, entidades) {
  const porId = new Map(entidades.map((e) => [e.id, e]))
  const completar = (t) => {
    const base = porId.get(t.id)
    return {
      id: t.id,
      codigo_entidad: base?.codigo_entidad ?? '',
      nombre_entidad: t.nombre ?? base?.nombre_entidad,
      sector: base?.sector ?? '',
      indice_competitividad: t.ic,
      variacion: t.variacion,
      variacion_porcentual: t.variacionPct,
      direccion: direccion(t.variacionPct),
    }
  }
  return { fecha: top.fecha, ganadores: top.ganadores.map(completar), perdedores: top.perdedores.map(completar) }
}

// /indice-general solo trae valor y variación; apertura, máximo, mínimo, cierre y serie son opcionales.
export const aIndiceGeneral = (i) => ({
  fecha: i.fecha,
  valor: i.valor,
  variacion: i.variacionPct,
  puntos: i.variacion,
  apertura: i.apertura,
  maximo: i.maximo,
  minimo: i.minimo,
  cierre: i.cierre,
  serie: i.serie,
})
