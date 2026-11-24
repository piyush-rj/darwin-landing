"use client";

import { type FormEvent, useState } from "react";

import { joinWaitlist } from "@/lib/waitlist/joinWaitlist";

import { PingDot, ROLL_TRIGGER, RollingLabel, TicketBridge } from "./hero/TicketButtons";

export const WAITLIST_EMAIL_INPUT_ID = "waitlist-email";

type WaitlistStatus =
    | { state: "idle" }
    | { state: "submitting" }
    | { state: "done"; message: string; failed: boolean };

export default function WaitlistPill({ navbar = false }: { navbar?: boolean }) {
    const part = navbar ? { "data-nav-cta-part": true, className: "opacity-0" } : {};
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<WaitlistStatus>({ state: "idle" });

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus({ state: "submitting" });
        const result = await joinWaitlist(email);
        setStatus({ state: "done", message: result.message, failed: !result.success });
    }

    if (status.state === "done" && !status.failed) {
        return (
            <p
                role="status"
                className="flex h-12 items-center rounded-[8px] bg-stone-900 px-4 text-[14px] font-medium text-snow"
            >
                {status.message}
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center">
            <label
                {...part}
                className={`flex h-12 items-center rounded-[8px] bg-snow pr-2 pl-3.5 shadow-[0_8px_24px_-12px] shadow-stone-900/10 ring-1 ring-plate-edge focus-within:ring-stone-300 sm:pl-4 ${part.className ?? ""}`}
            >
                <input
                    id={navbar ? WAITLIST_EMAIL_INPUT_ID : undefined}
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Your email"
                    autoComplete="email"
                    aria-label="Email address"
                    aria-invalid={status.state === "done"}
                    className="h-full w-24 min-w-0 bg-transparent text-[14px] text-stone-950 outline-none placeholder:text-stone-500 sm:w-44 lg:w-52"
                />
            </label>
            <span {...part} className={`flex ${part.className ?? ""}`}>
                <TicketBridge fill="bg-linear-to-r from-snow to-stone-900" />
            </span>
            <button
                type="submit"
                {...part}
                disabled={status.state === "submitting"}
                className={`${ROLL_TRIGGER} h-12 rounded-[8px] bg-stone-900 px-4 text-snow shadow-[0_8px_24px_-12px] shadow-stone-900/10 ring-1 ring-stone-900 focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-wait sm:px-5 ${part.className ?? ""}`}
            >
                {status.state === "submitting" ? "Joining…" : <RollingLabel text="Join waitlist" />}
                <PingDot />
            </button>
            {status.state === "done" && (
                <p
                    role="alert"
                    className="absolute top-full right-0 mt-2 rounded-[8px] bg-stone-900 px-3 py-1.5 text-[12px] whitespace-nowrap text-snow"
                >
                    {status.message}
                </p>
            )}
        </form>
    );
}
