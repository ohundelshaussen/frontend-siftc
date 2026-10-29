import { Link } from 'react-router-dom'
import { num } from '../../utils/format'
import Variacion from '../common/Variacion'

export default function TopLista({ titulo, entidades }) {
  return (
    <section className="tarjeta">
      <h2 className="titulo-lista">{titulo}</h2>
      <ol className="lista-top">
        {(entidades || []).map((e, i) => {
          const codigo = e.codigo_entidad || e.codigo || e.id || `ent-${i}`
          const nombre = e.nombre_entidad || e.nombre || codigo
          const sector = e.sector || 'General'
          const ic = e.indice_competitividad ?? e.ic ?? 0
          const varPct = e.variacion_porcentual ?? e.variacionPct ?? e.variacion ?? 0

          return (
            <li key={`${codigo}-${i}`}>
              <Link to={`/grafica?entidad=${codigo}`} className="fila-top">
                <span className="pos">{i + 1}</span>
                <span className="fila-nombre">
                  <strong>{nombre}</strong>
                  <small>{codigo} · {sector}</small>
                </span>
                <span className="mono-num">{num(ic, 1)}</span>
                <Variacion valor={varPct} />
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
