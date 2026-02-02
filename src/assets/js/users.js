import { apiRequest } from "./api.js";
import { $, setText, showAlert, hideAlert, validateEmail } from "./utils.js";

// Para aula: “banco” local (até ligar no backend)
function loadUsers() {
  return JSON.parse(localStorage.getItem("demoUsers") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("demoUsers", JSON.stringify(users));
}

function render(users) {
  const tbody = $("#usersTbody");
  tbody.innerHTML = "";

  users.forEach((u) => {
    const tr = document.createElement("tr");

    const statusBadge = document.createElement("span");
    statusBadge.className = `badge ${u.active ? "active" : "inactive"}`;
    statusBadge.textContent = u.active ? "ATIVO" : "INATIVO";

    tr.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td>
        <button class="btn-ghost" data-action="edit">Editar</button>
        <button class="btn-danger" data-action="toggle">${u.active ? "Inativar" : "Ativar"}</button>
      </td>
    `;

    // Proteção XSS: texto sempre via textContent
    const tds = tr.querySelectorAll("td");
    setText(tds[0], u.name);
    setText(tds[1], u.email);
    tds[2].appendChild(statusBadge);

    tr.querySelector('[data-action="edit"]').addEventListener("click", () => fillForm(u));
    tr.querySelector('[data-action="toggle"]').addEventListener("click", () => toggleStatus(u.id));

    tbody.appendChild(tr);
  });
}

function fillForm(user) {
  $("#userId").value = user.id;
  $("#name").value = user.name;
  $("#email").value = user.email;
  $("#profile").value = user.profile;
  $("#active").value = user.active ? "1" : "0";
  $("#password").value = "";
  $("#password").placeholder = "Deixe em branco para manter a senha";
}

function clearForm() {
  $("#userId").value = "";
  $("#name").value = "";
  $("#email").value = "";
  $("#profile").value = "USER";
  $("#active").value = "1";
  $("#password").value = "";
  $("#password").placeholder = "Senha (será criptografada no backend)";
}

function toggleStatus(id) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx].active = !users[idx].active;
  saveUsers(users);
  render(users);
}

export function initUsersPage() {
  const form = $("#userForm");
  const alertEl = $("#alertUsers");
  const logoutBtn = $("#logoutBtn");
  const searchEl = $("#search");

  hideAlert(alertEl);

  // Carrega lista inicial (simulação)
  const users = loadUsers();
  render(users);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const id = $("#userId").value || crypto.randomUUID();
    const name = $("#name").value.trim();
    const email = $("#email").value.trim().toLowerCase();
    const profile = $("#profile").value;
    const active = $("#active").value === "1";
    const password = $("#password").value;

    if (name.length < 3) return showAlert(alertEl, "warn", "Nome deve ter pelo menos 3 caracteres.");
    if (!validateEmail(email)) return showAlert(alertEl, "warn", "E-mail inválido.");

    try {
      // Quando houver backend:
      // - CREATE: POST /api/users
      // - UPDATE: PUT /api/users/:id
      // Obs: senha será criptografada no backend (bcrypt), não aqui.
      //
      // await apiRequest("/api/users", { method: "POST", body: { name, email, profile, active, password } });

      // Simulação local
      const list = loadUsers();
      const exists = list.find((u) => u.email === email && u.id !== id);
      if (exists) throw new Error("Já existe usuário com este e-mail.");

      const idx = list.findIndex((u) => u.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], name, email, profile, active };
      } else {
        list.push({ id, name, email, profile, active });
      }

      saveUsers(list);
      render(list);
      clearForm();
      showAlert(alertEl, "ok", "Usuário salvo com sucesso (simulação).");
    } catch (err) {
      showAlert(alertEl, "err", err.message);
    }
  });

  $("#btnClear").addEventListener("click", (e) => {
    e.preventDefault();
    clearForm();
    hideAlert(alertEl);
  });

  searchEl.addEventListener("input", () => {
    const term = searchEl.value.trim().toLowerCase();
    const list = loadUsers();
    const filtered = list.filter((u) =>
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
    render(filtered);
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "./login.html";
  });
}