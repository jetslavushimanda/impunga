import { create } from 'zustand';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  try { return localStorage.getItem('impunga_theme') || 'system'; } catch { return 'system'; }
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function applyTheme(resolved) {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Apply immediately on module load (before React renders)
const _initial = getStoredTheme();
applyTheme(resolveTheme(_initial));

const useThemeStore = create((set, get) => ({
  theme: _initial,
  resolved: resolveTheme(_initial),

  setTheme(theme) {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    try { localStorage.setItem('impunga_theme', theme); } catch {}
    set({ theme, resolved });
  },

  toggleTheme() {
    const { resolved } = get();
    get().setTheme(resolved === 'dark' ? 'light' : 'dark');
  },
}));

// Keep in sync with OS preference when set to 'system'
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      applyTheme(resolved);
      useThemeStore.setState({ resolved });
    }
  });
}

export default useThemeStore;
