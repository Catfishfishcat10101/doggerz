// src/components/Setup/NewPup.jsx
function onSubmit(e) {
  e.preventDefault();
  const trimmed = name.trim();
  if (!trimmed) return;
  localStorage.setItem("dogName", trimmed);
  nav("/play"); // you’re in!
}
