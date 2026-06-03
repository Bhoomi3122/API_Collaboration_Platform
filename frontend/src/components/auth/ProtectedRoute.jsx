import { Navigate } from "react-router-dom";
import { isAuthenticated, clearAuth } from "../../utils/auth";

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to login if user is not authenticated or token is expired
 */
function ProtectedRoute({ children }) {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Clear any stale auth data
    clearAuth();
    // Redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

