import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useCallback, useId } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Mode = "login" | "register" | "forgot";

const tabs: { id: Exclude<Mode, "forgot">; label: string }[] = [
  { id: "login", label: "Ingresar" },
  { id: "register", label: "Crear cuenta" },
];

/* ---------- Inputs ---------- */
type FieldProps = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Field = ({ id, label, icon: Icon, type = "text", error, inputRef, ...rest }: FieldProps) => {
  const errId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-foreground/70"
      >
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
        )}
        <input
          id={id}
          ref={inputRef}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className={`w-full h-12 ${Icon ? "pl-11" : "pl-4"} pr-4 bg-background border border-border rounded-md text-base sm:text-sm font-body text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/40`}
          {...rest}
        />
      </div>
      {error && (
        <p id={errId} role="alert" className="text-[11px] text-destructive font-body mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

const PasswordField = ({
  id,
  label,
  error,
  inputRef,
  ...rest
}: { id: string; label: string; error?: string; inputRef?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [show, setShow] = useState(false);
  const errId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-[0.18em] font-display font-semibold text-foreground/70"
      >
        {label}
      </label>
      <div className="relative group">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-gold pointer-events-none" />
        <input
          id={id}
          ref={inputRef}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className="w-full h-12 pl-11 pr-12 bg-background border border-border rounded-md text-base sm:text-sm font-body text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/40"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p id={errId} role="alert" className="text-[11px] text-destructive font-body mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

/* ---------- Component ---------- */
const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const liveRegionId = useId();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const isAuth = mode === "login" || mode === "register";
  const activeTab = mode === "register" ? "register" : "login";

  const headline =
    mode === "forgot"
      ? "Recupera tu acceso"
      : mode === "register"
      ? "Únete a la familia AB"
      : "Bienvenida de vuelta";

  const subline =
    mode === "forgot"
      ? "Te enviaremos un enlace para restablecer tu contraseña."
      : mode === "register"
      ? "Crea tu cuenta y disfruta beneficios exclusivos en cada compra."
      : "Accede a tus favoritos, pedidos y direcciones guardadas.";

  /* Focus management when mode changes */
  useEffect(() => {
    setErrors({});
    setTouched({});
    // Move focus to first field for screen-reader users; small delay for animation
    const t = window.setTimeout(() => {
      firstFieldRef.current?.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(t);
  }, [mode]);

  /* Tab keyboard navigation: ←/→ to switch */
  const onTabsKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isAuth) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setMode(activeTab === "login" ? "register" : "login");
      } else if (e.key === "Home") {
        e.preventDefault();
        setMode("login");
      } else if (e.key === "End") {
        e.preventDefault();
        setMode("register");
      }
    },
    [isAuth, activeTab],
  );

  /* Inline validators (per-field) */
  const validateField = useCallback(
    (field: "name" | "email" | "password", value: string): string => {
      if (field === "email") {
        if (!value) return "Ingresa tu correo electrónico.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Correo no válido.";
        return "";
      }
      if (field === "password") {
        if (!value) return "Ingresa tu contraseña.";
        if (mode === "register" && value.length < 8) return "Mínimo 8 caracteres.";
        return "";
      }
      if (field === "name") {
        if (!value.trim()) return "Ingresa tu nombre.";
        return "";
      }
      return "";
    },
    [mode],
  );

  const handleChange = (field: "name" | "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      if (touched[field]) {
        setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
      }
    };

  const handleBlur = (field: "name" | "email" | "password") =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched((t) => ({ ...t, [field]: true }));
      setErrors((prev) => ({ ...prev, [field]: validateField(field, e.target.value) }));
    };

  const [resetStep, setResetStep] = useState<"request" | "code">("request");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const validateAll = (): boolean => {
    const next: Record<string, string> = {};
    next.email = validateField("email", form.email);
    if (mode !== "forgot") next.password = validateField("password", form.password);
    if (mode === "register") next.name = validateField("name", form.name);
    if (mode === "forgot" && resetStep === "code") {
      if (resetCode.length !== 6) next.code = "El código debe tener 6 dígitos";
      if (!newPassword || newPassword.length < 8) next.newPassword = "Mínimo 8 caracteres";
    }

    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors(cleaned);
    setTouched({ name: true, email: true, password: true });
    return Object.keys(cleaned).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll() || submitting) return;

    setSubmitting(true);

    try {
      if (mode === "forgot") {
        const { forgotPassword, resetPassword } = await import("@/api/auth");
        if (resetStep === "request") {
          const res = await forgotPassword(form.email.trim());
          toast({
            title: "Revisa tu correo",
            description: res.message || "Hemos enviado un código de 6 dígitos a tu correo.",
          });
          setResetStep("code");
        } else {
          const res = await resetPassword({
            email: form.email.trim(),
            code: resetCode.trim(),
            newPassword
          });
          toast({
            title: "¡Contraseña actualizada!",
            description: res.message || "Ya puedes iniciar sesión con tu nueva contraseña.",
          });
          setMode("login");
          setResetStep("request");
          setResetCode("");
          setNewPassword("");
        }
      } else if (mode === "login") {
        const { login } = await import("@/api/auth");
        const result = await login(form.email.trim(), form.password);
        toast({
          title: "¡Bienvenida!",
          description: `Hola, ${result.user.name}.`,
        });
        const redirectTo = searchParams.get("redirect") || "/account";
        navigate(redirectTo);
      } else {
        const { register } = await import("@/api/auth");
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
        navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
      }
    } catch (err: any) {
      const msg = err?.message || "Ocurrió un error. Intenta nuevamente.";
      setErrors({ email: msg });
    } finally {
      setSubmitting(false);
    }
  };




  const motionProps = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-background via-cream to-cream-dark text-foreground flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden"
      aria-labelledby="login-heading"
    >
      {/* Skip-link for keyboard users */}
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-foreground focus:text-background focus:px-3 focus:py-2 focus:rounded focus:text-xs focus:font-display"
      >
        Saltar al formulario
      </a>

      {/* Decorative background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 sm:-top-40 sm:-right-40 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 sm:-bottom-40 sm:-left-40 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] rounded-full bg-gold-light/15 blur-3xl" />
      </div>

      {/* Live region for status announcements */}
      <div id={liveRegionId} role="status" aria-live="polite" className="sr-only">
        {submitting && "Procesando…"}
      </div>

      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[460px] bg-card/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-[0_25px_80px_-20px_hsl(var(--charcoal)/0.25)] p-6 sm:p-9"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.22em] uppercase font-display font-semibold text-muted-foreground hover:text-gold transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card px-1 py-0.5 -mx-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          Volver
        </Link>

        <div className="mt-6 sm:mt-7">
          <p className="text-[11px] tracking-[0.32em] uppercase text-gold font-display font-semibold mb-3">
            Cuenta AB
          </p>
          <AnimatePresence mode="wait">
            <motion.div key={`head-${mode}`} {...motionProps}>
              <h1
                id="login-heading"
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-[2.25rem] sm:text-[2.75rem] font-extrabold leading-[0.95] tracking-tight text-foreground outline-none"
              >
                {headline}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
                {subline}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {isAuth && (
          <div
            role="tablist"
            aria-label="Modo de acceso"
            onKeyDown={onTabsKeyDown}
            className="relative grid grid-cols-2 rounded-full bg-muted/70 p-1 mt-7 mb-6"
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-background shadow-md"
              animate={{ x: activeTab === "login" ? 0 : "100%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 30 }
              }
            />
            {tabs.map((t) => {
              const selected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="login-form"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setMode(t.id)}
                  className={`relative z-10 py-3 text-[11px] uppercase tracking-[0.18em] font-display font-bold rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-muted ${
                    selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={`form-${mode}`}
            id="login-form"
            role="tabpanel"
            aria-labelledby={isAuth ? `tab-${activeTab}` : undefined}
            noValidate
            {...motionProps}
            onSubmit={onSubmit}
            className={`space-y-4 ${isAuth ? "" : "mt-7"}`}
          >
            {mode === "register" && (
              <Field
                id="name"
                label="Nombre completo"
                icon={UserIcon}
                placeholder="Tu nombre"
                autoComplete="name"
                value={form.name}
                onChange={handleChange("name")}
                onBlur={handleBlur("name")}
                error={errors.name}
                inputRef={firstFieldRef}
              />
            )}

            <Field
              id="email"
              label="Correo electrónico"
              icon={Mail}
              type="email"
              inputMode="email"
              placeholder="hola@ejemplo.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              disabled={mode === "forgot" && resetStep === "code"}
              error={errors.email}
              inputRef={mode === "register" ? undefined : firstFieldRef}
            />

            {mode === "forgot" && resetStep === "code" && (
              <>
                <Field
                  id="resetCode"
                  label="Código de 6 dígitos"
                  icon={RefreshCw}
                  placeholder="123456"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                  error={errors.code}
                />
                <PasswordField
                  id="newPassword"
                  label="Nueva contraseña"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                />
              </>
            )}

            {mode !== "forgot" && (
              <PasswordField
                id="password"
                label="Contraseña"
                placeholder="••••••••"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={form.password}
                onChange={handleChange("password")}
                onBlur={handleBlur("password")}
                error={errors.password}
              />
            )}

            {mode === "login" && (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gold rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  />
                  <span className="font-body">Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setResetStep("request");
                  }}
                  className="font-display font-semibold text-foreground hover:text-gold transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card px-1 py-0.5"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 mt-2 inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-md text-[11px] tracking-[0.22em] uppercase font-display font-bold hover:bg-gold transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-foreground disabled:hover:shadow-none"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              {submitting
                ? "Procesando…"
                : mode === "login"
                ? "Entrar a mi cuenta"
                : mode === "register"
                ? "Crear mi cuenta"
                : resetStep === "request"
                ? "Enviar código"
                : "Cambiar contraseña"}
            </button>

            {mode === "forgot" && (
              <div className="flex flex-col gap-2 pt-1 text-center">
                {resetStep === "code" && (
                  <button
                    type="button"
                    onClick={() => setResetStep("request")}
                    className="text-xs text-gold-dark hover:underline font-body font-medium"
                  >
                    ¿No te llegó el código? Reenviar o cambiar correo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setResetStep("request");
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-body rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  ← Volver a iniciar sesión
                </button>
              </div>
            )}
          </motion.form>
        </AnimatePresence>

        {isAuth && (
          <p className="mt-6 sm:mt-7 text-center text-[11px] text-muted-foreground font-body leading-relaxed">
            Al continuar aceptas nuestros{" "}
            <Link
              to="/terms"
              className="text-foreground hover:text-gold transition-colors underline-offset-2 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              Términos
            </Link>{" "}
            y{" "}
            <Link
              to="/privacy"
              className="text-foreground hover:text-gold transition-colors underline-offset-2 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        )}
      </motion.section>
    </main>
  );
};

export default Login;
