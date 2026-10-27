param(
  [string]$RutaBackend = "..\SIFTC"
)

$ErrorActionPreference = "Stop"

$raizFront = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$rutaBackAbs = Resolve-Path $RutaBackend -ErrorAction SilentlyContinue

if (-not $rutaBackAbs) {
  Write-Host "[ERROR] No se encontró la carpeta del backend en '$RutaBackend'." -ForegroundColor Red
  Write-Host "Clona primero el backend al lado de frontend-siftc:" -ForegroundColor Yellow
  Write-Host "  git clone https://github.com/Jramosd-lang/SIFTC.git ..\SIFTC" -ForegroundColor Cyan
  exit 1
}

Write-Host "1/5 Verificando archivo .env del Backend..." -ForegroundColor Cyan
$envDestino = Join-Path $rutaBackAbs ".env"
if (-not (Test-Path $envDestino)) {
  Copy-Item (Join-Path $PSScriptRoot ".env.backend.example") $envDestino
  Write-Host "    Creado $envDestino" -ForegroundColor Green
} else {
  Write-Host "    Ya existe $envDestino" -ForegroundColor Gray
}

Write-Host "2/5 Verificando nombre de ensamblado Linux en dockerfile (SIFTC.Api.dll)..." -ForegroundColor Cyan
$dockerfilePath = Join-Path $rutaBackAbs "dockerfile"
if (Test-Path $dockerfilePath) {
  $contenidoDocker = Get-Content $dockerfilePath -Raw
  if ($contenidoDocker -cmatch "SIFTC\.API\.dll") {
    $contenidoCorregido = $contenidoDocker -creplace "SIFTC\.API\.dll", "SIFTC.Api.dll"
    [System.IO.File]::WriteAllText($dockerfilePath, $contenidoCorregido, [System.Text.UTF8Encoding]::new($false))
    Write-Host "    Ajustado ENTRYPOINT a SIFTC.Api.dll en dockerfile local" -ForegroundColor Green
  } else {
    Write-Host "    dockerfile ya apunta a SIFTC.Api.dll" -ForegroundColor Gray
  }
}

Write-Host "3/5 Levantando contenedores Docker (PostgreSQL 15 + API .NET 10)..." -ForegroundColor Cyan
Push-Location $rutaBackAbs
try {
  docker compose up -d --build
} finally {
  Pop-Location
}

Write-Host "4/5 Esperando a PostgreSQL y cargando semilla UTF-8 (init-seguridad.sql)..." -ForegroundColor Cyan
$intentos = 0
do {
  Start-Sleep -Seconds 2
  $intentos++
  docker exec siftc_database pg_isready -U postgres -d siftc_db *> $null
} while ($LASTEXITCODE -ne 0 -and $intentos -lt 20)

$sqlLocal = Join-Path $PSScriptRoot "init-seguridad.sql"
docker cp $sqlLocal siftc_database:/tmp/init-seguridad.sql
docker exec siftc_database psql -U postgres -d siftc_db -f /tmp/init-seguridad.sql

Write-Host "5/5 Configurando .env del Frontend (VITE_USE_MOCK=false)..." -ForegroundColor Cyan
$envFront = Join-Path $raizFront ".env"
$contenidoEnvFront = @"
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:7123
VITE_API_PREFIX=/api/v1
"@
[System.IO.File]::WriteAllText($envFront, $contenidoEnvFront, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host " Entorno Backend + Frontend listo en tu computadora" -ForegroundColor Green
Write-Host " - API .NET 10: http://localhost:7123/api/v1" -ForegroundColor White
Write-Host " - Usuario prueba 1: analista@siftc.edu.co  | Clave: alza2026" -ForegroundColor White
Write-Host " - Usuario prueba 2: admin@siftc.edu.co     | Clave: alza2026" -ForegroundColor White
Write-Host " Ahora ejecuta en frontend-siftc: npm run dev" -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Green
