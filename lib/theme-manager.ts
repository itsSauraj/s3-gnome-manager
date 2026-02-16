/**
 * Theme management for light/dark mode
 */

export class ThemeManager {
  private static THEME_KEY = "r2_theme";

  static getTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";

    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  }

  static setTheme(theme: "light" | "dark") {
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  static toggleTheme() {
    const current = this.getTheme();
    const next = current === "light" ? "dark" : "light";
    this.setTheme(next);
    return next;
  }

  static applyTheme(theme: "light" | "dark") {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
    }
  }

  static initialize() {
    const theme = this.getTheme();
    this.applyTheme(theme);
  }
}
