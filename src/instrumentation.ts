export async function register() {
    if (!process.env.IRON_SESSION_SECRET) {
        throw new Error(
            "IRON_SESSION_SECRET environment variable is required",
        );
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error(
            "GOOGLE_CLIENT_SECRET environment variable is required",
        );
    }
}
