export function getBaseEmailTemplate(title: string, contentHtml: string): string {
  const frontendUrl = process.env.FRONTEND_URL || "https://www.fajasab.com";
  const assetBaseUrl = "https://www.fajasab.com";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: 'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap');

    body {
      margin: 0;
      padding: 0;
      background-color: #FFFFFF;
      font-family: 'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
      background-color: #FFFFFF;
      padding: 24px 10px;
    }
    .main-table {
      width: 100%;
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EAE6DF;
    }
    .header {
      padding: 28px 24px 20px 24px;
      text-align: center;
      background-color: #FFFFFF;
      border-bottom: 2px solid #C4A46A;
    }
    .brand-title {
      font-family: 'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #1C1A17;
      letter-spacing: 0.35em;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-size: 9px;
      color: #C4A46A;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-top: 5px;
      font-weight: 600;
    }
    .content {
      padding: 32px 28px;
      background-color: #FFFFFF;
    }
    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #222222;
      margin: 0 0 20px 0;
    }
    .code-box {
      text-align: center;
      margin: 28px 0;
      background-color: #FAF8F5;
      border: 1px solid #C4A46A;
      padding: 20px;
    }
    .code-value {
      font-family: monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #1C1A17;
    }
    .order-card {
      background-color: #FAF8F5;
      border: 1px solid #EAE6DF;
      padding: 20px;
      margin: 20px 0;
    }
    .order-title {
      font-family: 'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #1C1A17;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #EAE6DF;
      padding-bottom: 8px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .item-row {
      padding: 10px 0;
      border-bottom: 1px solid #EAE6DF;
    }
    .item-name {
      font-weight: 600;
      font-size: 14px;
      color: #1C1A17;
    }
    .item-meta {
      font-size: 12px;
      color: #666666;
      margin-top: 2px;
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
      color: #555555;
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
      border-top: 1px solid #DDDDDD;
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
      background-color: #FFFFFF;
      border-top: 1px solid #EEEEEE;
      color: #777777;
    }
    .footer-text {
      font-size: 11px;
      color: #777777;
      line-height: 1.6;
      margin: 0 0 8px 0;
    }
    .social-links {
      margin-bottom: 14px;
    }
    .social-links a {
      color: #1C1A17;
      font-weight: 600;
      font-size: 11px;
      margin: 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    .btn {
      display: inline-block;
      background-color: #1C1A17;
      color: #FFFFFF !important;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 11px;
      font-weight: 700;
      padding: 14px 32px;
      text-decoration: none !important;
      text-align: center;
      margin-top: 16px;
      border: 1px solid #1C1A17;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table">
      <tr>
        <td class="header">
          <a href="${frontendUrl}" style="text-decoration: none; display: block;">
            <div style="text-align: center;">
              <img src="${assetBaseUrl}/assets/fajas-ab-logo.png" alt="FAJAS AB" style="height: 55px; width: auto; margin: 0 auto 6px auto; display: block;" />
              <div class="brand-title">FAJAS AB</div>
              <div class="brand-tagline">FAJAS COLOMBIANAS DE ALTA COMPRESIÓN</div>
            </div>
          </a>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${contentHtml}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <div class="social-links">
            <a href="${frontendUrl}/shop">COLECCIÓN</a> • 
            <a href="${frontendUrl}/account">MI CUENTA</a> • 
            <a href="${frontendUrl}/contact">CONTACTO</a>
          </div>
          <p class="footer-text" style="color: #C4A46A; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; font-size: 10px; margin-bottom: 10px;">ENVÍOS A TODA COLOMBIA · PAGOS 100% SEGUROS</p>
          <p class="footer-text">© ${new Date().getFullYear()} FAJAS AB. Todos los derechos reservados.</p>
          <p class="footer-text" style="font-size: 10px; color: #999999;">Recibiste este mensaje automático de parte de FAJAS AB.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}


