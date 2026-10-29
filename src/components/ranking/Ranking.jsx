import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getRanking, getSectores, getDimensiones, getPeriodos } from '../../services/api'
import { claveComparacion } from '../../utils/texto'
import RankingTabla from './RankingTabla'
import './Ranking.css'

// HU-FE-04 filtros del ranking

const POR_DEFECTO = { sector: '', dimension: '', periodo: 'mensual', orden: 'ic', dir: 'desc' }
const ORDENABLES = ['posicion', 'entidad', 'sector', 'ic', 'variacionPct']
const ASC_PRIMERO = ['posicion', 'entidad', 'sector']

function leerFiltros(params) {
  const orden = params.get('orden')
  const dir = params.get('dir')
  return {
    sector: params.get('sector') ?? POR_DEFECTO.sector,
    dimension: params.get('dimension') ?? POR_DEFECTO.dimension,
    periodo: params.get('periodo') || POR_DEFECTO.periodo,
    orden: ORDENABLES.includes(orden) ? orden : POR_DEFECTO.orden,
    dir: dir === 'asc' || dir === 'desc' ? dir : POR_DEFECTO.dir,
  }
}

// Ordenamiento robusto en memoria para garantizar respuesta inmediata (0 ms)
function ordenar(items, orden, dir) {
  const signo = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const x = a?.[orden]
    const y = b?.[orden]
    if (x === y) return 0
    if (x === null || x === undefined) return 1
    if (y === null || y === undefined) return -1
    if (typeof x === 'string' || typeof y === 'string') {
      return String(x).localeCompare(String(y), 'es', { sensitivity: 'base' }) * signo
    }
    const numX = Number(x)
    const numY = Number(y)
    if (!Number.isNaN(numX) && !Number.isNaN(numY)) {
      return (numX - numY) * signo
    }
    return 0
  })
}

export default function Ranking() {
  const [params, setSearchParams] = useSearchParams()
  const filtros = leerFiltros(params)
  const { sector, dimension, periodo, orden, dir } = filtros

  const [catalogos, setCatalogos] = useState({ sectores: [], dimensiones: [], periodos: [] })
  const [resultado, setResultado] = useState({ clave: null, datos: null })
  const [error, setError] = useState(false)
  const clave = JSON.stringify([sector, dimension, periodo, orden, dir])
  const datos = resultado.datos
  const cargando = resultado.clave !== clave

  useEffect(() => {
    Promise.all([getSectores(), getDimensiones(), getPeriodos()])
      .then(([sectores, dimensiones, periodos]) => setCatalogos({ sectores, dimensiones, periodos }))
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    let vigente = true
    const pedido = Object.fromEntries(
      Object.entries({ sector, dimension, periodo, orden, dir }).filter(([, v]) => v),
    )
    getRanking(pedido)
      .then((respuesta) => {
        if (!vigente) return
        setResultado({ clave, datos: respuesta })
        setError(false)
      })
      .catch(() => {
        if (vigente) setError(true)
      })
    return () => {
      vigente = false
    }
  }, [clave, sector, dimension, periodo, orden, dir])

  const filas = useMemo(() => (datos ? ordenar(datos.items ?? [], orden, dir) : null), [datos, orden, dir])

  // Normalización tolerante a acentos y mayúsculas para que el select nunca pierda su opción seleccionada
  const sectorActivo = useMemo(() => {
    if (!sector) return ''
    const match = catalogos.sectores.find(
      (s) => claveComparacion(s.nombre) === claveComparacion(sector) || String(s.id) === String(sector),
    )
    return match ? match.nombre : sector
  }, [sector, catalogos.sectores])

  const dimensionActiva = useMemo(() => {
    if (!dimension) return ''
    const match = catalogos.dimensiones.find(
      (d) => claveComparacion(d.nombre) === claveComparacion(dimension) || String(d.id) === String(dimension),
    )
    return match ? match.nombre : dimension
  }, [dimension, catalogos.dimensiones])

  const periodoActivo = useMemo(() => {
    if (!periodo) return 'mensual'
    const match = catalogos.periodos.find(
      (p) => claveComparacion(p.id) === claveComparacion(periodo) || claveComparacion(p.nombre) === claveComparacion(periodo),
    )
    return match ? match.id : periodo.toLowerCase()
  }, [periodo, catalogos.periodos])

  // Los filtros se guardan en la URL de forma inmutable
  const cambiar = (cambios) => {
    const siguiente = { ...filtros, ...cambios }
    const limpio = {}
    Object.entries(siguiente).forEach(([k, valor]) => {
      if (valor && valor !== POR_DEFECTO[k]) limpio[k] = valor
    })
    setSearchParams(limpio)
  }

  const ordenarPor = (campo) => {
    if (orden === campo) cambiar({ dir: dir === 'asc' ? 'desc' : 'asc' })
    else cambiar({ orden: campo, dir: ASC_PRIMERO.includes(campo) ? 'asc' : 'desc' })
  }

  const hayFiltros = params.toString() !== ''
  const nombrePeriodo = catalogos.periodos.find((p) => p.id === periodoActivo)?.nombre ?? periodoActivo

  return (
    <div className="ranking">
      <header>
        <h1 className="titulo-pagina">Ranking de competitividad</h1>
        <p className="texto-suave">
          Entidades ordenadas por Índice de Competitividad (IC). Haz clic en el título de una columna para ordenar.
        </p>
      </header>

      <section className="tarjeta filtros" aria-label="Filtros del ranking">
        <div className="filtros-fila">
          <label className="campo">
            <span>Sector</span>
            <select value={sectorActivo} onChange={(e) => cambiar({ sector: e.target.value })}>
              <option value="">Todos los sectores</option>
              {catalogos.sectores.map((s) => (
                <option key={s.id} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Dimensión</span>
            <select value={dimensionActiva} onChange={(e) => cambiar({ dimension: e.target.value })}>
              <option value="">IC general</option>
              {catalogos.dimensiones.map((d) => (
                <option key={d.id} value={d.nombre}>{d.nombre}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Periodo</span>
            <select value={periodoActivo} onChange={(e) => cambiar({ periodo: e.target.value })}>
              {catalogos.periodos.length === 0 && <option value={periodoActivo}>{nombrePeriodo}</option>}
              {catalogos.periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>

          <button type="button" className="boton-limpiar" onClick={() => setSearchParams({})} disabled={!hayFiltros}>
            Limpiar filtros
          </button>
        </div>
        <p className="texto-suave nota-url">
          Los filtros quedan guardados en la dirección: si recargas o compartes el enlace, se conservan.
        </p>
      </section>

      {error && !filas && (
        <p role="alert" className="estado estado-error">No se pudo cargar el ranking. Intenta de nuevo.</p>
      )}
      {!filas && !error && <p className="estado" aria-live="polite">Cargando ranking…</p>}
      {filas && (
        <RankingTabla
          filas={filas}
          total={datos?.total ?? filas.length}
          orden={orden}
          dir={dir}
          dimension={dimensionActiva}
          periodo={nombrePeriodo}
          cargando={cargando}
          onOrdenar={ordenarPor}
        />
      )}
    </div>
  )
}
