// Traduce lo que responde el backend (contrato "Endpoints requeridos por Frontend":
// camelCase, ic, variacionPct, nombre...) a los nombres que usan el tablero y el ticker
// (diccionario de datos: codigo_entidad, indice_competitividad, variacion_porcentual...).
// El ranking y los catálogos ya usan los nombres del contrato, por eso no pasan por aquí.
// Si Backend cambia un nombre de campo, se corrige SOLO en este archivo.

const direccion = (v) => (v > 0 ? 'UP' : v < 0 ? 'DOWN' : 'EQUAL')

export const aEntidad = (e) => {
  const codigo = e.codigo ?? e.codigo_entidad ?? ''
  const nombre = e.nombre ?? e.nombre_entidad ?? ''
  const sector = e.sector ?? 'General'
  const ic = Number(e.ic ?? e.indice_competitividad ?? 0)
  const variacion = Number(e.variacion ?? 0)
  const variacionPct = Number(e.variacionPct ?? e.variacion_porcentual ?? 0)
  const id = e.id ?? codigo

  return {
    // Estándar oficial Backend .NET / OpenAPI (EntidadDto)
    id,
    codigo,
    nombre,
    sector,
    ic,
    variacion,
    variacionPct,

    // Compatibilidad legacy Frontend
    codigo_entidad: codigo,
    nombre_entidad: nombre,
    indice_competitividad: ic,
    variacion_porcentual: variacionPct,
    direccion: direccion(variacionPct),
  }
}

export const aEntidades = (lista) => (Array.isArray(lista) ? lista.map(aEntidad) : [])

export const aRankingItem = (r, idx = 0) => {
  const posicion = Number(r.posicion ?? idx + 1)
  const cambioPosicion = Number(r.cambioPosicion ?? 0)
  const entidadId = r.entidadId ?? r.id ?? r.codigo ?? ''
  const entidad = r.entidad ?? r.nombre ?? r.nombre_entidad ?? ''
  const codigo = r.codigo ?? r.codigo_entidad ?? entidadId
  const sector = r.sector ?? 'General'
  const ic = Number(r.ic ?? r.indice_competitividad ?? 0)
  const variacionPct = Number(r.variacionPct ?? r.variacion_porcentual ?? 0)

  return {
    // Estándar oficial Backend .NET / OpenAPI (RankingItemDto)
    posicion,
    cambioPosicion,
    entidadId,
    entidad,
    sector,
    ic,
    variacionPct,

    // Compatibilidad
    id: entidadId,
    codigo,
    nombre: entidad,
    nombre_entidad: entidad,
    indice_competitividad: ic,
    variacion_porcentual: variacionPct,
  }
}

export const aRanking = (res) => {
  if (!res) return { periodo: '2026', total: 0, items: [] }
  const items = (Array.isArray(res) ? res : res.items ?? []).map(aRankingItem)
  const periodo = String(res.periodo ?? '2026')
  const total = Number(res.total ?? items.length)
  return { periodo, total, items }
}

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

// Adapta la serie histórica OHLC para Lightweight Charts
// Backend .NET / Render: { entidadId, entidad, periodo, serie: [ { fecha, apertura, maximo, minimo, cierre, volumen } ] }
// O arreglo directo: [ { fecha|time, apertura|open, maximo|high, minimo|low, cierre|close } ]
export function aSerieOhlc(respuestaApi) {
  if (!respuestaApi) return []
  const lista = Array.isArray(respuestaApi) ? respuestaApi : respuestaApi.serie ?? []
  if (!Array.isArray(lista) || lista.length === 0) return []

  const velas = lista
    .map((item) => {
      let time = item.time ?? item.fecha ?? ''
      if (typeof time === 'string') {
        time = time.slice(0, 10)
      } else if (time instanceof Date) {
        time = time.toISOString().slice(0, 10)
      }
      const open = Number(item.open ?? item.apertura ?? 0)
      const close = Number(item.close ?? item.cierre ?? open)
      const high = Number(item.high ?? item.maximo ?? Math.max(open, close))
      const low = Number(item.low ?? item.minimo ?? Math.min(open, close))

      return {
        time,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
      }
    })
    .filter((v) => v.time && !Number.isNaN(v.open) && !Number.isNaN(v.close) && v.open > 0)

  // Lightweight Charts requiere estrictamente orden ascendente por time sin duplicados
  velas.sort((a, b) => a.time.localeCompare(b.time))
  const mapaUnicos = new Map()
  for (const v of velas) {
    mapaUnicos.set(v.time, v)
  }
  return Array.from(mapaUnicos.values())
}

// Normaliza la respuesta de autenticación del Backend .NET (AuthResponseDto) o del Mock
// Render / .NET: { token, expiraEn, usuario: { id, nombre, rol } }
// AuthResponseDto plano: { idUsuario, email, nombreCompleto, rol, token }
export function aSesion(respuestaApi) {
  if (!respuestaApi) return null

  // Si ya viene empaquetado en formato { token, usuario } (Render y Mock previo)
  if (respuestaApi.usuario && respuestaApi.token) {
    const u = respuestaApi.usuario
    const nombreCompleto = u.nombreCompleto ?? u.nombre ?? u.usuario ?? ''
    const email = u.email ?? (u.usuario ? (u.usuario.includes('@') ? u.usuario : `${u.usuario}@siftc.edu.co`) : (nombreCompleto ? `${nombreCompleto.toLowerCase().replace(/\s+/g, '.')}@siftc.edu.co` : ''))
    return {
      token: respuestaApi.token,
      usuario: {
        idUsuario: u.idUsuario ?? u.id ?? null,
        email,
        nombreCompleto,
        nombre: nombreCompleto,
        rol: u.rol ?? 'Analista financiero',
      },
    }
  }

  // Formato oficial .NET plano: AuthResponseDto
  const nombreCompleto = respuestaApi.nombreCompleto ?? respuestaApi.email?.split('@')[0] ?? respuestaApi.nombre ?? ''
  return {
    token: respuestaApi.token,
    usuario: {
      idUsuario: respuestaApi.idUsuario ?? respuestaApi.id,
      email: respuestaApi.email ?? '',
      nombreCompleto,
      nombre: nombreCompleto,
      rol: respuestaApi.rol ?? 'Analista financiero',
    },
  }
}
