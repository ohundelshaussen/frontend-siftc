import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL || "https://siftc.onrender.com";

export function crearConexionCotizaciones(obtenerToken) {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/cotizaciones`, {
      accessTokenFactory: () => obtenerToken() ?? "",
      withCredentials: false
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning) // Reducimos los logs excesivos a solo advertencias importantes
    .build();
}