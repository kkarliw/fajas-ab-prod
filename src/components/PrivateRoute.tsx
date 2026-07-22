import { Navigate, useLocation } from "react-router-dom";

type SessionShape = {
  token?: string;
  accessToken?: string;
  email?: string;
  user?: unknown;
};

const hasValidSession = () => {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem("ab_session_v1");
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed.trim().length > 0;

    if (parsed && typeof parsed === "object") {
      return Boolean(parsed.token || parsed.accessToken || parsed.email || parsed.user);
    }
    return false;
  } catch {
    return false;
  }
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  if (!hasValidSession()) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
