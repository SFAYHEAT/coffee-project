import Constants from "expo-constants";

// Detect backend IP automatically from Expo
function getBaseUrl() {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  const host = debuggerHost?.split(":")[0];

  if (host) {
    return `http://${host}:5000`;
  }

  // Change this for production later
  return "http://localhost:5000";
}

export const BASE_URL = getBaseUrl();

// API groups
export const API_URL = `${BASE_URL}/api/auth`;

export const AUTH_API = `${API_URL}/auth`;

export const PRODUCTS_API = `${API_URL}/products`;

export const ADMIN_PRODUCTS_API = `${API_URL}/admin/products`;

export const ORDERS_API = `${API_URL}/orders`;

export const USER_API = `${BASE_URL}/api/user`;

export const LOYALTY_API = `${BASE_URL}/api/loyalty`;

export const ANALYTICS_API = `${BASE_URL}/api/analytics`;

export const RECLAMATION_API = `${BASE_URL}/api/reclamation`;

export const TABLES_API = `${BASE_URL}/api/tables`;

export const ADMIN_TABLES_API = `${API_URL}/admin/tables`;

// Debug helper
console.log("BACKEND URL:", BASE_URL);
