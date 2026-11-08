import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoAlza from '../assets/logo-alza.png';
import { login } from '../services/api';
import '../styles/Login.css';

export const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorIdentificador, setErrorIdentificador] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [tocadoIdentificador, setTocadoIdentificador] = useState(false);
  const [tocadoPassword, setTocadoPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  //const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Llamada al endpoint real de Render a través de api.js
      const data = await login(usuario, password);

      // Guardamos el token y los datos de usuario exactamente como los pide el interceptor
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        // Redirigimos al tablero principal de forma exitosa
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Credenciales inválidas o error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <BotonTema className="tema-flotante" />
      {/* Panel Izquierdo Oscuro */}
      <div className="login-panel-left">
        <span className="login-tag">SIFTC · PORTAL WEB</span>

        <h1 className="login-title">
          Datos trazables.<br />
          Entidades que<br />
          cotizan.
        </h1>

        <div className="login-features">
          <div className="login-feature-item">
            <span className="login-feature-num">01</span>
            <p className="login-feature-text">
              Índice de Competitividad de 0 a 100 para cada entidad.
            </p>
          </div>
          <div className="login-feature-item">
            <span className="login-feature-num">02</span>
            <p className="login-feature-text">
              Gráficas de velas y ranking por sector, dimensión y periodo.
            </p>
          </div>
          <div className="login-feature-item">
            <span className="login-feature-num">03</span>
            <p className="login-feature-text">
              Cada valor publicado con su origen y su regla de cálculo.
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho Claro */}
      <div className="login-panel-right">
        <div className="login-card">
          <img src={logoAlza} alt="Logo ALZA" className="login-logo-img logo-claro" />
          <img src={logoAlzaOscuro} alt="Logo ALZA" className="login-logo-img logo-oscuro" />

          <h2 className="login-card-title">Iniciar sesión</h2>
          <p className="login-card-subtitle">Ingresa con tu correo o usuario del sistema.</p>

          {error && (
            <div style={{ color: '#d9534f', fontSize: '13px', marginBottom: '15px', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field-group">
              <div className="login-label-row">
                <label
                  htmlFor="login-identificador"
                  className={`login-label ${errorIdentificador ? 'login-label-error' : ''}`}
                >
                  Usuario o correo
                </label>
                {identificador.length >= LIMITES_CAMPOS.EMAIL_MAX - 20 && (
                  <span className="login-char-count mono-num">
                    {identificador.length}/{LIMITES_CAMPOS.EMAIL_MAX}
                  </span>
                )}
              </div>
              <input
                ref={refIdentificador}
                id="login-identificador"
                type="text"
                inputMode="email"
                placeholder="ej: analista@siftc.edu.co o analista"
                value={identificador}
                onChange={handleIdentificadorChange}
                onBlur={handleIdentificadorBlur}
                maxLength={LIMITES_CAMPOS.EMAIL_MAX}
                className={`login-input ${errorIdentificador ? 'login-input-error' : ''}`}
                aria-invalid={Boolean(errorIdentificador)}
                aria-describedby={errorIdentificador ? 'login-identificador-error' : undefined}
                autoComplete="username"
                spellCheck={false}
                disabled={deshabilitado}
                required
              />
              {errorIdentificador && (
                <p id="login-identificador-error" className="login-field-error" role="alert">
                  {errorIdentificador}
                </p>
              )}
            </div>

            <div className="login-field-group">
              <div className="login-label-row">
                <label
                  htmlFor="login-password"
                  className={`login-label ${errorPassword ? 'login-label-error' : ''}`}
                >
                  Contraseña
                </label>
                {password.length >= LIMITES_CAMPOS.PASSWORD_MAX - 12 && (
                  <span className="login-char-count mono-num">
                    {password.length}/{LIMITES_CAMPOS.PASSWORD_MAX}
                  </span>
                )}
              </div>
              <div className="login-input-password-wrapper">
                <input
                  ref={refPassword}
                  id="login-password"
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  maxLength={LIMITES_CAMPOS.PASSWORD_MAX}
                  className={`login-input ${errorPassword ? 'login-input-error' : ''}`}
                  aria-invalid={Boolean(errorPassword)}
                  aria-describedby={errorPassword ? 'login-password-error' : undefined}
                  autoComplete="current-password"
                  disabled={deshabilitado}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="login-toggle-eye"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  disabled={deshabilitado}
                  tabIndex={-1}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              {errorPassword && (
                <p id="login-password-error" className="login-field-error" role="alert">
                  {errorPassword}
                </p>
              )}
            </div>

            <button type="submit" className="login-submit-btn" disabled={cargando}>
              {cargando ? 'Validando...' : 'Ingresar'}
            </button>
          </form>

          <p className="login-footer-text">
            Acceso solo para personal autorizado. Si no tienes cuenta, pídela al administrador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
