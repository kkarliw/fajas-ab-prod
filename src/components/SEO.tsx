import { Helmet } from "react-helmet-async";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  type?: string;
  image?: string;
  url?: string;
  jsonLd?: Record<string, any>;
};

export const SEO = ({
  title = "FAJAS AB | Fajas Colombianas de Alta Compresión & Moldeadoras",
  description = "Descubre la colección de FAJAS AB: fajas colombianas de alta compresión, brasieres postquirúrgicos, cinturillas y shorts moldeadores. Envíos a toda Colombia y pagos 100% seguros.",
  keywords = "fajas colombianas, fajas ab, fajas alta compresion, fajas postquirurgicas, fajas reductoras, fajas reloj de arena, brasier postoperatorio, cinturillas, fajas cartagena, fajas colombia",
  type = "website",
  image = "https://www.fajasab.com/assets/fajas-ab-logo.png",
  url = "https://www.fajasab.com",
  jsonLd,
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:site_name" content="FAJAS AB" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="es_CO" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
