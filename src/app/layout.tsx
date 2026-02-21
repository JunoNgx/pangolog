import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const fontSans = Outfit({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-sans-var",
});

const fontMono = Geist_Mono({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-mono-var",
});

export const metadata: Metadata = {
    title: {
        default: "Pangolog",
        template: "Pangolog - %s",
    },
    description: "An offine-first and privacy-first minimalist expense tracker",
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
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
