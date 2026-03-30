# RBAC checklist operativo

## Objetivo

Cerrar la Fase 7 con pruebas manuales por perfil, validando:

- visibilidad de menu y paginas
- botones y acciones visibles
- autorizacion real en backend
- mensajes de acceso denegado
- protecciones anti auto-bloqueo en Seguridad y Colaboradores

## Preparacion previa

Antes de ejecutar la prueba:

1. Tener la seed de RBAC aplicada.
2. Tener al menos un usuario por perfil base:
   - SUPERADMINISTRADOR
   - ADMINISTRADOR
   - ADMISIONISTA
   - AUDITOR
   - GERENCIA
3. Tener un perfil personalizado de prueba.
4. Tener una caja activa de prueba, contratos, categorias, servicios y tarifas vigentes.
5. Tener al menos una admision registrada para probar anulacion y consulta.

## Menu esperado por perfil base

### SUPERADMINISTRADOR

Debe ver:

- Dashboard
- Admisiones
- Caja
- Movimientos
- Parametrizacion completa
- Colaboradores
- Seguridad

### ADMINISTRADOR

Debe ver:

- Dashboard
- Admisiones
- Caja
- Movimientos
- Parametrizacion completa
- Colaboradores

No debe ver:

- Seguridad

### ADMISIONISTA

Debe ver:

- Dashboard
- Admisiones
- Caja
- Movimientos

No debe ver:

- Parametrizacion
- Colaboradores
- Seguridad

### AUDITOR

Debe ver:

- Dashboard
- Admisiones
- Caja
- Movimientos

No debe ver:

- Parametrizacion
- Colaboradores
- Seguridad

### GERENCIA

Debe ver:

- Dashboard
- Caja
- Movimientos

No debe ver:

- Admisiones
- Parametrizacion
- Colaboradores
- Seguridad

## Casos por perfil

### 1. SUPERADMINISTRADOR

Validar:

- entra a todos los modulos
- puede crear perfil
- puede editar perfil
- puede activar y desactivar permisos
- puede crear, editar e inactivar colaboradores
- puede abrir, cerrar y reabrir caja
- puede registrar y anular admisiones

Resultado esperado:

- ningun bloqueo por permisos
- auditoria visible en Seguridad para cambios hechos

### 2. ADMINISTRADOR

Validar:

- entra a Dashboard, Admisiones, Caja, Movimientos, Parametrizacion y Colaboradores
- no entra a Seguridad
- puede gestionar contratos, categorias, servicios, tarifas y cajas
- puede crear colaboradores
- puede registrar y anular admisiones
- puede abrir, cerrar y reabrir caja

Resultado esperado:

- bloqueo claro al intentar entrar a /seguridad
- resto de modulos operativos funcionando

### 3. ADMISIONISTA

Validar:

- entra a Dashboard, Admisiones, Caja y Movimientos
- puede iniciar y cerrar sesion operativa
- puede registrar pacientes
- puede editar pacientes
- puede registrar admisiones
- puede abrir y cerrar caja

No debe poder:

- reabrir caja
- anular admisiones
- entrar a Parametrizacion
- entrar a Colaboradores
- entrar a Seguridad

Resultado esperado:

- en Admisiones debe ver el flujo de registro
- si existe historial reciente, puede consultarlo pero no debe ver accion de anulacion

### 4. AUDITOR

Validar:

- entra a Dashboard, Admisiones, Caja y Movimientos
- puede consultar informacion

No debe poder:

- registrar admisiones
- anular admisiones
- abrir caja
- cerrar caja
- reabrir caja
- editar parametrizacion
- gestionar colaboradores
- gestionar seguridad

Resultado esperado:

- ve listados y estados
- no ve botones operativos o recibe acceso denegado amable

### 5. GERENCIA

Validar:

- entra a Dashboard, Caja y Movimientos
- no entra a Admisiones
- no entra a Parametrizacion
- no entra a Colaboradores
- no entra a Seguridad

Resultado esperado:

- vista de consulta solamente
- sin acciones operativas

### 6. PERFIL PERSONALIZADO

Crear un perfil de prueba con estos permisos:

- dashboard.ver
- admisiones.ver
- admisiones.anular
- caja.ver
- movimientos.ver

Validar:

- ve Dashboard, Admisiones, Caja y Movimientos
- en Admisiones no puede registrar, pero si puede consultar y anular
- no puede editar pacientes ni crear admisiones
- no ve Parametrizacion, Colaboradores ni Seguridad

Resultado esperado:

- el modulo responde exactamente a la combinacion de permisos asignada

## Casos finos de Seguridad

### Caso A. No quitar el ultimo acceso activo a seguridad desde perfiles

Pasos:

1. identificar el ultimo rol que sostiene a usuarios activos con seguridad.gestionar
2. intentar dejarlo INACTIVO
3. intentar quitarle seguridad.gestionar

Resultado esperado:

- el sistema debe bloquear la accion
- debe mostrar mensaje claro

### Caso B. No auto-quitarse el ultimo acceso activo a seguridad desde colaboradores

Pasos:

1. entrar con el ultimo usuario activo con acceso a seguridad
2. intentar cambiarle el rol a uno sin seguridad.gestionar
3. intentar inactivarlo

Resultado esperado:

- el sistema debe bloquear la accion
- debe mostrar mensaje claro indicando que dejaria el acceso a seguridad sin respaldo

### Caso C. Dejar pasar el cambio cuando existe respaldo

Pasos:

1. crear o activar un segundo usuario con seguridad.gestionar
2. repetir los cambios del Caso A y Caso B sobre el primero

Resultado esperado:

- el sistema debe permitir la operacion
- la auditoria debe registrar el cambio

## Casos finos de Admisiones

### Registro inmediato en historial

Pasos:

1. registrar una admision nueva
2. revisar la seccion de admisiones recientes sin hacer refresh manual

Resultado esperado:

- la admision debe aparecer enseguida en el historial reciente

### Anulacion con reverso

Pasos:

1. anular una admision desde Admisiones
2. revisar Admisiones recientes
3. revisar Caja
4. revisar Movimientos

Resultado esperado:

- la admision pasa a ANULADA
- queda motivo y usuario de anulacion
- Caja refleja ajuste en totalCobros y saldoEsperado cuando aplica
- Movimientos muestra el REVERSO_ANULACION

## Cierre de prueba

La Fase 7 puede darse por cerrada cuando:

- todos los perfiles base pasan su checklist
- el perfil personalizado respeta exactamente sus permisos
- Seguridad bloquea los auto-bloqueos criticos
- Admisiones registra y anula correctamente
- no queda ninguna ruta sensible accesible sin permiso real