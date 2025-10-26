// src/utils/passwordPolicy.js
export function validatePassword(pw) {
  const errors = [];
  if (pw.length < 10) errors.push("at least 10 characters");
  if (!/[A-Z]/.test(pw)) errors.push("at least one uppercase letter");
  if (!/[^a-zA-Z0-9]/.test(pw)) errors.push("at least one symbol");
  return { ok: errors.length === 0, errors };
}