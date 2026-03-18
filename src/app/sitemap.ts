import type { MetadataRoute } from "next";

import { BASE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: BASE_URL, priority: 1 },
        { url: `${BASE_URL}/help`, priority: 0.7 },
        { url: `${BASE_URL}/privacy`, priority: 0.3 },
        { url: `${BASE_URL}/terms`, priority: 0.3 },
    ];
}
