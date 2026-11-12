import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import './EnlaceDiccionario.css'

// HU-DD-08 CA 2: enlace pequeno que abre la ficha del diccionario desde cualquier metrica.
// termino: id (MET-01, TER-01) o codigo de metrica (RNT-01). texto: si se omite, solo se ve el icono.
export default function EnlaceDiccionario({ termino, nombre = '', texto = '', className = '' }) {
  if (!termino) return null
  return (
    <Link
      to={`/diccionario?termino=${encodeURIComponent(termino)}`}
      className={`enlace-diccionario ${texto ? 'con-texto' : ''} ${className}`}
      aria-label={texto ? undefined : `Ver ${nombre || termino} en el diccionario`}
      title={texto ? undefined : `¿Qué es${nombre ? ` ${nombre}` : ''}? Ver en el diccionario`}
      onClick={(e) => e.stopPropagation()}
    >
      <BookOpen size={texto ? 15 : 14} aria-hidden="true" />
      {texto && <span>{texto}</span>}
    </Link>
  )
}
