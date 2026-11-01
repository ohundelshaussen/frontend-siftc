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
  indice_competitividad: e.ic ?? 0,
  variacion: e.variacion ?? 0,
  variacion_porcentual: e.variacionPct ?? 0,
  direccion: direccion(e.variacionPct ?? 0),
})

export const aEntidades = (lista) => lista.map(aEntidad)

// /mercado/top no trae código ni sector: se completan con la lista de entidades (por id).
export function aTop(top, entidades) {
  const porId = new Map(entidades.map((e) => [e.id, e]))
  const completar = (t) => {
    const base = porId.get(t.id)
    const varPct = t.variacionPct ?? 0
    return {
      id: t.id,
      codigo_entidad: base?.codigo_entidad ?? '',
      nombre_entidad: t.nombre ?? base?.nombre_entidad,
      sector: base?.sector ?? '',
      indice_competitividad: t.ic ?? 0,
      variacion: t.variacion ?? 0,
      variacion_porcentual: varPct,
      direccion: direccion(varPct),
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

// Normaliza la respuesta de autenticación del Backend .NET (AuthResponseDto) o del Mock
// AuthResponseDto plano: { idUsuario, email, nombreCompleto, rol, token }
export function aSesion(respuestaApi) {
  if (!respuestaApi) return null

  // Si ya viene empaquetado en formato { token, usuario } (compatibilidad Mock previo)
  if (respuestaApi.usuario && respuestaApi.token) {
    const u = respuestaApi.usuario
    return {
      token: respuestaApi.token,
      usuario: {
        idUsuario: u.idUsuario ?? u.id ?? null,
        email: u.email ?? u.usuario ?? '',
        nombreCompleto: u.nombreCompleto ?? u.nombre ?? u.usuario ?? '',
        nombre: u.nombre ?? u.nombreCompleto ?? u.usuario ?? '',
        rol: u.rol ?? 'Analista financiero',
      },
    }
  }

  // Formato oficial .NET: AuthResponseDto
  const nombreCompleto = respuestaApi.nombreCompleto ?? respuestaApi.email?.split('@')[0] ?? ''
  return {
    token: respuestaApi.token,
    usuario: {
      idUsuario: respuestaApi.idUsuario,
      email: respuestaApi.email,
      nombreCompleto,
      nombre: nombreCompleto,
      rol: respuestaApi.rol ?? 'Analista financiero',
    },
  }
}

// --- Serie OHLC ---------------------------------------------------------------
// GET /entidades/{id}/ohlc NO devuelve un array: devuelve un objeto
// { entidadId, entidad, periodo, <serie> } donde la serie es una propiedad interna.
// lightweight-charts necesita [{ time, open, high, low, close }, ...], así que aquí
// se localiza el array y se traducen los nombres de campo vengan en español o inglés.

const PRIMER_VALOR = (obj, claves) => {
  for (const k of claves) {
    if (obj?.[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return undefined
}

// 'time' debe ser 'YYYY-MM-DD' o un epoch en segundos
function aTiempo(valor) {
  if (typeof valor === 'number') return valor
  const texto = String(valor ?? '')
  const soloFecha = texto.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(soloFecha) ? soloFecha : texto
}

const aNumero = (v) => (v === null || v === undefined || v === '' ? undefined : Number(v))

export function aSerieOhlc(respuesta) {
  if (Array.isArray(respuesta)) return normalizarVelas(respuesta)
  if (!respuesta || typeof respuesta !== 'object') return []

  // La serie es la primera propiedad que sea un array de objetos
  const serie = Object.values(respuesta).find(
    (v) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object',
  )
  if (!serie) {
    console.warn('[OHLC] La respuesta no trae ninguna serie de velas:', Object.keys(respuesta))
    return []
  }
  return normalizarVelas(serie)
}

function normalizarVelas(serie) {
  return serie
    .map((v) => ({
      time: aTiempo(PRIMER_VALOR(v, ['time', 'fecha', 'date', 'periodo'])),
      open: aNumero(PRIMER_VALOR(v, ['open', 'apertura'])),
      high: aNumero(PRIMER_VALOR(v, ['high', 'maximo', 'máximo'])),
      low: aNumero(PRIMER_VALOR(v, ['low', 'minimo', 'mínimo'])),
      close: aNumero(PRIMER_VALOR(v, ['close', 'cierre', 'valor'])),
    }))
    .filter((v) => v.time && Number.isFinite(v.close))
    .sort((a, b) => String(a.time).localeCompare(String(b.time)))
}
