import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, JetBrains_Mono } from 'next/font/google'
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "BlackinBot - Monetize seus Grupos do Telegram",
  description: "Plataforma completa para criar, gerenciar e monetizar bots do Telegram com sistema de pagamentos integrado, dashboard profissional e deploy automático.",
  keywords: "telegram, bot, monetização, pagamentos, pix, grupos vip, blackinbot",
  authors: [{ name: "BlackinBot Team" }],
  openGraph: {
    title: "BlackinBot - Monetize seus Grupos do Telegram",
    description: "Plataforma completa para criar, gerenciar e monetizar bots do Telegram",
    type: "website",
    locale: "pt_BR",
    siteName: "BlackinBot",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackinBot - Monetize seus Grupos do Telegram",
    description: "Plataforma completa para criar, gerenciar e monetizar bots do Telegram",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5577AA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="pt-BR" 
      className={`dark ${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} antialiased font-sans bg-gradient-dark text-dark-100 overflow-x-hidden`}>
        <AuthProvider>
          {children}
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(26, 26, 28, 0.9)',
                color: '#ADADB3',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
              },
              success: {
                style: {
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                },
              },
              error: {
                style: {
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
