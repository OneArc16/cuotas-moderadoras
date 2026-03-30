export const RBAC_PERMISSION = {
  DASHBOARD_VIEW: "dashboard.ver",
  SESSION_START: "sesion_operativa.iniciar",
  SESSION_CLOSE: "sesion_operativa.cerrar",
  ADMISION_VIEW: "admisiones.ver",
  ADMISION_CREATE: "admisiones.crear",
  ADMISION_CANCEL: "admisiones.anular",
  PATIENT_CREATE: "pacientes.crear",
  PATIENT_UPDATE: "pacientes.editar",
  CAJA_VIEW: "caja.ver",
  CAJA_OPEN: "caja.abrir",
  CAJA_CLOSE: "caja.cerrar",
  CAJA_REOPEN: "caja.reabrir",
  MOVEMENT_VIEW: "movimientos.ver",
  REPORT_VIEW: "reportes.ver",
  CONTRACT_MANAGE: "contratos.gestionar",
  CATEGORY_MANAGE: "categorias.gestionar",
  SERVICE_MANAGE: "servicios.gestionar",
  TARIFF_MANAGE: "tarifas.gestionar",
  BOX_MANAGE: "cajas.gestionar",
  COLLABORATOR_MANAGE: "colaboradores.gestionar",
  SECURITY_MANAGE: "seguridad.gestionar",
} as const;

export type PermissionCode =
  (typeof RBAC_PERMISSION)[keyof typeof RBAC_PERMISSION];

export const RBAC_ALL_PERMISSION_CODES = Object.values(
  RBAC_PERMISSION,
) as PermissionCode[];

export const RBAC_PERMISSION_CATALOG = [
  {
    codigo: RBAC_PERMISSION.DASHBOARD_VIEW,
    nombre: "Ver dashboard",
    moduloSistema: "Dashboard",
    descripcion: "Acceso al tablero principal del sistema.",
  },
  {
    codigo: RBAC_PERMISSION.SESSION_START,
    nombre: "Iniciar sesion operativa",
    moduloSistema: "Sesion operativa",
    descripcion: "Permite iniciar una sesion operativa en una caja.",
  },
  {
    codigo: RBAC_PERMISSION.SESSION_CLOSE,
    nombre: "Cerrar sesion operativa",
    moduloSistema: "Sesion operativa",
    descripcion: "Permite cerrar la sesion operativa actual.",
  },
  {
    codigo: RBAC_PERMISSION.ADMISION_VIEW,
    nombre: "Ver admisiones",
    moduloSistema: "Admisiones",
    descripcion: "Permite acceder al modulo de admisiones.",
  },
  {
    codigo: RBAC_PERMISSION.ADMISION_CREATE,
    nombre: "Crear admisiones",
    moduloSistema: "Admisiones",
    descripcion: "Permite registrar admisiones y sus cobros.",
  },
  {
    codigo: RBAC_PERMISSION.ADMISION_CANCEL,
    nombre: "Anular admisiones",
    moduloSistema: "Admisiones",
    descripcion: "Permite anular admisiones registradas.",
  },
  {
    codigo: RBAC_PERMISSION.PATIENT_CREATE,
    nombre: "Crear pacientes",
    moduloSistema: "Pacientes",
    descripcion: "Permite registrar pacientes rapidamente.",
  },
  {
    codigo: RBAC_PERMISSION.PATIENT_UPDATE,
    nombre: "Editar pacientes",
    moduloSistema: "Pacientes",
    descripcion: "Permite actualizar datos de pacientes.",
  },
  {
    codigo: RBAC_PERMISSION.CAJA_VIEW,
    nombre: "Ver caja",
    moduloSistema: "Caja",
    descripcion: "Permite acceder al modulo operativo de caja.",
  },
  {
    codigo: RBAC_PERMISSION.CAJA_OPEN,
    nombre: "Abrir caja",
    moduloSistema: "Caja",
    descripcion: "Permite abrir jornadas de caja.",
  },
  {
    codigo: RBAC_PERMISSION.CAJA_CLOSE,
    nombre: "Cerrar caja",
    moduloSistema: "Caja",
    descripcion: "Permite cerrar jornadas de caja.",
  },
  {
    codigo: RBAC_PERMISSION.CAJA_REOPEN,
    nombre: "Reabrir caja",
    moduloSistema: "Caja",
    descripcion: "Permite reabrir jornadas de caja cerradas.",
  },
  {
    codigo: RBAC_PERMISSION.MOVEMENT_VIEW,
    nombre: "Ver movimientos",
    moduloSistema: "Movimientos",
    descripcion: "Permite consultar movimientos y trazabilidad.",
  },
  {
    codigo: RBAC_PERMISSION.REPORT_VIEW,
    nombre: "Ver reportes",
    moduloSistema: "Reportes",
    descripcion: "Permite consultar indicadores y reportes.",
  },
  {
    codigo: RBAC_PERMISSION.CONTRACT_MANAGE,
    nombre: "Gestionar contratos",
    moduloSistema: "Parametrizacion",
    descripcion: "Permite crear y editar contratos.",
  },
  {
    codigo: RBAC_PERMISSION.CATEGORY_MANAGE,
    nombre: "Gestionar categorias",
    moduloSistema: "Parametrizacion",
    descripcion: "Permite administrar categorias de afiliacion.",
  },
  {
    codigo: RBAC_PERMISSION.SERVICE_MANAGE,
    nombre: "Gestionar servicios",
    moduloSistema: "Parametrizacion",
    descripcion: "Permite administrar servicios.",
  },
  {
    codigo: RBAC_PERMISSION.TARIFF_MANAGE,
    nombre: "Gestionar tarifas",
    moduloSistema: "Parametrizacion",
    descripcion: "Permite crear y editar tarifas.",
  },
  {
    codigo: RBAC_PERMISSION.BOX_MANAGE,
    nombre: "Gestionar cajas",
    moduloSistema: "Parametrizacion",
    descripcion: "Permite administrar cajas operativas.",
  },
  {
    codigo: RBAC_PERMISSION.COLLABORATOR_MANAGE,
    nombre: "Gestionar colaboradores",
    moduloSistema: "Colaboradores",
    descripcion: "Permite crear y editar colaboradores internos.",
  },
  {
    codigo: RBAC_PERMISSION.SECURITY_MANAGE,
    nombre: "Gestionar seguridad",
    moduloSistema: "Seguridad",
    descripcion: "Permite administrar perfiles, permisos y acceso.",
  },
] as const;

export const RBAC_ROLE_CATALOG = [
  {
    nombre: "SUPERADMINISTRADOR",
    descripcion: "Control total del sistema",
  },
  {
    nombre: "ADMINISTRADOR",
    descripcion: "Gestion operativa y administrativa",
  },
  {
    nombre: "ADMISIONISTA",
    descripcion: "Registro de admisiones y operacion de caja",
  },
  {
    nombre: "AUDITOR",
    descripcion: "Consulta y revision de informacion",
  },
  {
    nombre: "GERENCIA",
    descripcion: "Consulta ejecutiva y reportes",
  },
] as const;

export type RoleName = (typeof RBAC_ROLE_CATALOG)[number]["nombre"];

export const RBAC_ROLE_PERMISSION_MATRIX: Record<RoleName, PermissionCode[]> = {
  SUPERADMINISTRADOR: [...RBAC_ALL_PERMISSION_CODES],
  ADMINISTRADOR: RBAC_ALL_PERMISSION_CODES.filter(
    (code) => code !== RBAC_PERMISSION.SECURITY_MANAGE,
  ),
  ADMISIONISTA: [
    RBAC_PERMISSION.DASHBOARD_VIEW,
    RBAC_PERMISSION.SESSION_START,
    RBAC_PERMISSION.SESSION_CLOSE,
    RBAC_PERMISSION.ADMISION_VIEW,
    RBAC_PERMISSION.ADMISION_CREATE,
    RBAC_PERMISSION.PATIENT_CREATE,
    RBAC_PERMISSION.PATIENT_UPDATE,
    RBAC_PERMISSION.CAJA_VIEW,
    RBAC_PERMISSION.CAJA_OPEN,
    RBAC_PERMISSION.CAJA_CLOSE,
    RBAC_PERMISSION.MOVEMENT_VIEW,
  ],
  AUDITOR: [
    RBAC_PERMISSION.DASHBOARD_VIEW,
    RBAC_PERMISSION.ADMISION_VIEW,
    RBAC_PERMISSION.CAJA_VIEW,
    RBAC_PERMISSION.MOVEMENT_VIEW,
    RBAC_PERMISSION.REPORT_VIEW,
  ],
  GERENCIA: [
    RBAC_PERMISSION.DASHBOARD_VIEW,
    RBAC_PERMISSION.CAJA_VIEW,
    RBAC_PERMISSION.MOVEMENT_VIEW,
    RBAC_PERMISSION.REPORT_VIEW,
  ],
};