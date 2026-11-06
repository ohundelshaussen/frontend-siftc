import { PlugZap } from 'lucide-react'

// Aviso cuando el backend aun no publica una ruta que esta pantalla necesita.
// No se muestran datos inventados: se dice exactamente que ruta falta (HU-BE-02 / HU-BE-09).
export default function RutaPendiente({ texto, rutas = [] }) {
  return (
    <div className="adm-pendiente" role="status">
      <span className="adm-pendiente-icono" aria-hidden="true"><PlugZap size={22} /></span>
      <div>
        <strong>Pendiente del backend</strong>
        <p>{texto}</p>
        <ul>
          {rutas.map((r) => <li key={r}><code>{r}</code></li>)}
        </ul>
        <p className="adm-pendiente-nota">
          Cuando estén publicadas, se escriben en <code>src/services/endpoints.js</code> y esta sección queda conectada.
        </p>
      </div>
    </div>
  )
}
