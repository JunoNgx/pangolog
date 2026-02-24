import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "@/lib/session";
import { sessionOptions } from "@/lib/session";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export async function POST(request: Request) {
    const { code } = await request.json();

    if (!code) {
        return Response.json({ error: "Missing code" }, { status: 400 });
    }

    if (!CLIENT_SECRET) {
        return Response.json(
            { error: "Server not configured" },
            { status: 500 },
        );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: "postmessage",
            grant_type: "authorization_code",
        }),
    });

    if (!tokenResponse.ok) {
        const data = await tokenResponse.json();
        return Response.json(
            { error: data.error_description ?? "Token exchange failed" },
            { status: 400 },
        );
    }

    const tokens = await tokenResponse.json();

    const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    if (!userResponse.ok) {
        return Response.json(
            { error: "Failed to fetch user info" },
            { status: 400 },
        );
    }

    const userInfo = await userResponse.json();

    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions,
    );
    session.refreshToken = tokens.refresh_token;
    await session.save();

    return Response.json({
        accessToken: tokens.access_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        email: userInfo.email,
    });
}
