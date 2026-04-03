import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getUserId(): string | null {
    const cookieStore = cookies();
    const token = cookieStore.get("naura_auth")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret_key"
        ) as { userId: string };

        return decoded.userId;
    } catch (error) {
        return null;
    }
}
