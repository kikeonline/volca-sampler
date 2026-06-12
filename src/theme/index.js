import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const THEME_STORAGE_KEY = 'volca-sampler-theme';

const THEMES = ['light', 'dark'];
const THEME_COLORS = {
  light: '#d7d7d3',
  dark: '#0c1014',
};

const ThemeContext = createContext(null);

function isTheme(value) {
  return THEMES.includes(value);
}

function getStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getInitialTheme(defaultTheme) {
  if (typeof document === 'undefined') {
    return isTheme(defaultTheme) ? defaultTheme : 'light';
  }

  const documentTheme = document.documentElement.dataset.theme;
  return isTheme(documentTheme)
    ? documentTheme
    : getStoredTheme() || (isTheme(defaultTheme) ? defaultTheme : getSystemTheme());
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.bsTheme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute('content', THEME_COLORS[theme]);
}

function storeTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme selection still applies when storage is unavailable.
  }
}

export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setThemeState] = useState(() => getInitialTheme(defaultTheme));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (event) => {
      if (!getStoredTheme()) {
        setThemeState(event.matches ? 'dark' : 'light');
      }
    };

    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      setThemeState(isTheme(event.newValue) ? event.newValue : getSystemTheme());
    };

    mediaQuery?.addEventListener('change', handleSystemThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      mediaQuery?.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (!isTheme(nextTheme)) {
      return;
    }

    storeTheme(nextTheme);
    applyTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      isDark: theme === 'dark',
      setTheme,
      theme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export function ThemeToggle({ className = '', showLabel = false, ...props }) {
  const { isDark, toggleTheme } = useTheme();
  const nextTheme = isDark ? 'light' : 'dark';
  const label = `Switch to ${nextTheme} theme`;
  const classes = ['theme-toggle', className].filter(Boolean).join(' ');

  return (
    <button
      {...props}
      aria-label={label}
      className={classes}
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="theme-toggle__icon"
        fill="none"
        focusable="false"
        viewBox="0 0 24 24"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
          </>
        ) : (
          <path d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15.1Z" />
        )}
      </svg>
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
