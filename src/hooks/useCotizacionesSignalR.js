import { useEffect, useState, useRef } from "react";
import { crearConexionCotizaciones } from "../services/cotizacionesSignalR";

export function useCotizacionesSignalR(obtenerToken) {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [conectado, setConectado] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const connection = crearConexionCotizaciones(obtenerToken);
    connectionRef.current = connection;

    const manejarNuevaCotizacion = (nuevaCotizacion) => {
      if (!isMounted) return;
      setCotizaciones((prev) => {
        const index = prev.findIndex((c) => c.id === nuevaCotizacion.id);
        if (index >= 0) {
          const copia = [...prev];
          copia[index] = nuevaCotizacion;
          return copia;
        }
        return [nuevaCotizacion, ...prev];
      });
    };

    // Suscripción a los eventos del Hub
    connection.on("RecibirCotizacion", manejarNuevaCotizacion);
    connection.on("cotizaciones", manejarNuevaCotizacion);

    async function iniciarConexion() {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
          if (isMounted) {
            setConectado(true);
            console.log("SignalR Conectado con éxito 🟢");
          }
        }
      } catch (err) {
        if (isMounted) {
          // Ocultamos el ruido de errores si el servidor de Render está despertando
          setConectado(false);
        }
      }
    }

    iniciarConexion();

    // Limpieza ordenada al desmontar el componente para evitar llamadas a stop() en pleno arranque
    return () => {
      isMounted = false;
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [obtenerToken]);

  return { cotizaciones, conectado };
}