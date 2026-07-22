# Ecommerce Blueprint & Technical Memo

## 1. Arquitectura General
- **Frontend**: Vite + React + Tailwind/Shadcn (UI pública + mini panel admin).
- **Backend**: Node.js + Express corriendo en Hostinger (Aplicaciones Node.js) con ORM (Sequelize/Prisma) sobre MySQL.
- **Base de datos**: MySQL (Hostinger) con modelos para usuarios, productos, variantes, inventario, pedidos, cupones, PQR y contenido.
- **Pagos**: Wompi (widget/web checkout) integrado desde backend (firmas, referencias, webhooks).
- **Emails**: Nodemailer + SMTP corporativo de Hostinger (o servicio externo: Resend/Brevo) para correos transaccionales.
- **Búsqueda**: Algolia (API) o Full-Text Search de MySQL si el catálogo <1.000 productos.
- **Medios**: Cloudinary recomendado para imágenes (alternativa: almacenamiento local servido por Express).
- **Soporte/logística**: Integraciones con WhatsApp Business, chat widget y APIs de transportadoras para tarifas/tracking.

```
graph LR
  subgraph Frontend
    A[Vite + React (UI)]
    A1[Home/Shop/Product]
    A2[Checkout]
    A3[Mini Panel Admin]
  end
  subgraph Backend
    B[Express.js API]
    B1[Auth & Roles]
    B2[Catálogo]
    B3[Pedidos & Wompi]
    B4[Cupones]
    B5[PQR]
  end
  subgraph Infra
    C[(MySQL)]
    D[Wompi]
    E[Nodemailer/SMTP]
    F[Algolia o MySQL FTS]
    G[Cloudinary]
  end
  A -->|Fetch/Axios| B
  A3 -->|JWT| B1
  B -->|ORM| C
  B3 --> D
  D -->|Webhook| B3
  B --> E
  A --> F
  B --> G
```

## 2. Flujos Esenciales
### 2.1 Catálogo & Variantes
1. Admin crea/edita producto vía panel (React) → `POST /products`.
2. Backend guarda producto + variantes + imágenes (solo URLs) en MySQL.
3. Frontend lista productos con filtros avanzados; búsqueda usa Algolia o `MATCH ... AGAINST` de MySQL.

### 2.2 Checkout + Pagos Wompi
1. Usuario envía carrito → `POST /payments/initiate`.
2. Backend genera referencia única, calcula firma SHA-256 con `WOMPI_INTEGRITY_SECRET`, crea orden "PENDIENTE" y devuelve datos.
3. Frontend lanza widget/web checkout de Wompi con referencia y firma.
4. Wompi envía webhook `transaction.updated` al backend.
5. Backend valida firma del webhook:
   - `APPROVED`: marca orden "PAGADO", descuenta stock (solo aquí), envía correos.
   - `DECLINED/ERROR`: marca "RECHAZADO", deja stock intacto.

### 2.3 Cupones
1. Admin crea códigos (porcentaje/fijo, expiración, usos) → `POST /coupons`.
2. Checkout ejecuta `POST /coupons/validate` y aplica descuento sobre subtotal.
3. Uso queda registrado para control y reportes.

### 2.4 PQR
1. Usuario envía formulario → `POST /pqr`.
2. Backend crea ticket (estado "Abierto"), asigna radicado y dispara email a cliente + soporte.
3. Panel admin gestiona tickets (cambios de estado, respuestas templadas).

### 2.5 Emails
- Eventos: orden recibida, pago aprobado/fallido, pedido enviado, PQR recibido/resuelto, bienvenida con cupón, recuperación de clave.
- Transport: Nodemailer + SMTP Hostinger (ventas@tudominio.com) o proveedor externo.

## 3. Modelo de Datos (resumen)
- `users` (rol, credenciales, contacto)
- `products` (slug, nombre, descripción, precios)
- `product_variants` (color, talla, SKU, stock)
- `product_images` (URL, alt, orden; almacenadas en Cloudinary o servidor)
- `orders` + `order_items`
- `coupons` + `coupon_usages`
- `tickets_pqr`
- `banners` / `content_blocks`

### 3.1 Diagrama ER (Mermaid)
```mermaid
erDiagram
  users ||--o{ orders : "place"
  users ||--o{ tickets_pqr : "create"
  products ||--o{ product_variants : "has"
  products ||--o{ product_images : "has"
  products ||--o{ order_items : "referenced"
  product_variants ||--o{ order_items : "selected"
  orders ||--o{ order_items : "contain"
  coupons ||--o{ orders : "applied"
  coupons ||--o{ coupon_usages : "track"
  orders ||--o{ coupon_usages : "record"
  orders ||--o{ tickets_pqr : "relate"
  tickets_pqr ||--o{ ticket_messages : "log"

  users {
    int id PK
    varchar email UNIQUE
    varchar password_hash
    enum role
    varchar name
  }
  products {
    int id PK
    varchar slug UNIQUE
    varchar name
    text description
    decimal base_price
    enum status
  }
  product_variants {
    int id PK
    int product_id FK
    varchar sku UNIQUE
    varchar color
    varchar size
    int stock
    decimal price_override
    varchar image_url
  }
  product_images {
    int id PK
    int product_id FK
    varchar url
    varchar alt
    int sort_order
  }
  orders {
    int id PK
    int user_id FK NULL
    varchar reference UNIQUE
    varchar email
    enum status
    decimal subtotal
    decimal discount_total
    decimal shipping_total
    decimal grand_total
    int coupon_id FK NULL
    json shipping_address
    json billing_address
    enum payment_status
  }
  order_items {
    int id PK
    int order_id FK
    int product_id FK
    int variant_id FK NULL
    int quantity
    decimal unit_price
    decimal total_price
  }
  coupons {
    int id PK
    varchar code UNIQUE
    enum type
    decimal value
    decimal min_amount
    datetime starts_at
    datetime ends_at
    int usage_limit
    int usage_count
    enum status
  }
  coupon_usages {
    int id PK
    int coupon_id FK
    int order_id FK
    int user_id FK NULL
    datetime used_at
  }
  tickets_pqr {
    int id PK
    int user_id FK NULL
    int order_id FK NULL
    enum type
    enum status
    enum priority
    varchar subject
    text message
    datetime created_at
    datetime updated_at
  }
  ticket_messages {
    int id PK
    int ticket_id FK
    enum sender_type
    text body
    datetime created_at
  }
```

### 3.2 Diccionario de Datos
| Tabla | Campo | Tipo | Reglas / Notas |
| --- | --- | --- | --- |
| `users` | `role` | ENUM(`admin`,`ops`,`support`,`marketing`,`customer`) | Define permisos del panel. |
|  | `password_hash` | VARCHAR(255) | BCrypt; requerido si no es social login. |
|  | `status` | ENUM(`active`,`blocked`) | Controla acceso. |
| `products` | `slug` | VARCHAR(120) UNIQUE | SEO friendly; usado en URLs públicas. |
|  | `status` | ENUM(`draft`,`published`,`archived`) | Define visibilidad. |
|  | `base_price` | DECIMAL(10,2) | Precio sin descuentos. |
|  | `metadata` | JSON | Materiales, etiquetas, SEO. |
| `product_variants` | `sku` | VARCHAR(80) UNIQUE | Usado para inventario y WMS. |
|  | `price_override` | DECIMAL(10,2) NULL | Si existe, reemplaza `base_price`. |
|  | `stock` | INT UNSIGNED | Nunca negativo; actualiza solo tras webhook aprobado. |
|  | `attributes` | JSON | Color, talla, largo, etc. |
| `product_images` | `url` | VARCHAR(255) | Guardar solo URL (Cloudinary/host). |
|  | `sort_order` | INT | Controla orden de galería. |
| `orders` | `reference` | VARCHAR(80) UNIQUE | Mismo valor enviado a Wompi. |
|  | `status` | ENUM(`pending`,`processing`,`fulfilled`,`cancelled`) | Flujo logístico. |
|  | `payment_status` | ENUM(`pending`,`approved`,`declined`,`refunded`) | Derivado de Wompi. |
|  | `shipping_address`/`billing_address` | JSON | Validado en backend; guardar snapshot. |
|  | `channel` | ENUM(`web`,`admin`) | Origen de la orden. |
| `order_items` | `unit_price` | DECIMAL(10,2) | Copia del precio al momento de compra. |
|  | `variant_snapshot` | JSON | Mantiene atributos aun si cambian luego. |
| `coupons` | `type` | ENUM(`percentage`,`fixed`,`free_shipping`) | Define cálculo. |
|  | `value` | DECIMAL(10,2) | % (0-100) o monto COP. |
|  | `conditions` | JSON | Reglas (categorías, primera compra, mínimo). |
|  | `usage_limit`/`usage_count` | INT | Controla redenciones totales. |
| `coupon_usages` | `user_id` | FK NULL | NULL si compra invitado. |
|  | `order_id` | FK | Auditoría cruzada. |
| `tickets_pqr` | `type` | ENUM(`peticion`,`queja`,`reclamo`,`sugerencia`,`felicitacion`) | Tipificación legal. |
|  | `priority` | ENUM(`low`,`normal`,`high`) | SLA interno. |
|  | `channel` | ENUM(`webform`,`whatsapp`,`email`) | Fuente. |
| `ticket_messages` | `sender_type` | ENUM(`customer`,`agent`,`system`) | Controla visibilidad. |
|  | `attachments` | JSON | URLs evidencias. |
| `banners`/`content_blocks` | `placement` | ENUM(`home_hero`,`promo_bar`,`popup`,`blog`) | Ubicación front. |
|  | `payload` | JSON | Copys, CTA, vigencias. |

## 4. Especificación de Endpoints

| Módulo | Método / Path | Auth | Descripción |
| --- | --- | --- | --- |
| **Auth** | `POST /api/auth/login` | Público | Devuelve JWT + refresh. |
|  | `POST /api/auth/register` | Público | Crea usuario y dispara email bienvenida. |
|  | `POST /api/auth/refresh` | Público | Renueva tokens. |
| **Catálogo público** | `GET /api/products` | Público | Filtros: categoría, precio, stock, búsqueda FTS. |
|  | `GET /api/products/:slug` | Público | Incluye variantes, imágenes, relacionados. |
|  | `GET /api/categories` | Público | Alimenta navbar/filtros. |
| **Admin catálogo** | `POST /api/admin/products` | Admin | Crear producto + variantes (multipart). |
|  | `PATCH /api/admin/products/:id` | Admin/Marketing | Actualizar atributos, estado, orden gala. |
| **Carrito / Checkout** | `POST /api/cart/estimate` | Público | Calcula subtotal + envío según destino. |
|  | `POST /api/payments/initiate` | Público | Genera firma Wompi, guarda orden `pending`. |
|  | `POST /api/payments/webhook` | Wompi | Valida `transaction.updated`, cambia estado y stock. |
|  | `GET /api/orders/:reference` | JWT (o token invitado) | Consulta detalle y tracking. |
| **Cupones** | `POST /api/coupons/validate` | Público | Recibe `code`, valida reglas, responde descuento. |
|  | `POST /api/admin/coupons` | Admin/Marketing | CRUD de códigos y condiciones. |
| **PQR** | `POST /api/pqr` | Público | Crea ticket, devuelve radicado. |
|  | `GET /api/admin/pqr` | Soporte | Listado + filtros + SLA. |
|  | `POST /api/admin/pqr/:id/reply` | Soporte | Registra mensaje, envía correo/WhatsApp. |
| **Contenido** | `GET /api/content/blocks?placement=` | Público | Render dinámico home/promo. |
|  | `POST /api/admin/content` | Admin/Marketing | CRUD banners, popups, blog. |
| **Logística** | `GET /api/shipping/rates` | Público | Tarifas por ciudad/CP. |
|  | `POST /api/admin/orders/:id/tracking` | Ops | Agrega guía y notifica. |

**Reglas API**
- Middleware JWT + roles para `/api/admin/*`.
- Validaciones con Zod/Joi y respuestas estandarizadas `{ code, message, details }`.
- CORS limitado al dominio del frontend.
- Rate limiting para rutas sensibles (`/payments/initiate`, `/pqr`).
- Versionado `/api/v1` y logs estructurados.

## 5. Flujos de Estado y Triggers

### 5.1 Órdenes & Pagos
| Evento | Orden | Pago | Acción |
| --- | --- | --- | --- |
| Checkout iniciado | `pending` | `pending` | Crear orden + email "recibimos tu pedido". |
| Webhook `APPROVED` | `processing` | `approved` | Descontar stock, email confirmación, alertar ops. |
| Pedido enviado | `fulfilled` | `approved` | Registrar tracking, email + WhatsApp. |
| Webhook `DECLINED/ERROR` | `cancelled` | `declined` | Email aviso, liberar stock. |
| Reembolso | `cancelled` | `refunded` | Nota crédito + email soporte. |

### 5.2 PQR / Soporte
| Estado | SLA sugerido | Acciones |
| --- | --- | --- |
| `abierto` | 4h hábiles | Email con radicado + asignación. |
| `en_proceso` | 24h | Recordatorio al cliente, log de mensajes. |
| `escalado` | 24h | Notificación a supervisor/legal. |
| `resuelto` | — | Email de cierre + encuesta. |

### 5.3 Automatizaciones / Notificaciones
- `trigger_order_received`: correo cliente + alerta ops.
- `trigger_payment_approved`: correo cliente, actualización dashboard.
- `trigger_order_shipped`: correo + WhatsApp + actualización en cuenta.
- `trigger_coupon_welcome`: al crear cuenta, enviar cupón con expiración.
- `trigger_pqr_created/resolved`: emails para cliente y soporte, registro en `ticket_messages`.
- `trigger_stock_low`: alerta interna cuando `stock < threshold`.

## 6. Consideraciones Técnicas Clave
1. **Búsqueda**: Meilisearch no es viable en plan compartido; usa Algolia o Full-Text MySQL según tamaño del catálogo.
2. **Imágenes**: almacena archivos en Cloudinary para performance y solo guarda URLs en MySQL; si usas almacenamiento local, expón `/uploads` como estático.
3. **Stock**: jamás restar inventario antes del webhook Wompi; la orden se crea "PENDIENTE" y solo al recibir `APPROVED` se descuenta stock y se marcan envíos.
4. **Variables de entorno**: configurar WOMPI keys, SMTP, DB en el panel de Hostinger (Aplicaciones Node.js → Variables).
5. **Seguridad**: HTTPS obligatorio, CORS restringido al dominio, JWT firmado para admin, logs de actividad.

## 7. Roadmap Propuesto
1. Definir esquema MySQL y migraciones.
2. Implementar auth + CRUD de catálogo/variantes/imágenes.
3. Construir endpoints de carrito/checkout y módulo de cupones.
4. Integrar Wompi (init + webhook) y probar en sandbox.
5. Configurar sistema de emails transaccionales.
6. Crear panel admin (React) con roles.
7. Agregar búsqueda avanzada, logística y soporte (WhatsApp/chat).
8. Documentar procesos operativos y checklist de lanzamiento.

Este documento sirve como referencia técnica y memoria para todo el equipo (humano + IA) antes de iniciar la implementación.
