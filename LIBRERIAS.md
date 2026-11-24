# Justificación y Catálogo de Librerías - Frontend SIFTC

> **Sistema de Información Financiera de Trazabilidad y Competitividad (SIFTC)**  
> **Framework Base:** React `19.2` + Vite `8`  
> **Estado:** Producción (100 % API Real en Render)

Este documento detalla cada una de las librerías seleccionadas para el proyecto, explicando **para qué sirve**, **por qué fue elegida frente a otras alternativas** y **en qué requerimiento se utiliza**.

---

## 1. Librerías Principales

### 1.1 `lightweight-charts` (TradingView)
- **¿Para qué sirve?**  
  Biblioteca especializada desarrollada por TradingView para renderizar gráficos financieros interactivos (velas japonesas/candlestick, área y líneas comparativas).
- **¿Por qué se elige?**  
  - **Requisito del proyecto:** Historias **HU-FE-02** (Gráficas OHLC de velas y líneas) y **HU-FE-05** (Comparador multi-entidad).
  - **Rendimiento:** Construida sobre HTML5 Canvas nativo con `ResizeObserver` para responder sin bloqueos en pantallas de `360px` a `1440px+`.
  - **Interactividad bursátil nativa:** Zoom temporal, escalas de precios, crosshair sincronizado y formateo tabular.

---

### 1.2 `axios`
- **¿Para qué sirve?**  
  Cliente HTTP basado en promesas para consumir la API REST del Backend .NET desplegado en Render (`https://siftc.onrender.com/api/v1`, contrato [`docs/api/openapi-v1.json`](./docs/api/openapi-v1.json)).
- **¿Por qué se elige?**  
  - **Interceptores de petición y respuesta:** Inyecta automáticamente `Authorization: Bearer <TOKEN>` solo si el JWT sigue vigente y redirige ante sesiones expiradas (`401`, excluyendo `/auth/login`).
  - **Tolerancia a infraestructura y dominio:** Soporta backoff para arranque en frío de Render (`502`/`503`/`504` sin `code` de dominio), control de concurrencia y *Problem Details* RFC 9457.
  - **Subida multipart y cancelación:** Maneja `AbortController` (`ERR_CANCELED`) y carga de archivos CSV (`POST /api/v1/diccionario/cargar`).

---

### 1.3 `@microsoft/signalr`
- **¿Para qué sirve?**  
  Cliente oficial para conectarse en tiempo real al hub `/hubs/cotizaciones` del Backend .NET (**HU-BE-04**).
- **¿Por qué se elige?**  
  - Compatibilidad nativa con ASP.NET Core SignalR, negociación WebSocket con fallback automático y `withAutomaticReconnect` (`src/services/cotizacionesSignalR.js` y `src/hooks/useCotizacionesSignalR.js`).
  - Deduplicación por `secuencia` para mantener actualizada la cinta bursátil (`Ticker`) sin recargar la vista.

---

### 1.4 `lucide-react`
- **¿Para qué sirve?**  
  Colección de iconos SVG limpios, accesibles y con *tree-shaking* automático.
- **¿Por qué se elige?**  
  - Acompaña indicadores financieros, navegación móvil (*side drawer*), acciones CRUD, bandeja de aprobaciones y estados de seguridad sin inflar el bundle.

---

## 2. Dependencias Base del Framework

### 2.1 `react` y `react-dom` (`^19.2.8`)
- Núcleo de la interfaz basada en componentes y renderizado reactivo, empaquetado en chunk dedicado `vendor-react`.

### 2.2 `react-router-dom` (`^7.18.4`)
- Enrutamiento SPA con rutas protegidas por rol (`ProtectedRoute`), sincronización de filtros mediante *Query Parameters* (`ranking`, `grafica`, `comparar`, `diccionario`, `administracion`) y `<Layout />` único persistente.

### 2.3 `vite` (`^8.3.0`)
- Servidor de desarrollo con HMR y empaquetador de producción con *code-splitting* por vista y separación explícita de chunks (`vendor-react`, `vendor-charts`, `vendor-signalr`).

---

## 3. Dependencias Declaradas (`package.json`)

```json
{
  "dependencies": {
    "@microsoft/signalr": "^11.0.0",
    "axios": "^1.20.0",
    "lightweight-charts": "^5.2.1",
    "lucide-react": "^1.57.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4"
  }
}
```
