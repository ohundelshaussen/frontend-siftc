export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  ANALISTA: 'Analista financiero',
  GERENTE: 'Gerente',
  DATA_STEWARD: 'Data Steward',
  AUDITOR: 'Auditor',
  USUARIO_MOVIL: 'Usuario móvil',
};

export const ROLES_LISTA = Object.values(ROLES);

export const tieneRol = (usuario, rolesPermitidos) => {
  if (!usuario || !usuario.rol) return false;
  if (!rolesPermitidos || rolesPermitidos.length === 0) return true;
  return rolesPermitidos.includes(usuario.rol);
};
