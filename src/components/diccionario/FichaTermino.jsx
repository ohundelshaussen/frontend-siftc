import { useEffect, useRef } from 'react'
import { X, Calculator, Ruler, CalendarClock, Lightbulb, Link2, Users, MapPin, BadgeCheck } from 'lucide-react'
import { partirUmbrales } from '../../services/diccionarioService'
import { ETIQUETA_NIVEL } from '../../constants/permisosDiccionario'

// HU-DD-08 CA 2: ficha del diccionario de una metrica, termino o dato.
// Muestra descripcion, formula, unidad, umbrales y ejemplo; los relacionados son enlaces.

function Bloque({ icono: Icono, titulo, children }) {
  return (
    <section className="dic-ficha-bloque">
      <h3><Icono size={16} aria-hidden="true" /> {titulo}</h3>
      {children}
    </section>
  )
}

export default function FichaTermino({ termino, onCerrar, onAbrirRelacionado }) {
  const botonCerrar = useRef(null)

  // Al abrir, el foco va al boton cerrar; con Escape se cierra
  useEffect(() => {
    botonCerrar.current?.focus()
    const alPresionar = (e) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  if (!termino) return null
  const t = termino
  const umbrales = partirUmbrales(t.umbrales)

  return (
    <div className="dic-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()} role="presentation">
      <article className="dic-ficha" role="dialog" aria-modal="true" aria-labelledby="dic-ficha-titulo">
        <header className="dic-ficha-cabecera">
          <div className="dic-ficha-etiquetas">
            <span className={`dic-tipo dic-tipo-${t.tipo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`}>{t.tipo}</span>
            {t.codigo && <span className="dic-codigo">{t.codigo}</span>}
            <span className="dic-codigo dic-codigo-suave">{t.id}</span>
            <span className={`dic-nivel dic-nivel-${t.nivel}`}>{ETIQUETA_NIVEL[t.nivel]}</span>
          </div>
          <button ref={botonCerrar} type="button" className="dic-icono-btn" onClick={onCerrar} aria-label="Cerrar ficha">
            <X size={20} />
          </button>
        </header>

        <h2 id="dic-ficha-titulo" className="dic-ficha-titulo">{t.nombre}</h2>
        {t.nombreTecnico && <p className="dic-ficha-tecnico">Nombre técnico: <code>{t.nombreTecnico}</code></p>}

        <p className="dic-ficha-descripcion">{t.descripcion}</p>

        {t.sinonimos.length > 0 && (
          <p className="dic-sinonimos">
            <span>También se busca como:</span>
            {t.sinonimos.map((s) => <span key={s} className="dic-chip">{s}</span>)}
          </p>
        )}

        {t.formula && (
          <Bloque icono={Calculator} titulo={t.tipo === 'Métrica' ? 'Fórmula' : 'Regla o cálculo'}>
            <code className="dic-formula">{t.formula}</code>
            {t.variables && <p className="dic-texto-suave">Usa: {t.variables}</p>}
          </Bloque>
        )}

        {(t.unidad || t.frecuencia) && (
          <div className="dic-fila-datos">
            {t.unidad && (
              <div className="dic-dato">
                <span><Ruler size={14} aria-hidden="true" /> Unidad</span>
                <strong>{t.unidad}</strong>
              </div>
            )}
            {t.frecuencia && (
              <div className="dic-dato">
                <span><CalendarClock size={14} aria-hidden="true" /> Frecuencia</span>
                <strong>{t.frecuencia}</strong>
              </div>
            )}
          </div>
        )}

        {umbrales.length > 0 && (
          <Bloque icono={BadgeCheck} titulo="Umbrales (semáforo)">
            <ul className="dic-umbrales">
              {umbrales.map((u) => (
                <li key={u.texto} className={`dic-umbral dic-umbral-${u.color}`}>
                  {u.color !== 'nota' && <span className="dic-umbral-color">{u.color[0].toUpperCase() + u.color.slice(1)}</span>}
                  <span>{u.texto}</span>
                </li>
              ))}
            </ul>
          </Bloque>
        )}

        {t.ejemplo && (
          <Bloque icono={Lightbulb} titulo="Ejemplo">
            <p className="dic-ejemplo">{t.ejemplo}</p>
          </Bloque>
        )}

        {t.relacionados.length > 0 && (
          <Bloque icono={Link2} titulo="Términos relacionados">
            <div className="dic-relacionados">
              {t.relacionados.map((r) => (
                <button key={r} type="button" className="dic-enlace-rel" onClick={() => onAbrirRelacionado(r)}>
                  {r}
                </button>
              ))}
            </div>
          </Bloque>
        )}

        <footer className="dic-ficha-pie">
          {t.equipoDueno && <span><Users size={14} aria-hidden="true" /> {t.equipoDueno}</span>}
          {t.usadoEn && <span><MapPin size={14} aria-hidden="true" /> {t.usadoEn}</span>}
          {t.estado && <span className={`dic-estado ${/aprob/i.test(t.estado) ? 'dic-estado-ok' : ''}`}>{t.estado}</span>}
        </footer>
      </article>
    </div>
  )
}
