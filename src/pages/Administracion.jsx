import { useSearchParams } from 'react-router-dom'
import { Users, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import UsuariosAdmin from '../components/Admin/UsuariosAdmin'
import PesosAdmin from '../components/Admin/PesosAdmin'
import { USE_MOCK } from '../services/adminService'
import { API_BASE_URL } from '../services/api'
import '../components/Admin/Admin.css'

// HU-FE-07 Usuarios, roles y parametros
// Como administrador, gestionar usuarios, roles y parametros sin soporte tecnico.
// La ruta /administracion solo deja entrar al rol Administrador (ver AppRouter.jsx).

const PESTANAS = [
  { id: 'usuarios', titulo: 'Usuarios y roles', icono: Users },
  { id: 'parametros', titulo: 'Parámetros', icono: SlidersHorizontal },
]

export default function Administracion() {
  // La pestana va en la URL (?pestana=parametros) para poder compartir el enlace
  const [params, setParams] = useSearchParams()
  const activa = PESTANAS.some((p) => p.id === params.get('pestana')) ? params.get('pestana') : 'usuarios'

  const elegir = (id) => setParams(id === 'usuarios' ? {} : { pestana: id }, { replace: true })

  // Flechas izquierda/derecha para moverse entre pestanas con el teclado
  const alTeclado = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = PESTANAS.findIndex((p) => p.id === activa)
    const siguiente = PESTANAS[(i + (e.key === 'ArrowRight' ? 1 : PESTANAS.length - 1)) % PESTANAS.length]
    elegir(siguiente.id)
    document.getElementById(`adm-tab-${siguiente.id}`)?.focus()
  }

  return (
    <div className="adm">
      <header className="adm-cabecera">
        <span className="adm-cabecera-icono" aria-hidden="true"><ShieldCheck size={26} /></span>
        <div>
          <h1 className="adm-titulo">Administración</h1>
          <p className="adm-texto-suave">Gestiona usuarios, roles y parámetros del sistema.</p>
        </div>
      </header>

      <div className="adm-pestanas" role="tablist" aria-label="Secciones de administración" onKeyDown={alTeclado}>
        {PESTANAS.map(({ id, titulo, icono: Icono }) => (
          <button
            key={id}
            id={`adm-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activa === id}
            aria-controls={`adm-panel-${id}`}
            tabIndex={activa === id ? 0 : -1}
            className={`adm-pestana ${activa === id ? 'activa' : ''}`}
            onClick={() => elegir(id)}
          >
            <Icono size={18} aria-hidden="true" /> {titulo}
          </button>
        ))}
      </div>

      {USE_MOCK ? (
        <p className="adm-alerta adm-alerta-aviso">
          Modo de prueba (VITE_USE_MOCK=true): estos datos no vienen de la base de datos.
          Para conectarse al backend pon VITE_USE_MOCK=false en el archivo .env.
        </p>
      ) : (
        <p className="adm-conexion">
          <span className="adm-punto" aria-hidden="true" /> Conectado al backend: <code>{API_BASE_URL}</code>
        </p>
      )}

      <div id={`adm-panel-${activa}`} role="tabpanel" aria-labelledby={`adm-tab-${activa}`}>
        {activa === 'usuarios' ? <UsuariosAdmin /> : <PesosAdmin />}
      </div>
    </div>
  )
}
