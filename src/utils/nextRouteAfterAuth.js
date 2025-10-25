// Simple return-to storage using sessionStorage
const KEY = 'returnTo'

export function rememberReturnTo(pathname) {
  try { sessionStorage.setItem(KEY, pathname || '/'); } catch {}
}

export function clearReturnTo() {
  try { sessionStorage.removeItem(KEY); } catch {}
}

export function nextRouteAfterAuth(defaultPath = '/game') {
  try {
    const val = sessionStorage.getItem(KEY)
    clearReturnTo()
    return val || defaultPath
  } catch {
    return defaultPath
  }
}
