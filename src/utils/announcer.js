// src/utils/announcer.js
// Small DOM-based announcer utility to trigger ARIA live region announcements.
export function announce(messageOrDetail) {
  if (typeof document === 'undefined') return;

  // messageOrDetail may be a string or an object { message, type }
  const detail =
    typeof messageOrDetail === 'string'
      ? { message: messageOrDetail, type: 'info' }
      : Object(messageOrDetail || {});
  const txt = String(detail.message || '');

  let el = document.getElementById('app-announcer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-announcer';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    document.body.appendChild(el);
  }

  // Clear then set to ensure screen readers notify on repeated messages.
  el.textContent = '';
  // small timeout to ensure change detection
  setTimeout(() => {
    el.textContent = txt;
    try {
      // Also emit a DOM event so visual toasts can listen
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('app-announce', { detail }));
      }
    } catch (err) {
      // no-op
    }
  }, 100);
}

export default announce;
