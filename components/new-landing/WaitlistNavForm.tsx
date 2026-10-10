"use client";

import { type FormEvent, useState } from "react";

import { CtaArrowIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type WaitlistStatus =
    | { state: "idle" }
    | { state: "submitting" }
    | { state: "joined"; message: string }
    | { state: "failed"; message: string };

type WaitlistResponse = { success: boolean; message: string };

async function joinWaitlist(email: string): Promise<WaitlistResponse> {
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

export default function WaitlistNavForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<WaitlistStatus>({ state: "idle" });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus({ state: "submitting" });
        const result = await joinWaitlist(email);
        setStatus(
            result.success
                ? { state: "joined", message: result.message }
                : { state: "failed", message: result.message },
        );
    }

    if (status.state === "joined") {
        return (
            <p
                role="status"
                className="flex h-full items-center bg-foreground px-4 text-[14px] font-medium whitespace-nowrap text-snow"
            >
                {status.message}
            </p>
        );
    }

    const submitting = status.state === "submitting";
    const failed = status.state === "failed";

    return (
        <form onSubmit={handleSubmit} className="relative flex h-full items-stretch">
            <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Work email"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={failed}
                className={cn(
                    "h-full w-36 bg-transparent px-4 text-[14px] text-foreground outline-none transition-colors placeholder:text-neutral-500 focus:bg-mist sm:w-60",
                    failed && "bg-[color-mix(in_oklab,var(--color-red-500)_8%,transparent)]",
                )}
            />
            <button
                type="submit"
                disabled={submitting}
                className="flex h-full cursor-pointer items-center gap-2 bg-foreground px-4 text-[14px] font-medium whitespace-nowrap text-snow transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
            >
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">
                    {submitting ? "Joining..." : "Join waitlist"}
                </span>
                <CtaArrowIcon className="size-4" />
            </button>
            {failed && (
                <p
                    role="alert"
                    className="absolute top-full right-0 mt-2 bg-foreground px-3 py-1.5 text-[12px] whitespace-nowrap text-snow"
                >
                    {status.message}
                </p>
            )}
        </form>
    );
}
