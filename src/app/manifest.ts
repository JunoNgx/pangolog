import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Pangolog",
        short_name: "Pangolog",
        description:
            "an offine-first and privacy-first minimalist expense tracker",
        start_url: "/log",
        display: "standalone",
        background_color: "#1d1d16",
        theme_color: "#f4db5c",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
