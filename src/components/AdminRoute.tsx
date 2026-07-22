import { Navigate, useLocation } from "react-router-dom";

const getSessionRole = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("ab_session_v1");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Real session from backend: { user: { role: "admin" }, accessToken }
    if (parsed.user?.role) return parsed.user.role;

    // Fallback: old mock session had role at root level
    if (parsed.role) return parsed.role;

    return null;
  } catch {
    return null;
  }
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const role = getSessionRole();

  if (role !== "admin") {
    // Redirect to the dedicated admin login page (not the public login)
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
