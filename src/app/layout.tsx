import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { siteContent } from "@/lib/content";
import { getLiveContent } from "@/lib/get-content";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLiveContent().catch(() => siteContent);
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${content.name} | AI Engineer`,
      template: `%s | ${content.name}`,
    },
    description: content.summary,
    openGraph: {
      title: `${content.name} | AI Engineer`,
      description: content.positioning,
      url: siteUrl(),
      siteName: content.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${content.name} | AI Engineer`,
      description: content.positioning,
    },
    alternates: {
      canonical: siteUrl(),
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getLiveContent().catch(() => siteContent);
  const locality = content.location.split(",")[0]?.trim() || "Lahore";
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.name,
    jobTitle: "AI Engineer",
    email: content.email,
    telephone: content.phone,
    url: siteUrl(),
    sameAs: [content.github, content.linkedin].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressCountry: "PK",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
