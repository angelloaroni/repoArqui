const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CONNECTION_MESSAGE =
  'No se pudo conectar con el servidor de EventFlow. Verifique que el backend se encuentre en ejecución.';

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(body?.message || 'No fue posible completar la operación.');
    }

    return body;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(CONNECTION_MESSAGE);
    }
    throw error;
  }
}

function toQueryString(filters) {
  const query = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      query.set(key, value);
    }
  });
  const result = query.toString();
  return result ? `?${result}` : '';
}

export const api = {
  getHealth: () => request('/health'),
  getDashboard: () => request('/dashboard'),
  getPublishers: () => request('/publishers'),
  getSubscribers: () => request('/subscribers'),
  createSubscriber: (subscriber) =>
    request('/subscribers', {
      method: 'POST',
      body: JSON.stringify(subscriber),
    }),
  toggleSubscriber: (id) =>
    request(`/subscribers/${id}/toggle`, { method: 'PATCH' }),
  toggleFailure: (id) =>
    request(`/subscribers/${id}/failure`, { method: 'PATCH' }),
  getEvents: (filters = {}) => request(`/events${toQueryString(filters)}`),
  getEvent: (id) => request(`/events/${id}`),
  publishEvent: (event) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
  getHistory: (filters = {}) => request(`/history${toQueryString(filters)}`),
  seedDemo: () => request('/demo/seed', { method: 'POST' }),
  resetDemo: () => request('/demo/reset', { method: 'DELETE' }),
  runScenario: (scenario, action) =>
    request(`/demo/scenarios/${scenario}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
};

export function announceDataChange() {
  window.dispatchEvent(new CustomEvent('eventflow:data-changed'));
}

