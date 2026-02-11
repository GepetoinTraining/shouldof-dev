import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  colors: {
    dark: [
      '#C9C9C9',
      '#B8B8B8',
      '#828282',
      '#696969',
      '#424242',
      '#3B3B3B',
      '#2E2E2E',
      '#1A1A2E',
      '#141425',
      '#0F0F1A',
    ],
  },
});

export const metadata: Metadata = {
  title: 'shouldof.dev — The Gratitude Graph',
  description:
    'Every npm install is a person. See the humans behind your code — and thank them.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'shouldof.dev — The Gratitude Graph',
    description: 'A visual web of open source interconnection. Connect your GitHub. See who you depend on. Say thank you.',
    type: 'website',
    url: 'https://shouldof.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'shouldof.dev — The Gratitude Graph',
    description: 'Every npm install is a person.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mantine-color-scheme="dark">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
