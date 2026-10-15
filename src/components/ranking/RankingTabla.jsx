import { Link } from 'react-router-dom'
import { num } from '../../utils/format'
import Variacion from '../common/Variacion'

const COLUMNAS = [
  { campo: 'posicion', titulo: 'Pos.' },
  { campo: 'nombre_entidad', titulo: 'Entidad' },
  { campo: 'sector', titulo: 'Sector' },
  { campo: 'indice_competitividad', titulo: 'IC' },
  { campo: 'dimension_rentabilidad', titulo: 'Rentabilidad' },
  { campo: 'dimension_liquidez', titulo: 'Liquidez' },
  { campo: 'dimension_solvencia', titulo: 'Solvencia' },
  { campo: 'dimension_crecimiento', titulo: 'Crecimiento' },
  { campo: 'variacion_porcentual', titulo: 'Variación' },
]

const CAMPO_DE_DIMENSION = {
  general: 'indice_competitividad',
  rentabilidad: 'dimension_rentabilidad',
  liquidez: 'dimension_liquidez',
  solvencia: 'dimension_solvencia',
  crecimiento: 'dimension_crecimiento',
}

export default function RankingTabla({ filas, orden, dir, dimension, onOrdenar }) {
  const campoActivo = CAMPO_DE_DIMENSION[dimension]

  if (filas.length === 0) {
    return <p className="estado">No hay entidades con esos filtros.</p>
  }

  return (
    <section className="tarjeta tabla-tarjeta">
      {/* La tabla se desplaza dentro de su contenedor, sin desbordar la página. */}
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              {COLUMNAS.map((c) => {
                const activa = orden === c.campo
                return (
                  <th
                    key={c.campo}
                    scope="col"
                    aria-sort={activa ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={c.campo === campoActivo ? 'col-activa' : ''}
                  >
                    <button type="button" className="th-boton" onClick={() => onOrdenar(c.campo)}>
                      {c.titulo}
                      <span aria-hidden="true" className="flecha">{activa ? (dir === 'asc' ? '↑' : '↓') : ''}</span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.codigo_entidad}>
                <td className="mono-num">{f.posicion}</td>
                <td>
                  <Link to="/grafica" className="entidad">
                    <strong>{f.nombre_entidad}</strong>
                    <small>{f.codigo_entidad}</small>
                  </Link>
                </td>
                <td><span className="sector">{f.sector}</span></td>
                <td className={campoActivo === 'indice_competitividad' ? 'col-activa' : ''}>
                  <div className="ic">
                    <span className="mono-num">{num(f.indice_competitividad, 1)}</span>
                    <span className="barra" aria-hidden="true">
                      <span style={{ width: `${f.indice_competitividad}%` }} />
                    </span>
                  </div>
                </td>
                <td className={`mono-num ${campoActivo === 'dimension_rentabilidad' ? 'col-activa' : ''}`}>{num(f.dimension_rentabilidad, 1)}</td>
                <td className={`mono-num ${campoActivo === 'dimension_liquidez' ? 'col-activa' : ''}`}>{num(f.dimension_liquidez, 1)}</td>
                <td className={`mono-num ${campoActivo === 'dimension_solvencia' ? 'col-activa' : ''}`}>{num(f.dimension_solvencia, 1)}</td>
                <td className={`mono-num ${campoActivo === 'dimension_crecimiento' ? 'col-activa' : ''}`}>{num(f.dimension_crecimiento, 1)}</td>
                <td><Variacion valor={f.variacion_porcentual} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="texto-suave pie">Mostrando {filas.length} entidades · Datos de ejemplo · Clic en una entidad para ver su gráfica</p>
    </section>
  )
}