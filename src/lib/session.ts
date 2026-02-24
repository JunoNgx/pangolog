import type { SessionOptions } from "iron-session";

export interface SessionData {
    refreshToken?: string;
}

export const sessionOptions: SessionOptions = {
    password: process.env.IRON_SESSION_SECRET!,
    cookieName: "pangolog-session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
    },
};
