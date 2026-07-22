import { PackageCheck } from "lucide-react";
import clsx from "clsx";

const steps = [
  { title: "Pedido recibido", desc: "Confirmamos tu compra y preparamos la orden." },
  { title: "Pedido enviado", desc: "Empacamos y despachamos con guía para rastreo." },
  { title: "Entrega completada", desc: "Confirmamos la entrega y cerramos tu servicio." },
];

type Props = {
  className?: string;
};

const OrderStatusSection = ({ className }: Props) => {
  return (
    <div className={clsx("border border-border bg-white/90 p-5 sm:p-6 lg:p-7 space-y-6", className)}>
      <div>
        <p className="eyebrow text-ink/50 mb-2 flex items-center gap-2">
          <PackageCheck size={14} />
          Estado de tu compra
        </p>
        <h3 className="font-display text-[26px] text-ink leading-tight mb-2">Seguimiento en tiempo real</h3>
        <p className="text-sm text-ink/70 leading-relaxed">
          Cada pedido avanza por estas tres etapas. Recibirás notificaciones por correo cuando cambiemos el estado y
          también lo verás reflejado aquí mismo en tu cuenta.
        </p>
      </div>

      <ul className="space-y-5">
        {steps.map((step, idx) => (
          <li key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="w-7 h-7 rounded-full border border-hairline bg-cream-2 flex items-center justify-center text-[11px] font-semibold">
                {idx + 1}
              </span>
              {idx < steps.length - 1 && <span className="h-10 w-px bg-hairline mt-1" aria-hidden />}
            </div>
            <div>
              <p className="font-display text-xl text-ink leading-tight">{step.title}</p>
              <p className="text-sm text-ink/70 leading-relaxed">{step.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[12px] text-ink/50">
        ¿Necesitas ayuda con tu guía o entrega? Escríbenos desde <span className="underline underline-offset-4">Contacto</span> o abre un
        PQR para recibir soporte prioritario.
      </p>
    </div>
  );
};

export default OrderStatusSection;
