import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginApi } from '../services/api'
import { esTokenVigente, extraerRolJwt } from '../utils/jwt'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('usuario')
      const tokenGuardado = localStorage.getItem('token')
      if (!tokenGuardado || !esTokenVigente(tokenGuardado)) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        return null
      }
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }, [])

  // Verificar periódicamente o al ganar foco si el token expiró
  useEffect(() => {
    const verificarVigencia = () => {
      const t = localStorage.getItem('token')
      if (t && !esTokenVigente(t)) {
        logout()
      }
    }

    window.addEventListener('focus', verificarVigencia)
    return () => window.removeEventListener('focus', verificarVigencia)
  }, [logout])

  const login = async (identificador, password) => {
    // loginApi retorna { token, usuario: { idUsuario, email, nombreCompleto, nombre, rol } }
    const sesion = await loginApi(identificador, password)

    // Si el backend no envió el rol en el JSON pero sí en el JWT, se rescata del token
    const rolJwt = extraerRolJwt(sesion.token)
    if (rolJwt && !sesion.usuario.rol) {
      sesion.usuario.rol = rolJwt
    }

    localStorage.setItem('token', sesion.token)
    localStorage.setItem('usuario', JSON.stringify(sesion.usuario))

    setToken(sesion.token)
    setUsuario(sesion.usuario)
    return sesion
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, estaAutenticado: Boolean(usuario && token) }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
