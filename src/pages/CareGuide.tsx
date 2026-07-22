import LegalLayout from "@/components/LegalLayout";

const CareGuide = () => {
  return (
    <LegalLayout
      eyebrow="Guía"
      title="Recomendaciones de uso y cuidado"
      intro="En FAJAS AB diseñamos cada prenda para acompañarte con soporte, comodidad y confianza. Sigue estas recomendaciones para mantener la compresión ideal y prolongar la vida útil de tu faja."
    >
      <div className="space-y-10">
        <section>
          <h2>Uso del producto</h2>
          <ul>
            <li>Utiliza la faja siguiendo las indicaciones de tu especialista, especialmente en procesos postquirúrgicos.</li>
            <li>Elige siempre la talla correcta para evitar incomodidades o presión excesiva.</li>
            <li>Coloca la faja de forma progresiva, ajustándola al cuerpo sin forzar el material.</li>
            <li>Evita el uso prolongado durante los primeros días si estás en fase de adaptación.</li>
            <li>Si experimentas molestias, irritación o incomodidad, suspende su uso y consulta con un profesional.</li>
          </ul>
        </section>

        <section>
          <h2>Cuidado y lavado</h2>
          <ul>
            <li>Lava la faja a mano con agua fría.</li>
            <li>Utiliza jabón suave o neutro.</li>
            <li>No uses blanqueador ni productos abrasivos.</li>
            <li>No retuerzas la prenda para escurrir; presiona suavemente.</li>
            <li>Seca siempre a la sombra, en un lugar ventilado.</li>
            <li>No uses secadora ni la expongas directo al sol.</li>
            <li>No planches la prenda.</li>
          </ul>
        </section>

        <section>
          <h2>Recomendaciones adicionales</h2>
          <ul>
            <li>Lava tu faja después de cada uso para mantener la higiene.</li>
            <li>Evita el contacto con superficies ásperas que puedan dañar el tejido.</li>
            <li>No modifiques ni ajustes la prenda por cuenta propia.</li>
            <li>Guárdala en un lugar limpio y seco cuando no la estés usando.</li>
          </ul>
        </section>

        <section>
          <h2>¿Cómo ponerte tu faja FAJAS AB?</h2>
          <ol>
            <li><strong>Abre completamente la faja:</strong> desabrocha o abre todos los cierres para facilitar la colocación.</li>
            <li><strong>Introduce tus piernas:</strong> siéntate o apóyate, introduce ambas piernas y sube la faja hasta las rodillas.</li>
            <li><strong>Sube la faja progresivamente:</strong> deslízala poco a poco cubriendo muslos y caderas sin forzar el material.</li>
            <li><strong>Ajusta la zona de la cintura:</strong> alinea la prenda con tu cintura para lograr un fit uniforme.</li>
            <li><strong>Cierra los broches o cierre:</strong> hazlo de abajo hacia arriba; si hay varios niveles, inicia por el más suelto.</li>
            <li><strong>Acomoda la faja:</strong> alisa el material con las manos para evitar pliegues o dobleces.</li>
            <li><strong>Verifica el ajuste:</strong> debes sentir firmeza y soporte, nunca dolor excesivo.</li>
          </ol>
        </section>

        <section>
          <h2>Importante</h2>
          <ul>
            <li>No fuerces la faja si sientes demasiada presión.</li>
            <li>Elige siempre tu talla correcta.</li>
            <li>Para uso postquirúrgico, sigue las indicaciones de tu equipo médico.</li>
          </ul>
          <p>
            El cuidado adecuado mantiene la compresión, soporte y durabilidad de tu faja. En FAJAS AB combinamos tecnología, soporte y confianza para acompañar cada etapa de tu proceso.
          </p>
        </section>

        <section>
          <h2>Tip FAJAS AB</h2>
          <p>
            Un buen ajuste no solo moldea tu figura, también mejora tu experiencia de recuperación. Tómate el tiempo para colocar la faja con calma y disfruta del soporte premium para el que fue diseñada.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};

export default CareGuide;
