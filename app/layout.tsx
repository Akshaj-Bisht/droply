import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export const metadata: Metadata = {
  title: {
    default: "Droply - Fast & Secure File Sharing",
    template: "%s | Droply",
  },
  description:
    "Share files instantly with anyone. No signup required. Upload files or folders, get a shareable link and QR code. Files auto-expire in 24 hours for privacy.",
  keywords: [
    "file sharing",
    "file transfer",
    "share files",
    "send files",
    "upload files",
    "secure file sharing",
    "QR code file sharing",
    "temporary file sharing",
    "free file sharing",
  ],
  authors: [{ name: "Droply" }],
  creator: "Droply",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Droply",
    title: "Droply - Fast & Secure File Sharing",
    description:
      "Share files instantly with anyone. No signup required. Upload files or folders, get a shareable link and QR code.",
  },
  twitter: {
    card: "summary",
    title: "Droply - Fast & Secure File Sharing",
    description:
      "Share files instantly with anyone. No signup required. Get a shareable link and QR code.",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
