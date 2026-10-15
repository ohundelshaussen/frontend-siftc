import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getRanking, getSectores, getDimensiones, getPeriodos } from '../../services/api'
import RankingTabla from './RankingTabla'
import './Ranking.css'

const POR_DEFECTO = { sector: '', dimension: 'general', periodo: '2026-09', orden: 'posicion', dir: 'asc' }
const COLUMNAS_TEXTO = ['nombre_entidad', 'sector', 'posicion']

export default function Ranking() {
  // Los filtros viven en la URL: al recargar o compartir el enlace se conservan.
  const [params, setParams] = useSearchParams()
  const filtros = {
    sector: params.get('sector') ?? POR_DEFECTO.sector,
    dimension: params.get('dimension') ?? POR_DEFECTO.dimension,
    periodo: params.get('periodo') ?? POR_DEFECTO.periodo,
    orden: params.get('orden') ?? POR_DEFECTO.orden,
    dir: params.get('dir') ?? POR_DEFECTO.dir,
  }

  const [catalogos, setCatalogos] = useState({ sectores: [], dimensiones: [], periodos: [] })
  const [filas, setFilas] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([getSectores(), getDimensiones(), getPeriodos()])
      .then(([sectores, dimensiones, periodos]) => setCatalogos({ sectores, dimensiones, periodos }))
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    let vigente = true
    const pedido = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v))
    getRanking(pedido)
      .then((datos) => {
        if (vigente) {
          setFilas(datos)
          setError(false)
        }
      })
      .catch(() => vigente && setError(true))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.sector, filtros.dimension, filtros.periodo, filtros.orden, filtros.dir])

  const cambiar = (cambios) => {
    const siguiente = { ...filtros, ...cambios }
    const limpio = {}
    Object.entries(siguiente).forEach(([clave, valor]) => {
      if (valor && valor !== POR_DEFECTO[clave]) limpio[clave] = valor
    })
    setSearchParams(limpio)
  }

  const ordenarPor = (campo) => {
    if (filtros.orden === campo) {
      cambiar({ dir: filtros.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      cambiar({ orden: campo, dir: COLUMNAS_TEXTO.includes(campo) ? 'asc' : 'desc' })
    }
  }

  const consulta = params.toString()

  return (
    <div className="ranking">
      <header>
        <h1 className="titulo-pagina">Ranking de competitividad</h1>
        <p className="texto-suave">Entidades ordenadas por Índice de Competitividad (IC). Haz clic en el título de una columna para ordenar.</p>
      </header>

      <section className="tarjeta filtros" aria-label="Filtros del ranking">
        <div className="filtros-fila">
          <label className="campo">
            <span>Sector</span>
            <select value={filtros.sector} onChange={(e) => cambiar({ sector: e.target.value })}>
              <option value="">Todos los sectores</option>
              {catalogos.sectores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Dimensión</span>
            <select value={filtros.dimension} onChange={(e) => cambiar({ dimension: e.target.value, orden: 'posicion', dir: 'asc' })}>
              {catalogos.dimensiones.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Periodo</span>
            <select value={filtros.periodo} onChange={(e) => cambiar({ periodo: e.target.value })}>
              {catalogos.periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>

          <button type="button" className="boton-limpiar" onClick={() => setSearchParams({})}>
            Limpiar filtros
          </button>
        </div>
        <p className="texto-suave">
          Los filtros quedan en la dirección, así se conservan al recargar o compartir:{' '}
          <code className="url">/ranking{consulta ? `?${consulta}` : ''}</code>
        </p>
      </section>

      {error && <p role="alert" className="estado">No se pudo cargar el ranking. Intenta de nuevo.</p>}
      {!error && !filas && <p className="estado" aria-live="polite">Cargando ranking…</p>}
      {!error && filas && (
        <RankingTabla filas={filas} orden={filtros.orden} dir={filtros.dir} dimension={filtros.dimension} onOrdenar={ordenarPor} />
      )}
    </div>
  )
}