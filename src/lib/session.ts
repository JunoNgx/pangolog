import type { SessionOptions } from "iron-session";
import { PERSIST_SESSION } from "@/lib/constants";

export interface SessionData {
    refreshToken?: string;
}

const sessionSecret = process.env.IRON_SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("IRON_SESSION_SECRET is required");
}

export const sessionOptions: SessionOptions = {
    password: sessionSecret,
    cookieName: PERSIST_SESSION,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
    },
};
