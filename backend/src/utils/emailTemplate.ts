export function getBaseEmailTemplate(title: string, contentHtml: string): string {
  // Use active Hostinger preview domain for images if main domain is not yet active/migrated
  const frontendUrl = process.env.FRONTEND_URL || "https://wheat-gerbil-544508.hostingersite.com";
  const assetBaseUrl = "https://wheat-gerbil-544508.hostingersite.com";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Georgia, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F6F3EE;
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
      background-color: #F6F3EE;
      padding: 40px 12px;
    }
    .main-table {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #EAE4DC;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(28, 26, 23, 0.06);
    }
    .header {
      padding: 38px 24px 32px 24px;
      text-align: center;
      background-color: #141311;
      border-bottom: 2px solid #D4A96A;
    }
    .brand-title {
      font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 600;
      color: #FFFFFF;
      letter-spacing: 0.35em;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-size: 9px;
      color: #D4A96A;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      margin-top: 8px;
      font-weight: 500;
    }
    .content {
      padding: 42px 36px;
      background-color: #FFFFFF;
    }
    .text {
      font-size: 15px;
      line-height: 1.7;
      color: #2C2925;
      margin: 0 0 22px 0;
    }
    .code-box {
      text-align: center;
      margin: 32px 0;
      background-color: #FAF7F2;
      border: 1px solid #D4A96A;
      border-radius: 4px;
      padding: 24px;
    }
    .code-value {
      font-family: monospace;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.3em;
      color: #1C1A17;
    }
    .order-card {
      background-color: #FAF7F2;
      border: 1px solid #EAE4DC;
      border-radius: 4px;
      padding: 24px;
      margin: 24px 0;
    }
    .order-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 17px;
      font-weight: 600;
      color: #1C1A17;
      margin-top: 0;
      margin-bottom: 14px;
      border-bottom: 1px solid #E4DDD2;
      padding-bottom: 10px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .item-row {
      padding: 12px 0;
      border-bottom: 1px solid #EAE4DC;
    }
    .item-name {
      font-weight: 600;
      font-size: 14px;
      color: #1C1A17;
    }
    .item-meta {
      font-size: 12px;
      color: #7A7060;
      margin-top: 2px;
    }
    .item-price {
      float: right;
      font-weight: 600;
      font-size: 14px;
      color: #1C1A17;
    }
    .totals-row {
      padding: 8px 0;
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
      padding-top: 12px;
      margin-top: 8px;
    }
    .clearfix::after {
      content: "";
      clear: both;
      display: table;
    }
    .footer {
      padding: 32px 24px;
      text-align: center;
      background-color: #141311;
      border-top: 1px solid #282522;
      color: #A0988C;
    }
    .footer-text {
      font-size: 11px;
      color: #8C8478;
      line-height: 1.6;
      margin: 0 0 10px 0;
    }
    .social-links {
      margin-bottom: 18px;
    }
    .social-links a {
      color: #D4A96A;
      font-weight: 600;
      font-size: 11px;
      margin: 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    .btn {
      display: inline-block;
      background-color: #1C1A17;
      color: #D4A96A !important;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 11px;
      font-weight: 700;
      padding: 15px 36px;
      text-decoration: none !important;
      text-align: center;
      margin-top: 16px;
      border-radius: 2px;
      border: 1px solid #D4A96A;
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
              <img src="${assetBaseUrl}/assets/fajas-ab-logo.png" alt="FAJAS AB" style="height: 68px; width: auto; margin: 0 auto 8px auto; display: block;" />
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
          <p class="footer-text" style="color: #D4A96A; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; font-size: 10px; margin-bottom: 12px;">ENVÍOS A TODA COLOMBIA · PAGOS 100% SEGUROS</p>
          <p class="footer-text">© ${new Date().getFullYear()} FAJAS AB. Todos los derechos reservados.</p>
          <p class="footer-text" style="font-size: 10px; color: #666056;">Recibiste este mensaje automático de parte de FAJAS AB.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

