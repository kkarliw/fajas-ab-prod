import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";

// Stub the toast hook so submissions don't try to render toasts in JSDOM.
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn(), toasts: [] }),
}));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Login />
    </MemoryRouter>,
  );

describe("Login — accessibility & keyboard navigation", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("renders the heading and both auth tabs", () => {
    renderLogin();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it("marks the active tab and is operable with arrow keys", () => {
    renderLogin();
    const loginTab = screen.getByRole("tab", { name: /ingresar/i });
    const registerTab = screen.getByRole("tab", { name: /crear cuenta/i });

    expect(loginTab).toHaveAttribute("aria-selected", "true");
    expect(registerTab).toHaveAttribute("aria-selected", "false");

    // ArrowRight switches to register
    fireEvent.keyDown(loginTab.parentElement!, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /crear cuenta/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Home returns to login
    fireEvent.keyDown(registerTab.parentElement!, { key: "Home" });
    expect(screen.getByRole("tab", { name: /ingresar/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("activates a tab on click and updates the form panel", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("tab", { name: /crear cuenta/i }));
    expect(await screen.findByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it("shows inline validation errors after blur and clears them on valid input", () => {
    renderLogin();
    const email = screen.getByLabelText(/correo electrónico/i);

    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.blur(email);
    expect(screen.getByRole("alert")).toHaveTextContent(/correo no válido/i);
    expect(email).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(email, { target: { value: "ok@example.com" } });
    expect(email).toHaveAttribute("aria-invalid", "false");
  });

  it("submits and reports all required errors at once when the form is empty", async () => {
    renderLogin();
    const submit = screen.getByRole("button", { name: /entrar a mi cuenta/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/^contraseña$/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("toggles password visibility via the show/hide button", () => {
    renderLogin();
    const password = screen.getByLabelText(/^contraseña$/i) as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: /mostrar contraseña/i });

    expect(password.type).toBe("password");
    fireEvent.click(toggle);
    expect(password.type).toBe("text");
    expect(
      screen.getByRole("button", { name: /ocultar contraseña/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("navigates to forgot-password mode and back", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /olvidaste tu contraseña/i }));
    expect(
      await screen.findByRole("button", { name: /enviar enlace/i }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByLabelText(/^contraseña$/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /volver a iniciar sesión/i }));
    expect(
      await screen.findByRole("button", { name: /entrar a mi cuenta/i }),
    ).toBeInTheDocument();
  });

  it("exposes a skip link, live region and labelled tab panel", () => {
    renderLogin();
    expect(screen.getByText(/saltar al formulario/i)).toBeInTheDocument();
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", "tab-login");
  });

  it("shows an accessible OAuth error with a Reintentar button after a failed provider attempt", async () => {
    renderLogin();
    const googleBtn = screen.getByRole("button", { name: /continuar con google/i });
    fireEvent.click(googleBtn);

    // Wait for the simulated failure to surface
    const alert = await screen.findByRole("alert", {}, { timeout: 2000 });
    expect(alert).toHaveTextContent(/google/i);

    const retry = within(alert).getByRole("button", { name: /reintentar/i });
    expect(retry).toBeInTheDocument();
    expect(googleBtn).toHaveAttribute("aria-describedby");
  });
});
