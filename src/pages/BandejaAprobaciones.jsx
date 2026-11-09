import React, { useState, useEffect } from 'react';
import { getLotesPendientes, aprobarLote, rechazarLote } from '../services/api';
import '../styles/BandejaAprobaciones.css';

export default function BandejaAprobaciones() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el usuario actual del localStorage para la regla de auto-aprobación
  const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Estados para el modal de rechazo (comentario obligatorio)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState('');
  const [errorComentario, setErrorComentario] = useState('');

  useEffect(() => {
    cargarBandeja();
  }, []);

  const cargarBandeja = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLotesPendientes();
      setLotes(data);
    } catch (err) {
      setError('No se pudieron cargar los lotes pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (idLote) => {
    try {
      await aprobarLote(idLote);
      // Quitar el lote aprobado de la lista de inmediato
      setLotes((prev) => prev.filter((item) => item.idLote !== idLote));
    } catch (err) {
      const mensaje = err.response?.data?.detail || 'Error al aprobar el lote.';
      alert(mensaje);
      if (err.response?.status === 404 || err.response?.status === 409) {
        cargarBandeja(); // Recargar si hubo conflicto
      }
    }
  };

  const abrirRechazo = (lote) => {
    setLoteSeleccionado(lote);
    setComentarioRechazo('');
    setErrorComentario('');
    setModalAbierto(true);
  };

  const confirmarRechazo = async () => {
    const trimmed = comentarioRechazo.trim();
    if (!trimmed) {
      setErrorComentario('El comentario es obligatorio para rechazar un lote.');
      return;
    }
    if (trimmed.length > 500) {
      setErrorComentario('El comentario no puede superar los 500 caracteres.');
      return;
    }

    try {
      await rechazarLote(loteSeleccionado.idLote, trimmed);
      setLotes((prev) => prev.filter((item) => item.idLote !== loteSeleccionado.idLote));
      setModalAbierto(false);
      setLoteSeleccionado(null);
    } catch (err) {
      const mensaje = err.response?.data?.detail || 'Error al rechazar el lote.';
      setErrorComentario(mensaje);
      if (err.response?.status === 404 || err.response?.status === 409) {
        cargarBandeja();
      }
    }
  };

  if (loading) return <div className="bandeja-mensaje">Cargando bandeja de aprobaciones...</div>;
  if (error) return <div className="bandeja-mensaje error">{error}</div>;

  return (
    <div className="bandeja-container">
      <h2>Bandeja de Aprobación por Lotes</h2>

      {lotes.length === 0 ? (
        <p className="bandeja-mensaje">No hay lotes pendientes por aprobar.</p>
      ) : (
        <div className="table-responsive">
          <table className="bandeja-table">
            <thead>
              <tr>
                <th>Archivo CSV</th>
                <th>Fecha de Carga (UTC)</th>
                <th>Registros Válidos</th>
                <th>Ejecutor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((item) => {
                // Regla: Quien cargó el lote no puede aprobarlo
                const esSuPropioLote = item.idUsuarioEjecutor === usuarioActual.id;

                return (
                  <tr key={item.idLote}>
                    <td className="font-semibold">{item.nombreArchivo}</td>
                    <td>{new Date(item.fechaCarga).toLocaleString()}</td>
                    <td className="mono-num">{item.registrosValidos} / {item.registrosTotales}</td>
                    <td className="text-sm text-gray-600">{item.idUsuarioEjecutor}</td>
                    <td>
                      <button
                        onClick={() => handleAprobar(item.idLote)}
                        disabled={esSuPropioLote}
                        className={`btn-aprobar ${esSuPropioLote ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={esSuPropioLote ? 'No puedes aprobar un lote que tú cargaste' : 'Aprobar lote'}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => abrirRechazo(item)}
                        className="btn-rechazar"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE RECHAZO CON COMENTARIO OBLIGATORIO (MÁX 500 CARACTERES) */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Motivo de Rechazo</h3>
            <p>
              Estás rechazando el lote <strong>{loteSeleccionado?.nombreArchivo}</strong>. Ingresa el comentario obligatorio:
            </p>
            <textarea
              rows="4"
              maxLength={500}
              placeholder="Escribe el motivo del rechazo (máx. 500 caracteres)..."
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {comentarioRechazo.length}/500 caracteres
            </div>
            {errorComentario && <span className="error-text">{errorComentario}</span>}
            
            <div className="modal-buttons">
              <button
                onClick={() => setModalAbierto(false)}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                className="btn-confirmar"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}