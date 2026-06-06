import type { Metadata, Viewport } from "next";
import { Funnel_Display, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const fontSans = Funnel_Display({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-sans-var",
});

const fontMono = Geist_Mono({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-mono-var",
});

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: {
        default: "Pangolog",
        template: "Pangolog - %s",
    },
    description:
        "An offline-first, privacy-first minimalist expense tracker. No account required. Your data stays on your device.",
    metadataBase: new URL(BASE_URL),
    openGraph: {
        siteName: "Pangolog",
        type: "website",
        locale: "en_US",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Pangolog",
    },
    icons: {
        icon: "/icons/icon-192.png",
        apple: "/icons/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    interactiveWidget: "resizes-visual",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} antialiased`}
            >
                <ErrorBoundary>
                    <Providers>{children}</Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}
