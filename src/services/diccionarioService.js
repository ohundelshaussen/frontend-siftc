// HU-DD-08 Diccionario en el portal
// Servicio unico del diccionario y glosario. Las pantallas nunca leen el CSV ni la API directo.
//
// De donde salen los datos:
// - Del endpoint de busqueda de Backend: GET /api/v1/diccionario?q=texto (filtra por rol en el servidor).
// - Si Backend aun no lo publica (404) o no responde, del CSV oficial de Frell
//   (src/data/diccionario_glosario_busqueda.csv). Para actualizarlo se reemplaza ese archivo.
// En los dos casos se vuelve a filtrar por rol aqui (CA 3), por si algo llega de mas.

import { http } from './api'
import { ENDPOINTS } from './endpoints'
import { claveComparacion } from '../utils/texto'
import { puedeVer, normalizarNivel } from '../constants/permisosDiccionario'

// 'backend' cuando respondio el endpoint; 'csv' cuando se uso el archivo de Frell
let origen = 'backend'
// Si el endpoint respondio 404 una vez, no se vuelve a pedir hasta recargar la pagina
let endpointPendiente = false

export const origenDatos = () => origen

export const TIPOS = Object.freeze(['Métrica', 'Término', 'Dato'])
const ORDEN_TIPO = { metrica: 0, termino: 1, dato: 2 }

// ---------------------------------------------------------------- Lectura del CSV

// Lee un CSV separado por punto y coma, con campos entre comillas y "" como comilla escapada
export function leerCsv(texto) {
  const filas = []
  let fila = []
  let campo = ''
  let entreComillas = false
  const t = texto.replace(/^\uFEFF/, '')

  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (entreComillas) {
      if (c === '"' && t[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') entreComillas = false
      else campo += c
    } else if (c === '"') entreComillas = true
    else if (c === ';') { fila.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      fila.push(campo); campo = ''
      if (fila.some((v) => v.trim() !== '')) filas.push(fila)
      fila = []
    } else campo += c
  }
  fila.push(campo)
  if (fila.some((v) => v.trim() !== '')) filas.push(fila)

  const [cabecera, ...resto] = filas
  return resto.map((valores) => Object.fromEntries(cabecera.map((col, k) => [col.trim(), (valores[k] ?? '').trim()])))
}

// Separa "a, b, c" en una lista limpia
const lista = (texto) => String(texto ?? '').split(',').map((s) => s.trim()).filter(Boolean)

// Deja cada termino con la misma forma, venga del CSV (snake_case) o de la API (camelCase)
export function aTermino(o) {
  const v = (snake, camel) => o[snake] ?? o[camel] ?? ''
  const t = {
    id: v('id', 'id'),
    tipo: v('tipo', 'tipo'),
    codigo: v('codigo', 'codigo'),
    nombre: v('nombre', 'nombre'),
    nombreTecnico: v('nombre_tecnico', 'nombreTecnico'),
    descripcion: v('descripcion', 'descripcion'),
    sinonimos: Array.isArray(o.sinonimos) ? o.sinonimos : lista(o.sinonimos),
    formula: v('formula', 'formula'),
    variables: v('variables', 'variables'),
    unidad: v('unidad', 'unidad'),
    frecuencia: v('frecuencia', 'frecuencia'),
    umbrales: v('umbrales', 'umbrales'),
    ejemplo: v('ejemplo', 'ejemplo'),
    relacionados: Array.isArray(o.terminosRelacionados) ? o.terminosRelacionados : lista(o.terminos_relacionados),
    clasificacion: v('clasificacion', 'clasificacion'),
    equipoDueno: v('equipo_dueno', 'equipoDueno'),
    usadoEn: v('usado_en', 'usadoEn'),
    estado: v('estado', 'estado'),
  }
  t.nivel = normalizarNivel(t.clasificacion)
  // Claves de busqueda ya normalizadas (sin tildes ni mayusculas) para que buscar sea instantaneo
  t._clave = {
    id: compacto(t.id),
    codigo: compacto(t.codigo),
    nombre: claveComparacion(t.nombre),
    tecnico: claveComparacion(t.nombreTecnico),
    tecnicoEspacios: claveComparacion(t.nombreTecnico.replace(/_/g, ' ')),
    sinonimos: t.sinonimos.map(claveComparacion),
  }
  t._clave.todo = [t._clave.nombre, t._clave.tecnicoEspacios, ...t._clave.sinonimos, claveComparacion(t.codigo), claveComparacion(t.id)].join(' ')
  return t
}

// "RNT-01", "rnt 01" y "rnt01" quedan iguales
const compacto = (texto) => claveComparacion(texto).replace(/[^a-z0-9]/g, '')

// ---------------------------------------------------------------- Carga con cache

let cacheCsv = null

async function cargarCsv() {
  if (!cacheCsv) {
    // El CSV se descarga solo cuando alguien abre el diccionario (no pesa en el tablero)
    cacheCsv = import('../data/diccionario_glosario_busqueda.csv?raw').then((m) => leerCsv(m.default).map(aTermino))
  }
  return cacheCsv
}

// ---------------------------------------------------------------- Busqueda (CA 1)

// Puntaje de coincidencia: mas alto = mas arriba en la lista. 0 = no coincide
export function puntaje(t, consulta) {
  const q = claveComparacion(consulta)
  if (!q) return 1
  const qc = compacto(consulta)
  const k = t._clave

  if (qc && (k.codigo === qc || k.id === qc)) return 100
  if (k.nombre === q) return 95
  if (k.sinonimos.includes(q)) return 90
  if (k.tecnico === q || k.tecnicoEspacios === q) return 88
  // Siglas entre parentesis o antes del parentesis: "ROE (rentabilidad...)" o "IC (Indice...)"
  if (k.nombre.split(' (')[0] === q || k.nombre.match(/\(([^)]+)\)/)?.[1] === q) return 85
  if (k.nombre.startsWith(q)) return 80
  if (k.sinonimos.some((s) => s.startsWith(q))) return 70
  if (k.tecnico.startsWith(q) || k.tecnicoEspacios.startsWith(q)) return 68
  if (new RegExp(`(^|[\\s(/])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(k.nombre)) return 60
  if (k.nombre.includes(q)) return 50
  if (k.sinonimos.some((s) => s.includes(q))) return 45
  if (k.tecnico.includes(q) || k.tecnicoEspacios.includes(q)) return 40
  // Varias palabras: todas deben estar en nombre, sinonimos, nombre tecnico o codigo
  const palabras = q.split(/\s+/).filter((p) => p.length > 1)
  if (palabras.length > 1 && palabras.every((p) => k.todo.includes(p))) return 20
  return 0
}

const ordenBase = (a, b) =>
  (ORDEN_TIPO[claveComparacion(a.tipo)] ?? 9) - (ORDEN_TIPO[claveComparacion(b.tipo)] ?? 9) ||
  a.id.localeCompare(b.id, 'es', { numeric: true })

/**
 * Busca terminos por nombre, codigo, nombre tecnico o sinonimo, sin importar mayusculas ni tildes.
 * Devuelve solo lo que el rol del usuario puede ver.
 */
// Pide al endpoint de Backend: GET /api/v1/diccionario?q=texto
async function pedirAlBackend(q) {
  const { data } = await http.get(ENDPOINTS.diccionario, { params: { q: q.trim() } })
  return (Array.isArray(data) ? data : data?.items ?? []).map(aTermino)
}

// El endpoint aun no existe (404/501) o el servidor no contesto: se usa el CSV
const debeUsarCsv = (err) => !err?.response || [404, 405, 501].includes(err.response.status)

export async function buscarTerminos({ q = '', tipo = '', usuario }) {
  let terminos
  if (ENDPOINTS.diccionario && !endpointPendiente) {
    try {
      terminos = await pedirAlBackend(q)
      origen = 'backend'
    } catch (err) {
      if (!debeUsarCsv(err)) throw err
      if (err?.response) endpointPendiente = true
      terminos = await cargarCsv()
      origen = 'csv'
    }
  } else {
    terminos = await cargarCsv()
    origen = 'csv'
  }

  const tipoClave = claveComparacion(tipo)
  // Con 1 o 2 letras ("ic") solo cuenta si coincide al inicio de una palabra, para no llenar la lista
  const minimo = claveComparacion(q).length > 0 && claveComparacion(q).length <= 2 ? 60 : 1
  return terminos
    .filter((t) => puedeVer(usuario, t.clasificacion))
    .filter((t) => !tipoClave || claveComparacion(t.tipo) === tipoClave)
    .map((t) => ({ t, p: puntaje(t, q) }))
    .filter(({ p }) => p >= minimo)
    .sort((a, b) => b.p - a.p || ordenBase(a.t, b.t))
    .map(({ t }) => t)
}

/**
 * Busca un termino exacto por id (MET-01) o por codigo de metrica (RNT-01).
 * Usa el mismo endpoint de busqueda (?q=RNT-01) y toma la coincidencia exacta.
 * Si el rol no lo puede ver, responde null como si no existiera (CA 3).
 */
export async function obtenerTermino(ref, usuario) {
  const buscado = compacto(ref)
  if (!buscado) return null
  const encontrados = await buscarTerminos({ q: ref, usuario })
  return encontrados.find((x) => x._clave.id === buscado || x._clave.codigo === buscado) ?? null
}

/**
 * Convierte un texto de "terminos relacionados" (ej. "Utilidad neta", "IC") en su termino.
 * Solo acepta coincidencias fuertes; si no hay, devuelve null y la pantalla hace una busqueda normal.
 */
export async function resolverRelacionado(texto, usuario) {
  const encontrados = await buscarTerminos({ q: texto, usuario })
  const mejor = encontrados[0]
  return mejor && puntaje(mejor, texto) >= 80 ? mejor : null
}

// "Verde: >= 10 % | Amarillo: ... | Rojo: ..." -> [{ color: 'verde', texto: '>= 10 %' }, ...]
export function partirUmbrales(texto) {
  return String(texto ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^(verde|amarillo|rojo)\s*:\s*(.*)$/i)
      return m ? { color: m[1].toLowerCase(), texto: m[2] } : { color: 'nota', texto: s.replace(/^\(|\)$/g, '') }
    })
}
