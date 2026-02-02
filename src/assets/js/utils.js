export function $(selector) {
  return document.querySelector(selector);
}

export function setText(el, text) {
  // Protege contra XSS: nunca injeta HTML, só texto
  el.textContent = String(text ?? "");
}

export function showAlert(targetEl, type, message) {
  targetEl.className = `alert ${type}`;
  setText(targetEl, message);
  targetEl.hidden = false;
}

export function hideAlert(targetEl) {
  targetEl.hidden = true;
  targetEl.className = "alert";
  targetEl.textContent = "";
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}
