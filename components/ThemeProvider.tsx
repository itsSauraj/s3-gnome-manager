"use client";

import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      themes={['light', 'dark']}
      enableSystem={false}
      storageKey="s3-explorer-theme"
    >
      {children}
    </NextThemeProvider>
  );
}
