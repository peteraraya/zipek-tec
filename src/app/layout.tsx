import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import AccessibilityWidget from "@/components/layout/AccessibilityWidget";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import CookieConsent from "@/components/layout/CookieConsent";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import type { Viewport } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Soporte informático legal y cercano`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Soporte informático", "Reparación de computadores", "Hogar", "Pymes", "Quillota", "Zipek Tecnología", "Licencias y seguridad digital"],
  authors: [{ name: siteConfig.founder.name, url: siteConfig.links.linkedin }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteConfig.url,
    title: `${siteConfig.name} | Soporte informático legal y cercano`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/logo/logo_zipek-tecnologia.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Soporte informático legal y cercano`,
    description: siteConfig.description,
    images: ["/logo/logo_zipek-tecnologia.png"],
    creator: "@zipek",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org JSON-LD para empresas/organizaciones (SEO Avanzado)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo/logo_zipek-tecnologia.png`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.links.linkedin,
      siteConfig.links.instagram,
      siteConfig.links.twitter,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      contactType: "customer service",
      areaServed: "CL",
      availableLanguage: "es",
    },
  };

  return (
    <html lang="es" className={`${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <WhatsAppButton />
          <AccessibilityWidget />
          <CookieConsent />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
