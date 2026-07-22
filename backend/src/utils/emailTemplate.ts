export function getBaseEmailTemplate(title: string, contentHtml: string): string {
  const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F4F1EA;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1C1A17;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
      width: 100%;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
      line-height: 100%;
      text-decoration: none;
      display: block;
    }
    a {
      color: #C4A46A;
      text-decoration: none;
    }
    .wrapper {
      width: 100%;
      background-color: #F4F1EA;
      padding: 30px 10px;
    }
    .main-table {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #E2DCD0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 32px 20px;
      text-align: center;
      background-color: #1C1A17;
      border-bottom: 3px solid #C4A46A;
    }
    .brand-title {
      font-family: 'Georgia', serif;
      font-size: 28px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.25em;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-size: 10px;
      color: #C4A46A;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-top: 6px;
      font-weight: 600;
    }
    .content {
      padding: 36px 30px;
    }
    .title {
      font-family: 'Georgia', serif;
      font-size: 22px;
      font-weight: 600;
      color: #1C1A17;
      margin-top: 0;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }
    .text {
      font-size: 15px;
      line-height: 1.65;
      color: #33302B;
      margin: 0 0 20px 0;
    }
    .code-box {
      text-align: center;
      margin: 28px 0;
      background-color: #FAF8F5;
      border: 1px dashed #C4A46A;
      border-radius: 8px;
      padding: 20px;
    }
    .code-value {
      font-family: monospace, monospace;
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #1C1A17;
    }
    .order-card {
      background-color: #FAF8F5;
      border: 1px solid #EBE7DF;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-title {
      font-family: 'Georgia', serif;
      font-size: 16px;
      font-weight: 600;
      color: #1C1A17;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #E0D9CC;
      padding-bottom: 8px;
    }
    .item-row {
      padding: 10px 0;
      border-bottom: 1px solid #EEE9E0;
    }
    .item-name {
      font-weight: 600;
      font-size: 14px;
      color: #1C1A17;
    }
    .item-meta {
      font-size: 12px;
      color: #7A7060;
    }
    .item-price {
      float: right;
      font-weight: 600;
      font-size: 14px;
      color: #1C1A17;
    }
    .totals-row {
      padding: 6px 0;
      font-size: 14px;
      color: #555048;
    }
    .totals-label {
      float: left;
    }
    .totals-value {
      float: right;
      font-weight: 600;
    }
    .totals-grand {
      font-size: 16px;
      font-weight: 700;
      color: #1C1A17;
      border-top: 1px solid #D8D0C2;
      padding-top: 10px;
      margin-top: 6px;
    }
    .clearfix::after {
      content: "";
      clear: both;
      display: table;
    }
    .footer {
      padding: 28px 20px;
      text-align: center;
      background-color: #FAF8F5;
      border-top: 1px solid #EBE7DF;
    }
    .footer-text {
      font-size: 12px;
      color: #7A7060;
      line-height: 1.5;
      margin: 0 0 8px 0;
    }
    .social-links {
      margin-bottom: 16px;
    }
    .social-links a {
      color: #1C1A17;
      font-weight: 600;
      font-size: 12px;
      margin: 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .btn {
      display: inline-block;
      background-color: #1C1A17;
      color: #FFFFFF !important;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 12px;
      font-weight: 700;
      padding: 14px 32px;
      text-decoration: none !important;
      text-align: center;
      margin-top: 12px;
      border-radius: 6px;
      border: 1px solid #C4A46A;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table">
      <tr>
        <td class="header">
          <a href="${frontendUrl}" style="text-decoration: none;">
            <div style="text-align: center;">
              <h1 class="brand-title">FAJAS AB</h1>
              <div class="brand-tagline">FAJAS COLOMBIANAS DE ALTA COMPRESIÓN</div>
            </div>
          </a>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1 class="title">${title}</h1>
          ${contentHtml}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <div class="social-links">
            <a href="${frontendUrl}/shop">Colección</a> • 
            <a href="${frontendUrl}/account">Mi Cuenta</a> • 
            <a href="${frontendUrl}/contact">Contacto</a>
          </div>
          <p class="footer-text">© ${new Date().getFullYear()} FAJAS AB. Todos los derechos reservados.</p>
          <p class="footer-text" style="font-size: 11px; color: #9A9080;">Este es un correo automático enviado por FAJAS AB.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}
