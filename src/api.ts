// URL base para la API
// En producción usará la ruta relativa /api (Vercel o cualquier host)
// En desarrollo usará localhost:5000
const isProduction = import.meta.env.PROD;

// En Vercel, la API está en el mismo dominio, así que usamos ruta relativa
export const API_BASE_URL = '';

// Función helper para hacer fetch
export const apiFetch = async (endpoint: string, options: Record<string, any> = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    },
  });
};