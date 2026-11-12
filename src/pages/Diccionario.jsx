import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Search, X, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  buscarTerminos,
  obtenerTermino,
  resolverRelacionado,
  TIPOS,
  origenDatos,
} from '../services/diccionarioService'
import { nivelesPermitidos, ETIQUETA_NIVEL } from '../constants/permisosDiccionario'
import { extraerMensajeError } from '../services/authService'
import FichaTermino from '../components/diccionario/FichaTermino'
import '../components/diccionario/Diccionario.css'

// HU-DD-08 Diccionario en el portal
// Como usuario del portal, quiero buscar terminos y metricas del diccionario,
// para entender lo que veo en los tableros.
//   CA 1: busqueda por nombre, codigo o sinonimo en menos de 2 s
//   CA 2: cada metrica del tablero abre su ficha (enlace /diccionario?termino=RNT-01)
//   CA 3: los datos restringidos no aparecen para roles sin permiso

const ESPERA_ESCRITURA_MS = 150

export default function Diccionario() {
  const { usuario } = useAuth()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tipo = params.get('tipo') ?? ''
  const refTermino = params.get('termino') ?? ''

  const [texto, setTexto] = useState(q)
  const [resultados, setResultados] = useState(null)
  const [duracionMs, setDuracionMs] = useState(null)
  const [error, setError] = useState('')
  const [origen, setOrigen] = useState('')
  const [ficha, setFicha] = useState(null)
  const [fichaNoEncontrada, setFichaNoEncontrada] = useState('')
  const entrada = useRef(null)

  // Cambia un parametro de la URL (asi la busqueda y la ficha se pueden compartir con un enlace)
  const cambiarParam = useCallback(
    (cambios) => {
      setParams((actual) => {
        const nuevo = new URLSearchParams(actual)
        Object.entries(cambios).forEach(([k, v]) => (v ? nuevo.set(k, v) : nuevo.delete(k)))
        return nuevo
      }, { replace: true })
    },
    [setParams],
  )

  // Espera a que el usuario deje de escribir un momento antes de buscar
  useEffect(() => {
    if (texto === q) return undefined
    const t = setTimeout(() => cambiarParam({ q: texto.trim() }), ESPERA_ESCRITURA_MS)
    return () => clearTimeout(t)
  }, [texto, q, cambiarParam])

  // Busqueda (CA 1): se mide cuanto tarda para mostrarlo como evidencia
  useEffect(() => {
    let vigente = true
    const inicio = performance.now()
    buscarTerminos({ q, tipo, usuario })
      .then((lista) => {
        if (!vigente) return
        setResultados(lista)
        setOrigen(origenDatos())
        setDuracionMs(Math.max(1, Math.round(performance.now() - inicio)))
        setError('')
      })
      .catch((err) => vigente && setError(extraerMensajeError(err, 'No se pudo consultar el diccionario.')))
    return () => { vigente = false }
  }, [q, tipo, usuario])

  // Ficha abierta desde la URL: /diccionario?termino=RNT-01 (CA 2)
  useEffect(() => {
    let vigente = true
    if (!refTermino) {
      Promise.resolve().then(() => {
        if (!vigente) return
        setFicha(null)
        setFichaNoEncontrada('')
      })
      return () => { vigente = false }
    }
    obtenerTermino(refTermino, usuario)
      .then((t) => {
        if (!vigente) return
        setFicha(t)
        // Si no existe o el rol no lo puede ver, se dice lo mismo (CA 3: no se revela que existe)
        setFichaNoEncontrada(t ? '' : refTermino)
      })
      .catch(() => vigente && setFichaNoEncontrada(refTermino))
    return () => { vigente = false }
  }, [refTermino, usuario])

  const abrir = (t) => cambiarParam({ termino: t.id })
  const cerrar = useCallback(() => cambiarParam({ termino: '' }), [cambiarParam])

  const abrirRelacionado = async (nombre) => {
    const t = await resolverRelacionado(nombre, usuario)
    if (t) cambiarParam({ termino: t.id })
    else {
      // Si no hay una coincidencia exacta (o el rol no la puede ver), se busca el texto
      setTexto(nombre)
      cambiarParam({ termino: '', q: nombre })
    }
  }

  const limpiar = () => {
    setTexto('')
    cambiarParam({ q: '' })
    entrada.current?.focus()
  }

  const conteoPorTipo = useMemo(() => {
    const c = {}
    for (const t of resultados ?? []) c[t.tipo] = (c[t.tipo] ?? 0) + 1
    return c
  }, [resultados])

  const niveles = nivelesPermitidos(usuario)

  return (
    <div className="dic">
      <header className="dic-cabecera">
        <span className="dic-cabecera-icono" aria-hidden="true"><BookOpen size={26} /></span>
        <div>
          <h1 className="dic-titulo">Diccionario de datos</h1>
          <p className="dic-texto-suave">Busca métricas, términos y datos para entender lo que ves en los tableros.</p>
        </div>
      </header>

      <div className="dic-buscador">
        <Search size={20} aria-hidden="true" />
        <label htmlFor="dic-buscar" className="solo-lector">Buscar en el diccionario</label>
        <input
          id="dic-buscar"
          ref={entrada}
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Busca por nombre, código o sinónimo (ej: ROE, RNT-01, razón ácida)"
          autoComplete="off"
          spellCheck={false}
          maxLength={80}
          autoFocus
        />
        {texto && (
          <button type="button" className="dic-icono-btn" onClick={limpiar} aria-label="Borrar búsqueda">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="dic-filtros" role="group" aria-label="Filtrar por tipo">
        {['', ...TIPOS].map((t) => (
          <button
            key={t || 'todos'}
            type="button"
            className={`dic-filtro ${tipo === t ? 'activo' : ''}`}
            aria-pressed={tipo === t}
            onClick={() => cambiarParam({ tipo: t })}
          >
            {t ? `${t === 'Métrica' ? 'Métricas' : t === 'Término' ? 'Términos' : 'Datos'}` : 'Todos'}
            {!tipo && t && conteoPorTipo[t] ? <span className="dic-filtro-num">{conteoPorTipo[t]}</span> : null}
          </button>
        ))}
      </div>

      <div className="dic-barra-info">
        <p role="status" aria-live="polite">
          {resultados === null
            ? 'Cargando diccionario…'
            : `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}${q ? ` para “${q}”` : ''}${duracionMs !== null ? ` · ${duracionMs} ms` : ''}`}
        </p>
        <p className="dic-permiso" title="Según la matriz de permisos por rol y sensibilidad del dato">
          <ShieldCheck size={15} aria-hidden="true" />
          Tu rol{usuario?.rol ? ` (${usuario.rol})` : ''} ve: {niveles.map((n) => ETIQUETA_NIVEL[n]).join(', ')}
        </p>
      </div>

      {error && <p className="dic-alerta" role="alert">{error}</p>}

      {resultados && resultados.length === 0 && !error && (
        <div className="dic-vacio">
          <strong>No encontramos “{q}”.</strong>
          <p>Prueba con otro nombre, la sigla, el código de la métrica (ej. LIQ-01) o un sinónimo.</p>
        </div>
      )}

      {resultados && resultados.length > 0 && (
        <ul className="dic-lista">
          {resultados.map((t) => (
            <li key={t.id}>
              <button type="button" className="dic-item" onClick={() => abrir(t)}>
                <div className="dic-item-top">
                  <span className={`dic-tipo dic-tipo-${t.tipo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`}>{t.tipo}</span>
                  {t.codigo && <span className="dic-codigo">{t.codigo}</span>}
                  {t.nombreTecnico && <code className="dic-tecnico">{t.nombreTecnico}</code>}
                  <span className={`dic-nivel dic-nivel-${t.nivel}`}>{ETIQUETA_NIVEL[t.nivel]}</span>
                </div>
                <strong className="dic-item-nombre">{t.nombre}</strong>
                <p className="dic-item-desc">{t.descripcion}</p>
                <span className="dic-item-pie">Ver ficha <ChevronRight size={14} aria-hidden="true" /></span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="dic-fuente">
        Fuente:{' '}
        {origen === 'backend'
          ? 'endpoint de búsqueda del backend (GET /api/v1/diccionario).'
          : 'exportación oficial del diccionario y glosario (equipo Diccionario de datos). El endpoint de búsqueda del backend aún no está publicado.'}
      </p>

      {ficha && <FichaTermino termino={ficha} onCerrar={cerrar} onAbrirRelacionado={abrirRelacionado} />}

      {fichaNoEncontrada && (
        <div className="dic-fondo" onMouseDown={(e) => e.target === e.currentTarget && cerrar()} role="presentation">
          <div className="dic-ficha dic-ficha-chica" role="alertdialog" aria-modal="true" aria-labelledby="dic-nf-titulo">
            <h2 id="dic-nf-titulo" className="dic-ficha-titulo">Sin ficha disponible</h2>
            <p className="dic-texto-suave">No hay una ficha de “{fichaNoEncontrada}” disponible para tu rol en el diccionario.</p>
            <div className="dic-acciones">
              <button type="button" className="dic-btn" onClick={cerrar} autoFocus>Volver al diccionario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
