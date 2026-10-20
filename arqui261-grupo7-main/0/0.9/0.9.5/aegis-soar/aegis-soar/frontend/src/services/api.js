const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  } catch {
    throw new Error("No se pudo conectar con el backend. Verifica que esté iniciado.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "La solicitud no pudo completarse.");
  }
  return data;
}

export const api = {
  dashboard: () => request("/dashboard"),
  events: () => request("/events"),
  incidents: () => request("/incidents"),
  playbooks: () => request("/playbooks"),
  blockedUsers: () => request("/blocked-users"),
  blockedIps: () => request("/blocked-ips"),
  actions: () => request("/actions"),
  simulateBruteForce: () => request("/events/brute-force", { method: "POST" }),
  simulateSqlInjection: () => request("/events/sql-injection", { method: "POST" }),
  simulateSqlInjectionDisabled: () =>
    request("/events/sql-injection-disabled", { method: "POST" }),
  togglePlaybook: (id) => request(`/playbooks/${id}/toggle`, { method: "PATCH" })
};

