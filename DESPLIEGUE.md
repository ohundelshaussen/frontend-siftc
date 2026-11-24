# Despliegue del frontend ALZA (SIFTC)

## Antes de subir

Las variables `VITE_*` se incrustan en el build: no se leen en tiempo de ejecución.
Si cambias `VITE_API_URL`, hay que volver a compilar y volver a subir.

Valores de producción por defecto en el código y en `.env.example` (el archivo `.env` no se incluye ni se rastrea en el repositorio):

    VITE_API_URL=https://siftc.onrender.com
    VITE_API_PREFIX=/api/v1
    VITE_API_TIMEOUT=60000

## Compilar

    npm run lint
    npm run build

Genera la carpeta `dist/` con chunks separados (`vendor-react`, `vendor-charts`, `vendor-signalr` y vistas *lazy*). Para revisarla antes de publicar:

    npm run preview

## Publicar

`public/_redirects` (Netlify) y `vercel.json` (Vercel) ya están configurados para que las rutas de React Router funcionen al recargar la página.

### Opción A — Netlify Drop

1. Entrar a `https://app.netlify.com/drop`
2. Arrastrar la carpeta `dist` completa.
3. Netlify devuelve una URL del tipo `https://<nombre>.netlify.app`.

### Opción B — Vercel por CLI

    npx vercel        # primera vez: crea el proyecto
    npx vercel --prod # publica a producción

## Después de subir: CORS

El backend .NET debe incluir el dominio publicado en su política de CORS (incluyendo negociación SignalR `/hubs/cotizaciones`), junto con `http://localhost:5173` para desarrollo. Sin eso el navegador bloquea todas las peticiones.

Síntoma en la consola del navegador: `blocked by CORS policy`.

## Estado verificado del frontend

- **100 % API Real:** Sin modo simulado (mocks). Autenticación JWT, tablero, gráficas OHLC (`Diaria`, `Mensual`, `Trimestral`) con 9 métricas por dimensión, ranking con *circuit breaker* de `60 s` (modo estricto sin datos fabricados), comparador, bandeja de aprobaciones, diccionario en vivo (con carga inicial y carga CSV), CRUD de usuarios y configuración de pesos del IC consumen exclusivamente `https://siftc.onrender.com/api/v1`.
- **Seguridad y RBAC:** Matriz completa de 6 roles canónicos (`src/constants/permisos.js`), Decisión D1 (`Gerente / Directivo` sin posición), Decisión D2 (`Usuario móvil` exclusivo en watchlist), bloqueo `403` en Ranking/Comparador para `Usuario móvil` y sin datos confidenciales del CSV incluidos en el bundle.
- **Tiempo real:** Conexión persistente SignalR (`/hubs/cotizaciones`) protegida bajo un `<Layout />` único sin desmontajes entre rutas.
