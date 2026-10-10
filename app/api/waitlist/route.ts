import { sendWaitlistConfirmation } from "@/lib/waitlist/sendWaitlistConfirmation";
import { addToWaitlist, normalizeEmail } from "@/lib/waitlist/waitlist";

function respond(status: number, success: boolean, message: string) {
    return Response.json({ success, message }, { status });
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    if (!email) return respond(400, false, "Enter a valid email address.");

    try {
        const result = await addToWaitlist(email);
        if (result === "already-joined") {
            return respond(200, true, "You're already on the waitlist.");
        }
        await sendWaitlistConfirmation(email).catch((error) => {
            console.error("Waitlist confirmation email failed", error);
        });
        return respond(201, true, "You're on the waitlist.");
    } catch (error) {
        console.error("Adding to the waitlist failed", error);
        return respond(500, false, "Could not join the waitlist. Try again.");
    }
}
