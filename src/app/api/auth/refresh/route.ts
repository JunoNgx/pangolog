import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "@/lib/session";
import { sessionOptions } from "@/lib/session";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export async function POST() {
    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );

    if (!session.refreshToken) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: session.refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }),
    });

    if (!tokenResponse.ok) {
        return Response.json(
            { error: "Failed to refresh token" },
            { status: 401 },
        );
    }

    const tokens = await tokenResponse.json();

    return Response.json({
        accessToken: tokens.access_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
    });
}
