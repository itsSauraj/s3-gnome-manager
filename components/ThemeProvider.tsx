"use client";

import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      themes={['light', 'dark']}
      enableSystem={false}
      storageKey="r2-theme"
    >
      {children}
    </NextThemeProvider>
  );
}
