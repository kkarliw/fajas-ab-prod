import LegalLayout from "@/components/LegalLayout";

const ShippingReturns = () => (
  <LegalLayout
    title="Envíos y Garantías"
    intro="En Fajas Ab nos comprometemos a ofrecer un proceso de envío rápido y confiable, además de garantizar la calidad superior de todos nuestros productos."
  >
    <section className="space-y-6">
      <h2>POLÍTICA DE ENVÍOS</h2>
      
      <h3>1. Cobertura</h3>
      <p>
        Realizamos envíos a todo Colombia y a nivel internacional.
      </p>

      <h3>2. Tiempos de entrega</h3>
      <p>Los tiempos de entrega estimados son:</p>
      <ul>
        <li>Colombia: 2 a 5 días hábiles</li>
        <li>Envíos internacionales: 5 a 12 días hábiles</li>
      </ul>
      <p>Estos tiempos comienzan a contar una vez el pago ha sido confirmado.</p>

      <h3>3. Costos de envío</h3>
      <p>
        El costo de envío se calcula automáticamente al momento de la compra y puede variar según la ubicación del cliente y el destino del pedido.
      </p>

      <h3>4. Procesamiento de pedidos</h3>
      <p>
        Todos los pedidos son procesados en el menor tiempo posible. Una vez despachado, el cliente recibirá la información correspondiente para el seguimiento de su envío (si aplica).
      </p>

      <h3>5. Posibles retrasos</h3>
      <p>
        Aunque trabajamos con operadores logísticos confiables, pueden presentarse retrasos por factores externos como:
      </p>
      <ul>
        <li>Alta demanda o temporadas especiales</li>
        <li>Condiciones climáticas</li>
        <li>Novedades logísticas o de transporte</li>
        <li>Procesos aduaneros en envíos internacionales</li>
      </ul>

      <h3>6. Gestión de retrasos</h3>
      <p>En caso de presentarse un retraso:</p>
      <ul>
        <li>Nuestro equipo realizará seguimiento con la transportadora</li>
        <li>Se mantendrá informado al cliente sobre el estado del envío</li>
        <li>Se brindará soporte oportuno hasta la entrega del pedido</li>
      </ul>
      <p>
        Fajas Ab no se hace responsable por retrasos ocasionados por terceros (transportadoras o autoridades aduaneras), pero siempre acompañará al cliente durante el proceso.
      </p>

      <h3>7. Información de envío</h3>
      <p>
        Es responsabilidad del cliente proporcionar correctamente sus datos de entrega. En caso de errores en la dirección o datos incompletos, los tiempos de entrega pueden verse afectados.
      </p>

      <h3>8. Entregas fallidas</h3>
      <p>
        Si el intento de entrega no se concreta por ausencia del cliente o datos incorrectos: el pedido podrá ser reprogramado según condiciones de la transportadora, y costos adicionales de reenvío podrán aplicar.
      </p>

      <h3>9. Confirmación de entrega</h3>
      <p>
        Una vez el pedido sea entregado, se entenderá como completado el proceso logístico.
      </p>

      <h3>10. Atención al cliente</h3>
      <p>
        Para cualquier duda o novedad con tu envío, nuestro equipo de soporte estará disponible para ayudarte durante todo el proceso.
      </p>
    </section>

    <hr className="my-10 border-hairline" />

    <section className="space-y-6">
      <h2>POLÍTICA DE GARANTÍA</h2>
      
      <h3>1. Alcance de la garantía</h3>
      <p>
        Todos nuestros productos cuentan con garantía exclusivamente por defectos de fabricación.
      </p>
      <p>Esta garantía cubre:</p>
      <ul>
        <li>Fallas en costuras</li>
        <li>Defectos estructurales del producto</li>
        <li>Imperfecciones de fábrica que afecten su funcionalidad</li>
      </ul>

      <h3>2. Condiciones para solicitar la garantía</h3>
      <p>Para hacer efectiva la garantía, el cliente deberá:</p>
      <ul>
        <li>Reportar el inconveniente dentro de las primeras 24 horas posteriores a la entrega del producto</li>
        <li>Presentar evidencia del defecto (fotografías o video)</li>
        <li>Conservar el producto sin uso, con etiquetas y empaque original</li>
      </ul>

      <h3>3. Exclusiones de la garantía</h3>
      <p>La garantía no aplica en los siguientes casos:</p>
      <ul>
        <li>Uso inadecuado o indebido del producto</li>
        <li>Desgaste normal por uso</li>
        <li>Daños ocasionados por lavado incorrecto</li>
        <li>Alteraciones o modificaciones del producto</li>
        <li>Selección incorrecta de talla</li>
      </ul>

      <h3>4. Proceso de evaluación</h3>
      <p>
        Cada solicitud será evaluada por nuestro equipo de control de calidad. Fajas Ab se reserva el derecho de determinar si el caso cumple con las condiciones de garantía.
      </p>

      <h3>5. Solución</h3>
      <p>En caso de ser aprobada la garantía, Fajas Ab podrá, según disponibilidad:</p>
      <ul>
        <li>Reemplazar el producto sin costo adicional</li>
        <li>Ofrecer una solución equivalente</li>
      </ul>

      <h3>6. Tiempos de respuesta</h3>
      <p>
        Las solicitudes serán atendidas en el menor tiempo posible, garantizando un proceso ágil y transparente.
      </p>

      <h3>7. Costos asociados</h3>
      <p>
        En caso de aprobación de la garantía, Fajas Ab asumirá los costos correspondientes al reemplazo del producto.
      </p>

      <h3>8. Canales de atención</h3>
      <p>
        El cliente deberá realizar la solicitud a través de nuestros canales oficiales, proporcionando la información requerida para la validación del caso.
      </p>

      <h3>9. Aceptación</h3>
      <p>
        Al realizar una compra en Fajas Ab, el cliente acepta las condiciones establecidas en esta Política de Garantía.
      </p>
    </section>
  </LegalLayout>
);

export default ShippingReturns;
