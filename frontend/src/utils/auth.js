/**
 * Authentication utility functions
 */

/**
 * Get token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired
  return !isTokenExpired(token);
};

/**
 * Decode JWT token payload
 */
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
};

/**
 * Validate and clean expired tokens
 */
export const validateAndCleanToken = () => {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    clearAuth();
    return false;
  }
  return !!token;
};

