export type WaitlistResponse = { success: boolean; message: string };

export async function joinWaitlist(email: string): Promise<WaitlistResponse> {
    try {
        const response = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return (await response.json()) as WaitlistResponse;
    } catch {
        return { success: false, message: "Could not join the waitlist. Try again." };
    }
}
