# Reporte Adicional: Rate Limiting y Correo de Producción

## 1. Rate Limiting en POST /api/v1/orders
Límite configurado en producción: 10 órdenes por 15 minutos.
**Resultado Ráfaga (15 peticiones):** Último status HTTP obtenido fue 429.
**¿Bloqueó el ataque?:** SÍ (429 Too Many Requests)

## 2. Prueba de Bandeja de Entrada Real (Ambiente Prod con Resend)
**Correo enviado a la cuenta del admin:** `fajasabcol@gmail.com`
**Orden de prueba creada:** `ORD-1785599609926-1BA98806`

> El correo ha sido enviado utilizando el API Key de Producción de Resend. Debería estar ahora mismo en la bandeja de entrada de fajasabcol@gmail.com.

