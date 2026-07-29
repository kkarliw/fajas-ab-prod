import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, ShieldCheck, Truck, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, formatCOP } from "@/context/CartContext";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { api } from "@/api";
import { SEO } from "@/components/SEO";
import { colombianDepartments, colombianCitiesByDepartment, streetTypePrefixes, OTHER_CITY_OPTION } from "@/data/colombiaData";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  couponCode?: string;
  shipping: "standard" | "express";
  acceptPrivacy: boolean;
  acceptPromotions: boolean;
};

const initialState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  department: "",
  couponCode: "",
  shipping: "standard",
  acceptPrivacy: false,
  acceptPromotions: false,
};

const checkoutSchema = z.object({
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
  phone: z
    .string()
    .regex(/^3\d{9}$/, "Ingresa un celular colombiano válido de 10 dígitos que empiece por 3"),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  department: z.string().min(1, "El departamento es obligatorio"),
  couponCode: z.string().optional(),
  shipping: z.enum(["standard", "express"]),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar las políticas de privacidad para continuar",
  }),
  acceptPromotions: z.boolean().default(false),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { cartId, items, subtotal, count, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shipping, setShipping] = useState<FormState["shipping"]>("standard");

  // Coupons and Settings States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>({
    standardShippingFee: 15000,
    expressShippingFee: 25000,
    freeShippingThreshold: undefined
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormState>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: initialState,
  });

  const selectedDept = watch("department");
  const isInternational = selectedDept?.includes("Internacional");
  const selectedCity = watch("city");
  const [customCityMode, setCustomCityMode] = useState(false);
  const prevDeptRef = useRef(selectedDept);
  const availableCities = selectedDept ? colombianCitiesByDepartment[selectedDept] || [] : [];
  const citiesWithOptions = availableCities.length ? [...availableCities, OTHER_CITY_OPTION] : [];

  const whatsappMessage = useMemo(() => {
    let msg = `¡Hola! Me interesa hacer un pedido con envío internacional.\n\n*Mi Carrito:*\n`;
    items.forEach(it => {
      msg += `- ${it.quantity}x ${it.name} (Talla: ${it.size}${it.color ? `, Color: ${it.color}` : ''})\n`;
    });
    msg += `\n*Total (sin envío):* ${formatCOP(subtotal)}\n\nQuisiera cotizar el envío a mi país, por favor.`;
    return encodeURIComponent(msg);
  }, [items, subtotal]);

  // Reset city when department changes (but not on first render / saved address load)
  useEffect(() => {
    if (prevDeptRef.current && prevDeptRef.current !== selectedDept) {
      setValue("city", "", { shouldValidate: false });
      setCustomCityMode(false);
    }
    prevDeptRef.current = selectedDept;
  }, [selectedDept, setValue]);

  // Switch to free-text mode when "Otra ciudad" is selected
  useEffect(() => {
    if (selectedCity === OTHER_CITY_OPTION) {
      setCustomCityMode(true);
      setValue("city", "", { shouldValidate: false });
    }
  }, [selectedCity, setValue]);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const selectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    const fullAddress = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ");
    setValue("address", fullAddress, { shouldValidate: true, shouldDirty: true });
    setValue("city", addr.city, { shouldValidate: true, shouldDirty: true });
    setValue("department", addr.department, { shouldValidate: true, shouldDirty: true });
    if (addr.phone) setValue("phone", addr.phone, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    api.auth.getMe().then((userData) => {
      if (userData) {
        if (userData.name) setValue("fullName", userData.name, { shouldValidate: true });
        if (userData.email) setValue("email", userData.email, { shouldValidate: true });
        if (userData.phone) setValue("phone", userData.phone, { shouldValidate: true });
      }
    }).catch(() => {});

    api.addresses.getAddresses().then((addrs) => {
      if (Array.isArray(addrs) && addrs.length > 0) {
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          selectSavedAddress(def);
        }
      }
    }).catch(() => {});

    api.settings.getStoreSettings().then(data => {
      if (data) setStoreSettings(data);
    }).catch(() => {});
  }, [setValue]);

  const handleApplyCoupon = async () => {
    const codeClean = couponInput.trim().toUpperCase();
    if (!codeClean) {
      setCouponError("Ingresa un código de cupón.");
      setAppliedCoupon(null);
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await api.coupons.validateCoupon({
        code: codeClean,
        cartTotal: subtotal * 100
      });

      if (res && res.valid) {
        setAppliedCoupon({
          id: res.couponId,
          code: res.code,
          type: res.type,
          value: res.discountCents / 100,
        });
        toast({
          title: "Cupón Aplicado",
          description: `Se aplicó el cupón ${res.code} exitosamente.`
        });
      }
    } catch (err: any) {
      setCouponError(err.message || "Error al validar el cupón.");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discount = appliedCoupon ? appliedCoupon.value : 0;

  let shippingCost = 0;
  if (subtotal > 0) {
    if (
      storeSettings.freeShippingThreshold !== undefined &&
      subtotal >= storeSettings.freeShippingThreshold &&
      shipping === "standard"
    ) {
      shippingCost = 0;
    } else {
      shippingCost = shipping === "express" ? storeSettings.expressShippingFee : storeSettings.standardShippingFee;
    }
  }

  const total = Math.max(0, subtotal - discount + shippingCost);

  const onSubmit = async (form: FormState) => {
    setSubmitting(true);
    try {
      if (!cartId) throw new Error("No cart available");

      const orderSummary = {
        cartId,
        customerName: form.fullName,
        email: form.email,
        phone: form.phone,
        shippingAddress: {
          addressLine1: form.address,
          city: form.city,
          department: form.department,
          country: "CO",
        },
        couponCode: appliedCoupon?.code
      };

      const res = await api.orders.initiateCheckout(orderSummary);
      const paymentData = res.paymentUrl || res.data?.paymentUrl;
      const orderData = res.order || res.data?.order;
      const reference = orderData?.reference || paymentData?.reference;
      const publicKey = paymentData?.publicKey || paymentData?.public_key || "pub_prod_R5wDypwYpfISMzlyXLCvWY9o9AXuknc6";

      if (!paymentData || !publicKey) {
        throw new Error("No se pudo obtener la configuración de pago de Wompi.");
      }

      // Save for CheckoutSuccess (including email for guest validation)
      localStorage.setItem("ab_last_order", JSON.stringify({
        reference,
        total: total,
        subtotal: subtotal,
        shipping: shippingCost,
        items: count,
        email: form.email
      }));

      if (!(window as any).WidgetCheckout) {
        throw new Error("El Widget de Wompi no ha cargado aún. Por favor intenta de nuevo en unos segundos.");
      }

      // Abrir el Widget de Wompi con los datos generados por el backend
      const checkout = new (window as any).WidgetCheckout({
        currency: paymentData.currency || "COP",
        amountInCents: paymentData.amountInCents,
        reference: paymentData.reference,
        publicKey: publicKey,
        signature: { integrity: paymentData.integritySignature },
        redirectUrl: `${window.location.origin}/checkout/success?ref=${encodeURIComponent(paymentData.reference)}`
      });

      checkout.open(async (result: any) => {
        const transaction = result?.transaction;
        const status = transaction?.status;

        if (transaction && status === "APPROVED") {
          setSuccess(true);
          localStorage.setItem("ab_last_order", JSON.stringify({
            reference: paymentData.reference,
            total,
            subtotal,
            shipping: shippingCost,
            items: items.reduce((acc, it) => acc + it.quantity, 0),
            email: form.email
          }));

          try {
            await api.orders.confirmPayment({
              reference: paymentData.reference,
              transactionId: transaction.id || `TX-${Date.now()}`,
              amountInCents: transaction.amount_in_cents || paymentData.amountInCents
            });
          } catch (e) {
            console.warn("Payment auto-confirmation warning:", e);
          }

          clear();
          navigate(`/checkout/success?ref=${encodeURIComponent(paymentData.reference)}`);
        } else if (status === "DECLINED" || status === "ERROR" || status === "VOIDED") {
          // Explicit rejection from bank/Nequi -> set DB status to declined
          try {
            await api.orders.declinePayment({
              reference: paymentData.reference,
              transactionId: transaction?.id || `TX-DECLINED-${Date.now()}`,
              amountInCents: transaction?.amount_in_cents || paymentData.amountInCents
            });
          } catch (e) {
            console.warn("Payment decline handler warning:", e);
          }
          navigate("/checkout/error?reason=payment_failed");
        } else {
          // Closed or cancelled by user
          try {
            await api.orders.declinePayment({
              reference: paymentData.reference,
              transactionId: transaction?.id || `TX-CANCELLED-${Date.now()}`,
              amountInCents: transaction?.amount_in_cents || paymentData.amountInCents
            });
          } catch (e) {
            console.warn("Payment cancel handler warning:", e);
          }
          navigate("/checkout/error?reason=cancelled");
        }
      });

    } catch (err: any) {
      alert("Hubo un error al procesar la orden: " + err.message);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
            role="status"
            aria-live="polite"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-foreground text-background flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Pedido confirmado
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-4 tracking-tight">
              Gracias por tu compra
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Te enviamos un correo con los detalles. Te llevaremos al resumen de tu pedido.
            </p>
            <Link
              to="/shop"
            className="inline-block bg-gold text-ink px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-gold/85 transition-colors"
            >
              Seguir comprando
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Carrito vacío
            </p>
            <h1 className="font-display text-3xl font-semibold mb-4 tracking-tight">
              No hay productos para finalizar
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Agrega piezas a tu carrito para continuar con tu compra.
            </p>
            <Link
              to="/shop"
            className="inline-block bg-gold text-ink px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-gold/85 transition-colors"
            >
              Ir a la tienda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <SEO 
        title="Finalizar Compra | FAJAS AB"
        description="Completa tu pedido de forma segura. Ingresa tus datos de envío y procesa tu pago a través de Wompi."
        url="https://www.fajasab.com/checkout"
      />
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft size={14} /> Seguir comprando
          </Link>

          <header className="mb-10 sm:mb-14">
            <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground mb-3 font-medium">
              Finalizar compra
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Checkout
            </h1>
          </header>

          <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
              <fieldset className="space-y-5">
                <legend className="font-display text-lg font-semibold mb-2">Contacto</legend>
                <Field
                  id="fullName"
                  label="Nombre completo"
                  autoComplete="name"
                  register={register("fullName")}
                  error={errors.fullName?.message}
                />
                <Field
                  id="email"
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  register={register("email")}
                  error={errors.email?.message}
                />
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="font-display text-lg font-semibold mb-2">Envío</legend>

                {savedAddresses.length > 0 && (
                  <div className="mb-6 space-y-3 p-4 bg-cream/40 rounded-2xl border border-black/5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                        Selecciona una dirección guardada:
                      </p>
                      <span className="text-[10px] text-gold-dark font-semibold">Toca para autocompletar</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => selectSavedAddress(addr)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 text-xs flex flex-col justify-between ${
                              isSelected
                                ? "border-gold bg-gold/10 shadow-sm ring-1 ring-gold/40"
                                : "border-black/5 hover:border-gold/40 bg-white"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-foreground font-display text-sm">{addr.name}</span>
                                {addr.isDefault && (
                                  <span className="bg-gold/20 text-gold-dark text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground line-clamp-1">{addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                              <p className="text-muted-foreground/80 text-[11px]">{addr.city}, {addr.department}</p>
                            </div>
                            {isSelected && (
                              <div className="mt-2 pt-2 border-t border-gold/20 flex items-center gap-1 text-gold-dark text-[10px] font-bold">
                                <CheckCircle2 size={13} /> Dirección Seleccionada
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Field
                  id="phone"
                  label="Teléfono"
                  type="tel"
                  autoComplete="tel"
                  placeholder="3XXXXXXXXX"
                  register={register("phone")}
                  error={errors.phone?.message}
                />
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label htmlFor="field-address" className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                      Dirección de Envío
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground/70">Atajo de vía:</span>
                      {streetTypePrefixes.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => {
                            const current = watch("address") || "";
                            if (!current.toLowerCase().startsWith(p.value.toLowerCase())) {
                              setValue("address", `${p.value} ${current}`.trim(), { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                          className="text-[10px] bg-cream-2 hover:bg-gold hover:text-white text-foreground px-2 py-0.5 rounded border border-black/5 font-semibold transition-colors"
                        >
                          + {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field
                    id="address"
                    label=""
                    autoComplete="street-address"
                    placeholder="Ej. Calle 45 # 12 - 34 Apto 201"
                    register={register("address")}
                    error={errors.address?.message}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <SelectField
                    id="department"
                    label="Departamento"
                    placeholder="Selecciona departamento"
                    options={colombianDepartments}
                    error={errors.department?.message}
                    register={register("department")}
                  />

                  {availableCities.length > 0 && !customCityMode && selectedCity !== OTHER_CITY_OPTION ? (
                    <div>
                      <SelectField
                        id="city"
                        label="Ciudad / Municipio"
                        placeholder="Selecciona ciudad"
                        options={citiesWithOptions}
                        error={errors.city?.message}
                        register={register("city")}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="field-city" className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
                          Ciudad / Municipio
                        </label>
                        {availableCities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCityMode(false);
                              setValue("city", "", { shouldValidate: true });
                            }}
                            className="text-[10px] text-gold-dark font-semibold hover:underline"
                          >
                            ← Volver a la lista
                          </button>
                        )}
                      </div>
                      <Field
                        id="city"
                        label=""
                        autoComplete="address-level2"
                        placeholder="Escribe tu ciudad o municipio"
                        register={register("city")}
                        error={errors.city?.message}
                      />
                    </div>
                  )}
                </div>

                {isInternational && (
                  <div className="bg-[#FAF8F5] border border-gold/40 p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs font-bold text-ink uppercase tracking-wider block">✈️ Envíos Internacionales (EE.UU., España, Latam, Otros)</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">Cotizamos la tarifa exacta del flete a tu ciudad y país directamente por WhatsApp para coordinar tu envío.</p>
                    </div>
                    <a
                      href={`https://wa.me/573002034943?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider shrink-0 transition-colors shadow-sm"
                    >
                      <MessageCircle size={16} /> Cotizar en WhatsApp
                    </a>
                  </div>
                )}
                <div>
                  <label htmlFor="field-couponCode" className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-2">
                    Cupón de Descuento
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="field-couponCode"
                      type="text"
                      placeholder="Ej. BIENVENIDA10"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      className="flex-1 bg-background border border-border px-4 py-3 text-sm transition-colors focus:outline-none focus:border-foreground"
                      disabled={validatingCoupon}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon}
                      className="bg-black text-white hover:bg-black/80 px-4 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {validatingCoupon ? "Validando..." : "Aplicar"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1.5 text-xs text-destructive">{couponError}</p>
                  )}
                  {appliedCoupon && (
                    <p className="mt-1.5 text-xs text-[#4E8B70] font-semibold">
                      ✓ Cupón aplicado: {appliedCoupon.code} ({formatCOP(appliedCoupon.value)} desc.)
                    </p>
                  )}
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="font-display text-lg font-semibold mb-2">Método de envío</legend>
                <ShippingOption
                  value="standard"
                  selected={shipping === "standard"}
                  onSelect={() => {
                    setShipping("standard");
                    setValue("shipping", "standard", { shouldValidate: true });
                  }}
                  title="Envío estándar"
                  desc="3 a 5 días hábiles"
                  cost={formatCOP(storeSettings.standardShippingFee)}
                />
                <ShippingOption
                  value="express"
                  selected={shipping === "express"}
                  onSelect={() => {
                    setShipping("express");
                    setValue("shipping", "express", { shouldValidate: true });
                  }}
                  title="Envío express"
                  desc="24 a 48 horas"
                  cost={formatCOP(storeSettings.expressShippingFee)}
                />
              </fieldset>

              <fieldset className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptPrivacy"
                      type="checkbox"
                      {...register("acceptPrivacy")}
                      className="w-4 h-4 border-border text-gold focus:ring-gold/30 accent-gold cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="acceptPrivacy" className="text-xs text-muted-foreground cursor-pointer select-none">
                      Acepto las <Link to="/privacy" target="_blank" className="text-foreground underline hover:text-gold transition-colors font-medium">políticas de privacidad</Link> y el tratamiento de mis datos personales. <span className="text-destructive">*</span>
                    </label>
                    {errors.acceptPrivacy && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.acceptPrivacy.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptPromotions"
                      type="checkbox"
                      {...register("acceptPromotions")}
                      className="w-4 h-4 border-border text-gold focus:ring-gold/30 accent-gold cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="acceptPromotions" className="text-xs text-muted-foreground cursor-pointer select-none">
                      Acepto recibir promociones, ofertas exclusivas y novedades por correo electrónico.
                    </label>
                  </div>
                </div>
              </fieldset>

              {isInternational ? (
                <a
                  href={`https://wa.me/573002034943?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-4 text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-[#20bd5a] transition-colors inline-flex items-center justify-center gap-2 shadow-sm rounded-none"
                >
                  <MessageCircle size={16} /> Coordinar Pago y Envío por WhatsApp
                </a>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !isValid}
                  className="w-full bg-gold text-ink py-4 text-[11px] tracking-[0.25em] uppercase font-semibold hover:bg-gold/85 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  aria-busy={submitting}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  {submitting ? "Procesando..." : `Pagar ${formatCOP(total)}`}
                </button>
              )}

              <p className="text-[11px] text-muted-foreground text-center inline-flex items-center justify-center gap-1.5 w-full">
                <ShieldCheck size={12} /> Pago 100% seguro · Encriptación SSL
              </p>
            </form>

            {/* Summary */}
            <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-28 h-fit">
              <div className="bg-cream-dark/40 border border-border p-6 sm:p-8 space-y-6">
                <h2 className="font-display text-lg font-semibold">Resumen del pedido</h2>
                <ul className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                    >
                      <div className="relative w-20 sm:w-24 aspect-[4/5] flex-shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-full h-full object-contain object-center p-1.5"
                        />
                        <span className="absolute top-1 right-1 bg-gold text-ink text-[11px] font-semibold min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-background">
                          {it.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-sm sm:text-[15px] font-display font-semibold leading-tight line-clamp-2">
                            {it.name}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground tracking-wider uppercase">
                          Talla {it.size}
                          </p>
                        </div>
                        <span className="mt-3 text-base font-semibold tabular-nums">
                          {formatCOP(it.price * it.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 pt-4 border-t border-border text-sm">
                  <Row label="Subtotal" value={formatCOP(subtotal)} />
                  {discount > 0 && (
                    <Row label="Descuento" value={`-${formatCOP(discount)}`} className="text-[#4E8B70]" />
                  )}
                  <Row
                    label="Envío"
                    value={shippingCost === 0 ? "Gratis" : formatCOP(shippingCost)}
                  />
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-display text-base font-semibold">Total</span>
                    <span className="font-display text-xl font-bold tabular-nums">
                      {formatCOP(total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Truck size={14} /> Envíos nacionales e internacionales
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Field = ({
  id,
  label,
  type = "text",
  error,
  autoComplete,
  placeholder,
  register,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
}) => (
  <div>
    <label htmlFor={`field-${id}`} className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-2">
      {label}
    </label>
    <input
      id={`field-${id}`}
      type={type}
      placeholder={placeholder}
      {...register}
      autoComplete={autoComplete}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full bg-background border px-4 py-3 text-base sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${
        error ? "border-destructive" : "border-border focus:border-foreground"
      }`}
    />
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({
  id,
  label,
  error,
  options,
  placeholder,
  register,
}: {
  id: string;
  label: string;
  error?: string;
  options: readonly string[] | string[];
  placeholder: string;
  register: UseFormRegisterReturn;
}) => (
  <div>
    <label htmlFor={`field-${id}`} className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-2">
      {label}
    </label>
    <select
      id={`field-${id}`}
      {...register}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full bg-background border px-4 py-3 text-base sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${
        error ? "border-destructive" : "border-border focus:border-foreground"
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
        {error}
      </p>
    )}
  </div>
);

const ShippingOption = ({
  selected,
  onSelect,
  title,
  desc,
  cost,
  value,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
  cost: string;
  value: string;
}) => (
  <label
    className={`flex items-center justify-between gap-4 p-4 border cursor-pointer transition-colors ${
      selected ? "border-foreground bg-cream-dark/30" : "border-border hover:border-foreground/50"
    }`}
  >
    <div className="flex items-center gap-3">
      <input
        type="radio"
        name="shipping"
        value={value}
        checked={selected}
        onChange={onSelect}
        className="w-4 h-4 accent-foreground"
      />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
    <span className="text-sm font-medium tabular-nums">{cost}</span>
  </label>
);

const Row = ({ label, value, className }: { label: string; value: string; className?: string }) => (
  <div className={`flex items-center justify-between ${className || ""}`}>
    <span className="text-muted-foreground">{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

export default Checkout;
