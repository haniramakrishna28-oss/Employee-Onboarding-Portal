// Centralized API client wrapper

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // If sending FormData (file uploads), remove Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),
  post: (url, body, options) => request(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options })
};
