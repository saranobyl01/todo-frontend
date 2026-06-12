export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.details || errorMsg;
    } catch {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }

  // PostgREST returns 204 No Content for updates/deletes, and 201 Created with
  // an empty body for inserts (unless Prefer: return=representation is sent).
  // Avoid calling .json() on an empty body to prevent "Unexpected end of JSON input".
  const contentType = response.headers.get('content-type') || '';
  const contentLength = response.headers.get('content-length');
  const hasBody =
    contentType.includes('application/json') &&
    contentLength !== '0' &&
    response.status !== 204;

  if (!hasBody) return null;

  const data = await response.json();
  return data;
};
