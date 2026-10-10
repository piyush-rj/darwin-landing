import { getDatabasePool } from "./database";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export type WaitlistResult = "joined" | "already-joined";

export function normalizeEmail(input: unknown) {
    if (typeof input !== "string") return null;
    const email = input.trim().toLowerCase();
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) return null;
    return email;
}

export async function addToWaitlist(email: string): Promise<WaitlistResult> {
    const result = await getDatabasePool().query(
        "INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
        [email],
    );
    return result.rowCount === 1 ? "joined" : "already-joined";
}
