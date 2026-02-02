const API_BASE_URL = "http://localhost:3000"; // depois vamos subir o Node aqui

function getToken() {
  return localStorage.getItem("token");
}

export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
