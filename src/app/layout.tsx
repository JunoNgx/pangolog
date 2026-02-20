import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = localFont({
    src: "./fonts/Geist-VariableFont_wght.ttf",
    variable: "--font-geist-sans",
});

const geistMono = localFont({
    src: "./fonts/GeistMono-VariableFont_wght.ttf",
    variable: "--font-geist-mono",
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
    themeColor: "#000000",
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
