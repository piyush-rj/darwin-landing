"use client";

import { cn } from "@/lib/utils";

import { WAITLIST_EMAIL_INPUT_ID } from "./pageContainer";

function focusWaitlistEmail() {
    const input = document.getElementById(WAITLIST_EMAIL_INPUT_ID);
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus({ preventScroll: true });
}

export default function JoinWaitlistButton({ className }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={focusWaitlistEmail}
            className={cn(
                "inline-flex cursor-pointer items-center rounded-full bg-stone-950 font-medium tracking-[-0.01em] text-paper transition-colors hover:bg-stone-800",
                className,
            )}
        >
            Join waitlist
        </button>
    );
}
