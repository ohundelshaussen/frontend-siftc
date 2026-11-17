import React, { useEffect, useState } from 'react'
import { getEntidades } from '../../services/api'
import { num, pct } from '../../utils/format'
import { useCotizacionesSignalR } from '../../hooks/useCotizacionesSignalR'
import './Ticker.css'

export default function Ticker() {
  const [entidades, setEntidades] = useState([])

  // Función para obtener el token si el Hub lo requiere
  const obtenerToken = () => localStorage.getItem("token")

  // Consumimos nuestro hook de SignalR en tiempo real
  const { cotizaciones: cotizacionesEnVivo } = useCotizacionesSignalR(obtenerToken)

  // Carga inicial mediante la API REST tradicional
  useEffect(() => {
    getEntidades().then(setEntidades).catch(() => setEntidades([]))
  }, [])

  // Sincronizamos las actualizaciones en tiempo real de SignalR con el estado local
  useEffect(() => {
    if (cotizacionesEnVivo && cotizacionesEnVivo.length > 0) {
      setEntidades((prevEntidades) => {
        // Combinamos o actualizamos los elementos que lleguen en tiempo real
        const actualizadas = [...prevEntidades];
        cotizacionesEnVivo.forEach((cotizacionNueva) => {
          const index = actualizadas.findIndex(
            (e) => (e.codigo ?? e.codigo_entidad) === (cotizacionNueva.codigo ?? cotizacionNueva.codigo_entidad)
          );
          if (index >= 0) {
            actualizadas[index] = { ...actualizadas[index], ...cotizacionNueva };
          } else {
            actualizadas.unshift(cotizacionNueva);
          }
        });
        return actualizadas;
      });
    }
  }, [cotizacionesEnVivo])

  if (entidades.length === 0) return <div className="ticker" aria-hidden="true" />

  // La lista se repite para que el desplazamiento en bucle sea continuo.
  const items = [...entidades, ...entidades]

  return (
    <div className="ticker" role="marquee" aria-label="Cotizaciones de las entidades">
      <div className="ticker-pista">
        {items.map((e, i) => {
          const varPct = Number(e.variacionPct ?? e.variacion_porcentual ?? 0)
          const sube = varPct > 0
          const baja = varPct < 0
          const codigo = e.codigo ?? e.codigo_entidad
          const ic = e.ic ?? e.indice_competitividad
          return (
            <span className="ticker-item mono-num" key={`${codigo}-${i}`}>
              <span className="ticker-codigo">{codigo}</span>
              <strong>{num(ic, 1)}</strong>
              <span className={sube ? 'ticker-sube' : baja ? 'ticker-baja' : ''}>
                {sube ? '▲' : baja ? '▼' : '▬'} {pct(varPct)}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}