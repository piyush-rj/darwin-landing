"use client";

import { type FormEvent, useState } from "react";

import { cn } from "@/lib/utils";
import { joinWaitlist } from "@/lib/waitlist/joinWaitlist";

import { WAITLIST_EMAIL_INPUT_ID } from "./pageContainer";

type WaitlistStatus =
    | { state: "idle" }
    | { state: "submitting" }
    | { state: "joined"; message: string }
    | { state: "failed"; message: string };

export default function WaitlistForm({ className }: { className?: string }) {
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
                className={cn(
                    "flex h-12 items-center justify-center text-[15px] text-stone-700",
                    className,
                )}
            >
                {status.message}
            </p>
        );
    }

    const submitting = status.state === "submitting";
    const failed = status.state === "failed";

    return (
        <div className={className}>
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "flex h-12 items-center rounded-full bg-snow p-1 shadow-xs ring-1 transition-shadow focus-within:ring-stone-900/25",
                    failed ? "ring-rose-500/40" : "ring-stone-900/10",
                )}
            >
                <input
                    id={WAITLIST_EMAIL_INPUT_ID}
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-label="Work email"
                    aria-invalid={failed}
                    className="h-full min-w-0 flex-1 bg-transparent pl-4 text-[15px] tracking-[-0.01em] text-stone-950 outline-none placeholder:text-stone-400"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-full cursor-pointer items-center rounded-full bg-stone-950 px-5 text-[14px] font-medium tracking-[-0.01em] whitespace-nowrap text-paper transition-colors hover:bg-stone-800 disabled:cursor-wait disabled:opacity-70"
                >
                    {submitting ? "Joining…" : "Join waitlist"}
                </button>
            </form>
            {failed && (
                <p role="alert" className="mt-3 text-[13px] text-rose-600">
                    {status.message}
                </p>
            )}
        </div>
    );
}
