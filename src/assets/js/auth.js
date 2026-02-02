import { apiRequest } from "./api.js";
import { $, showAlert, hideAlert, validateEmail } from "./utils.js";

const MAX_TRIES = 3;

function getTryState(email) {
  const raw = localStorage.getItem(`tries:${email}`);
  return raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
}

function setTryState(email, state) {
  localStorage.setItem(`tries:${email}`, JSON.stringify(state));
}

function isLocked(state) {
  return Date.now() < (state.lockedUntil || 0);
}

function lockFor5Minutes(state) {
  state.lockedUntil = Date.now() + 5 * 60 * 1000;
  return state;
}

export function initLoginPage() {
  const form = $("#loginForm");
  const emailEl = $("#email");
  const passEl = $("#password");
  const alertEl = $("#alert");
  const forgotBtn = $("#forgotBtn");

  hideAlert(alertEl);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const email = emailEl.value.trim().toLowerCase();
    const password = passEl.value;

    if (!validateEmail(email)) {
      return showAlert(alertEl, "warn", "Informe um e-mail válido.");
    }

    let state = getTryState(email);

    if (isLocked(state)) {
      const mins = Math.ceil((state.lockedUntil - Date.now()) / 60000);
      return showAlert(alertEl, "err", `Usuário bloqueado temporariamente. Tente novamente em ~${mins} min.`);
    }

    try {
      // Quando o backend existir, isso fará login real:
      // const data = await apiRequest("/api/auth/login", { method: "POST", body: { email, password }, auth: false });

      // Para aula: simulação local (remova quando ligar no backend)
      if (password !== "123456") throw new Error("Credenciais inválidas (simulação). Use senha 123456.");

      const fakeToken = "FAKE_TOKEN_DEMO";
      localStorage.setItem("token", fakeToken);
      localStorage.setItem("userEmail", email);

      // reset tentativas
      state = { count: 0, lockedUntil: 0 };
      setTryState(email, state);

      showAlert(alertEl, "ok", "Login realizado! Redirecionando…");
      setTimeout(() => (window.location.href = "./users.html"), 700);
    } catch (err) {
      state.count += 1;

      if (state.count >= MAX_TRIES) {
        state = lockFor5Minutes(state);
        setTryState(email, state);
        return showAlert(alertEl, "err", "3 tentativas incorretas. Usuário bloqueado por 5 minutos (simulação).");
      }

      setTryState(email, state);
      showAlert(alertEl, "err", `${err.message} Tentativas: ${state.count}/${MAX_TRIES}`);
    }
  });

  forgotBtn.addEventListener("click", async () => {
    hideAlert(alertEl);
    const email = emailEl.value.trim().toLowerCase();

    if (!validateEmail(email)) {
      return showAlert(alertEl, "warn", "Para redefinir, informe um e-mail válido no campo e-mail.");
    }

    try {
      // Depois no backend:
      // await apiRequest("/api/auth/forgot-password", { method: "POST", body: { email }, auth: false });

      // Simulação
      showAlert(alertEl, "ok", "Se este e-mail existir, enviaremos um link/código de redefinição (simulação).");
    } catch (err) {
      showAlert(alertEl, "err", err.message);
    }
  });
}
