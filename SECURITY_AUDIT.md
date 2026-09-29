# Informe de revisión de seguridad OWASP

**Aplicación:** `platfotm-pet-nfc-antigravity`  
**Fecha:** 2026-09-13  
**Alcance:** revisión estática de autenticación, autorización, APIs, validación, acceso a datos, gestión de secretos y configuración visible en el repositorio.  
**Nota:** no se realizaron cambios en el código ni pruebas de penetración dinámicas.

## Resumen ejecutivo

Se identificaron **3 hallazgos de alto riesgo**, **3 de riesgo medio** y varios controles pendientes de verificar. El riesgo principal es que las operaciones de administración comprueban una sesión, pero no un rol `admin` explícito. Además, la aplicación contiene credenciales de seed previsibles y permite iniciar NextAuth con un secreto por defecto inseguro si no se configura la variable de entorno correspondiente.

## Hallazgos prioritarios

### SEC-001: Falta de autorización explícita por rol administrativo

- **Severidad:** Alta
- **OWASP:** A01:2021 - Broken Access Control
- **Evidencia:** `src/app/api/pets/[id]/route.ts`
- **Descripción:** `PUT` y `DELETE` solamente verifican que exista una sesión. El modelo `User` no contiene un campo de rol y las rutas no validan que la sesión corresponda al usuario administrador autorizado.
- **Impacto:** mientras exista una única cuenta administradora y no haya alta de usuarios, el riesgo práctico es menor. Si se añade otra cuenta autenticada, esa cuenta podría modificar o eliminar cualquier perfil porque la aplicación no distingue `admin` de otros usuarios.
- **Recomendación:** definir y hacer cumplir un rol administrativo en servidor para todas las operaciones CRUD. No confiar en ocultar rutas ni en controles del frontend. Si el producto seguirá teniendo una sola cuenta, aplicar igualmente una allowlist de identidad administrativa en servidor y documentar el proceso de provisión.

### SEC-002: Endpoint administrativo sin aislamiento de rol

- **Severidad:** Alta
- **OWASP:** A01:2021 - Broken Access Control; A02:2021 - Cryptographic Failures
- **Evidencia:** `src/app/api/pets/route.ts`, función `GET`; `src/app/admin/page.tsx`
- **Descripción:** `GET /api/pets` y la página administrativa consultan todos los perfiles, lo cual es coherente con un panel centralizado de administración, pero solo se comprueba que haya sesión y no que el usuario tenga rol `admin`.
- **Impacto:** cualquier futura cuenta autenticada podría consultar todos los perfiles y sus datos de contacto. La página pública `/pets/[slug]`, en cambio, es intencional y forma parte del producto: debe permanecer accesible sin autenticación con los campos públicos previstos.
- **Recomendación:** proteger `GET /api/pets` y todas las páginas `/admin` con autorización de rol. Mantener separada la consulta pública por `slug` y devolver desde ella únicamente los campos deliberadamente públicos.

### SEC-003: Secreto de NextAuth inseguro por defecto

- **Severidad:** Alta en producción
- **OWASP:** A02:2021 - Cryptographic Failures; A05:2021 - Security Misconfiguration
- **Evidencia:** `src/app/api/auth/[...nextauth]/route.ts`
- **Descripción:** la configuración usa `process.env.NEXTAUTH_SECRET || "super_secret_for_development_only"`.
- **Impacto:** si `NEXTAUTH_SECRET` no está definido en producción, las sesiones JWT se firman con un valor público y predecible. Esto puede permitir falsificación o manipulación de tokens, dependiendo de la configuración efectiva del despliegue.
- **Recomendación:** exigir `NEXTAUTH_SECRET` en producción y fallar al arrancar si falta. Generar un secreto aleatorio, largo y exclusivo por entorno. No mantener un fallback funcional en despliegues productivos.

### SEC-004: Credenciales administrativas previsibles en el seed

- **Severidad:** Alta si el seed se ejecuta en un entorno accesible
- **OWASP:** A07:2021 - Identification and Authentication Failures; A05:2021 - Security Misconfiguration
- **Evidencia:** `prisma/seed.ts`
- **Descripción:** el seed crea `admin@demo.com` con la contraseña `admin123`. Aunque `requiresPasswordChange` se establece en `true`, la credencial temporal es pública y fácil de adivinar.
- **Impacto:** acceso inicial no autorizado si el seed se ejecuta en staging, producción o una instalación expuesta. La protección depende de que el cambio de contraseña se complete correctamente.
- **Recomendación:** no usar credenciales conocidas. Recibir el usuario y la contraseña inicial desde un mecanismo seguro o generar una contraseña aleatoria de un solo uso, almacenando únicamente su hash.

## Hallazgos de riesgo medio

### SEC-005: Protección CSRF no verificada en operaciones de cambio

- **Severidad:** Media
- **OWASP:** A CSRF dentro de A01:2021 - Broken Access Control
- **Evidencia:** `src/app/api/auth/change-password/route.ts` y `src/app/api/pets/[id]/route.ts`
- **Descripción:** las rutas mutantes aceptan solicitudes basadas principalmente en la cookie de sesión. No se observa una validación explícita de `Origin`/`Referer` ni un token CSRF propio.
- **Impacto:** un sitio externo podría intentar inducir a un navegador autenticado a ejecutar cambios, especialmente si la política de cookies o el despliegue no bloquean el escenario.
- **Recomendación:** verificar la protección CSRF efectiva de NextAuth y del despliegue; para operaciones sensibles añadir comprobación de origen y/o token CSRF. Revisar `SameSite`, `Secure` y `HttpOnly` en producción.

### SEC-006: Falta de limitación de intentos en autenticación y cambio de contraseña

- **Severidad:** Media
- **OWASP:** A07:2021 - Identification and Authentication Failures
- **Evidencia:** `src/app/api/auth/[...nextauth]/route.ts` y `src/app/api/auth/change-password/route.ts`
- **Descripción:** no se observa rate limiting, bloqueo progresivo, CAPTCHA adaptativo ni auditoría de intentos fallidos.
- **Impacto:** facilita ataques de fuerza bruta y abuso automatizado contra credenciales y cambios de contraseña.
- **Recomendación:** aplicar rate limiting por IP y cuenta, registrar eventos de autenticación sin almacenar contraseñas, y considerar bloqueo progresivo o MFA para cuentas administrativas.

### SEC-007: Política de contraseñas insuficiente

- **Severidad:** Media
- **OWASP:** A07:2021 - Identification and Authentication Failures
- **Evidencia:** `src/app/api/auth/change-password/route.ts`; `src/services/UserService.ts`
- **Descripción:** la contraseña nueva solo exige una longitud mínima de 8 caracteres. No se exige longitud mayor para cuentas administrativas, ni se comprueba reutilización de contraseña o compromiso conocido.
- **Impacto:** contraseñas débiles pueden resistir peor ataques de diccionario, especialmente sin rate limiting.
- **Recomendación:** adoptar una política basada en longitud, preferiblemente 12 o más caracteres para cuentas administrativas, permitir gestores de contraseñas y añadir comprobación contra contraseñas comprometidas cuando sea viable.

## Observaciones adicionales

### Validación de entrada

La validación con Zod en los endpoints de mascotas es un control positivo. El `slug` está restringido a minúsculas, números y guiones, y existen límites de longitud. Aun así, conviene validar también formato y normalización de teléfonos, y mantener límites de tamaño del cuerpo de la petición para reducir abuso.

### Inyección y consultas a base de datos

No se observó SQL construido mediante concatenación. Las consultas revisadas usan Prisma y parámetros estructurados, por lo que no se identificó una inyección SQL directa en el alcance analizado.

### Perfiles públicos y datos sensibles

La ruta pública de perfiles es un comportamiento esperado: funciona como frontend accionable para contactar al propietario mediante teléfono o WhatsApp. No se considera una vulnerabilidad que el perfil sea público. El riesgo depende de que el administrador publique voluntariamente esos datos y de que la consulta pública no exponga campos internos adicionales.

### Exposición de errores y logs

Las respuestas de error no devuelven el objeto de excepción al cliente, lo cual es positivo. Sin embargo, se usa `console.error` para registrar errores sin una política visible de redacción o correlación. Debe comprobarse que nunca se incluyan credenciales, tokens o datos personales en esos errores en producción.

### Carga de imágenes remotas

`photoUrl` acepta cualquier URL válida y la interfaz la renderiza como imagen remota. No implica por sí mismo ejecución de JavaScript, pero puede causar seguimiento de usuarios, contenido no confiable o SSRF si en el futuro se procesa la URL en el servidor. Conviene usar una allowlist de dominios o almacenamiento propio si el requisito lo permite.

### Cabeceras de seguridad

No se observan en `next.config.ts` cabeceras explícitas como CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` o una política de permisos. Deben verificarse las cabeceras finales del entorno desplegado antes de cerrar esta revisión.

## Priorización recomendada

1. Corregir autorización por propietario/rol en `PUT` y `DELETE`.
2. Filtrar `GET /api/pets` y el panel por el usuario autorizado.
3. Eliminar el fallback de `NEXTAUTH_SECRET` y validar secretos obligatorios en producción.
4. Retirar las credenciales previsibles del seed.
5. Añadir rate limiting, controles CSRF verificables y una política de contraseñas más robusta.
6. Verificar cabeceras de seguridad, cookies de sesión, exposición de errores y configuración del despliegue.

## Limitaciones

Esta revisión fue estática y no incluyó:

- pruebas de explotación contra un entorno desplegado;
- revisión de variables de entorno reales o del proveedor de hosting;
- análisis de dependencias con una base de vulnerabilidades;
- verificación de cookies y cabeceras HTTP efectivamente emitidas;
- pruebas de concurrencia, abuso o recuperación de cuenta.
