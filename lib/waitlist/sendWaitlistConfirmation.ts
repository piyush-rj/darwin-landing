const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export async function sendWaitlistConfirmation(email: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.WAITLIST_FROM_EMAIL;
    if (!apiKey || !from) return;

    const response = await fetch(RESEND_EMAILS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from,
            to: [email],
            subject: "You're on the Darwin waitlist",
            text: "Thanks for joining the Darwin waitlist. We'll email you as soon as your spot opens up.\n\nDarwin turns the issues your team files into tested pull requests.",
            html: "<p>Thanks for joining the Darwin waitlist. We'll email you as soon as your spot opens up.</p><p>Darwin turns the issues your team files into tested pull requests.</p>",
        }),
    });

    if (!response.ok) {
        throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
    }
}
