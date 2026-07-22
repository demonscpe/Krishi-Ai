// Thin helpers — Firebase manages the session token internally.
// These are kept so existing imports don't break.

export function clearToken() {
  localStorage.removeItem("auth");
  localStorage.removeItem("accessToken");
}
