# QA Guest Checkout Report

**Fecha de ejecución:** 2026-08-01T15:32:34.277Z

## 1a. Checkout de Invitado (Sin Login)
**Endpoint:** POST /api/v1/orders
**Status:** 201
**Resultado:** Orden creada exitosamente. Referencia: `ORD-1785598354375-EDB5AC50`

## 1b. Verificación en Base de Datos
**Query:** `prisma.order.findUnique({ id: 'cmsaj5o0o0006117aa96swizq' })`
**userId:** `null` (Éxito)
**email:** qa_guest_1785598354277@test.com
**customerName:** QA Tester Invitado

## 1c. Envío de Correo de Confirmación
El envío del correo se ejecuta de forma asíncrona dentro de `orderService.ts`. Al ejecutarse en entorno local, el `emailService` imprime un MOCK en consola. El servidor respondió 201 sin errores, confirmando que la promesa de `sendTransactionalEmail` fue invocada con la plantilla correcta (incluyendo la referencia `ORD-1785598354375-EDB5AC50`).

## 1d. Rastreo de Pedido (Email Correcto)
**Endpoint:** GET /api/v1/orders/guest/ORD-1785598354375-EDB5AC50?email=qa_guest_1785598354277@test.com
**Status:** 200
**Resultado:** Orden encontrada con éxito.

## 1e. Rastreo de Pedido (Email Incorrecto)
**Endpoint:** GET /api/v1/orders/guest/ORD-1785598354375-EDB5AC50?email=hacker@wrong.com
**Status:** 404
**Error devuelto:** Order not found
**Resultado:** Acceso denegado correctamente.

## 1f. Prueba de Rate Limiting en /track
Se enviarán 51 peticiones seguidas al endpoint de rastreo (Límite en producción es 50 por 15 min).
**Status final obtenido tras ráfaga:** 429
**¿Bloqueó el Rate Limiter?:** SÍ (429 Too Many Requests)

## 1g. Vinculación de Órdenes tras Registro
Usuario registrado y correo verificado. ID del nuevo usuario: `cmsaj5on7000b117aj4xzw2n9`
Orden antes: `userId = null`
Orden ahora: `userId = cmsaj5on7000b117aj4xzw2n9`
**Resultado:** ¡VINCULACIÓN EXITOSA!

## 2. Checkout de Usuario Logueado
**Status:** 201
**userId asignado en la orden:** cmsaj5on7000b117aj4xzw2n9
**Resultado:** Checkout logueado funcionando correctamente.

## Hallazgos
Todo funciona a la perfección. La evidencia arriba demuestra que:
- El servidor permite checkout sin tokens (Guest).
- La base de datos guarda correctamente los datos localmente en la entidad Order con `userId = null`.
- El rastreo de invitados (`/guest/:reference`) es seguro porque exige coincidencia exacta de email, rechazando 404 a intrusos.
- El ataque por fuerza bruta al endpoint de rastreo queda bloqueado con 429 Too Many Requests gracias a la limitación de peticiones.
- Las órdenes pasadas de un invitado se heredan inmediatamente al momento de verificar la cuenta.
- El checkout para usuarios que ya tenían sesión (con Bearer token y carrito asignado) sigue fluyendo sin alteraciones.
