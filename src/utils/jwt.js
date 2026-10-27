// Decodificador seguro de JWT compatible con RFC 7519 y UTF-8
export function decodificarJwt(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    // Normalizar base64url a base64 estándar
    const base64Url = partes[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Verifica si el token aún no ha expirado
export function esTokenVigente(token) {
  const payload = decodificarJwt(token);
  if (!payload) return false;

  // Si no tiene claim exp, consideramos vigente mientras exista
  if (!payload.exp) return true;

  // payload.exp está en segundos (UNIX timestamp)
  const ahoraSegundos = Math.floor(Date.now() / 1000);
  return payload.exp > ahoraSegundos;
}

// Extrae el rol principal del JWT emitido por .NET o Mock
export function extraerRolJwt(token) {
  const payload = decodificarJwt(token);
  if (!payload) return null;

  // .NET usa ClaimTypes.Role ("http://schemas.microsoft.com/ws/2008/06/identity/claims/role") o "role"
  return (
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload.role ??
    payload.rol ??
    null
  );
}
