"use client";

import {
    type FocusEvent,
    type FormEvent,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";

import { CtaArrowIcon } from "@/components/icons";
import RollingSwap from "@/components/utility/RollingSwap";
import { cn } from "@/lib/utils";
import { FOCUS_NAVBAR_WAITLIST_EVENT } from "@/lib/waitlist/focusNavbarWaitlist";

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

const INVERTED = "bg-foreground text-[14px] font-medium whitespace-nowrap text-snow";
const PLAIN = "text-[14px] font-medium whitespace-nowrap text-foreground";
const COMPACT_LABEL =
    "flex h-full flex-1 items-center justify-center text-[12px] font-medium tracking-[0.06em] text-foreground uppercase";

export default function WaitlistNavForm({
    compact = false,
    menuOpen = false,
    focusOnCtaClick = false,
}: {
    compact?: boolean;
    menuOpen?: boolean;
    focusOnCtaClick?: boolean;
}) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<WaitlistStatus>({ state: "idle" });
    const [expanded, setExpanded] = useState(!compact);
    const [menuWasOpened, setMenuWasOpened] = useState(false);
    if (menuOpen && !menuWasOpened) setMenuWasOpened(true);
    const inputRef = useRef<HTMLInputElement>(null);

    function expand() {
        flushSync(() => setExpanded(true));
        inputRef.current?.focus();
    }

    function collapse() {
        if (compact && !email) setExpanded(false);
    }

    const focusFromCta = useEffectEvent(() => {
        expand();
        if (document.activeElement !== inputRef.current) collapse();
    });

    useEffect(() => {
        if (!focusOnCtaClick) return;
        window.addEventListener(FOCUS_NAVBAR_WAITLIST_EVENT, focusFromCta);
        return () => window.removeEventListener(FOCUS_NAVBAR_WAITLIST_EVENT, focusFromCta);
    }, [focusOnCtaClick]);

    function handleBlur(event: FocusEvent<HTMLFormElement>) {
        if (!event.currentTarget.contains(event.relatedTarget)) collapse();
    }

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

    if (compact && (menuOpen || (!expanded && status.state !== "joined"))) {
        return (
            <button
                type="button"
                onClick={expand}
                disabled={menuOpen}
                className={cn(
                    COMPACT_LABEL,
                    "cursor-pointer transition-colors enabled:hover:bg-mist enabled:active:bg-mist disabled:cursor-default",
                )}
            >
                <RollingSwap
                    text={menuOpen ? "Menu" : "Join waitlist"}
                    direction={menuOpen || !menuWasOpened ? "up" : "down"}
                />
            </button>
        );
    }

    if (status.state === "joined") {
        return (
            <p
                role="status"
                className={cn(
                    compact ? PLAIN : INVERTED,
                    "flex h-full items-center px-4",
                    compact && "flex-1 justify-center",
                )}
            >
                {status.message}
            </p>
        );
    }

    const submitting = status.state === "submitting";
    const failed = status.state === "failed";

    return (
        <form
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            className="relative flex h-full flex-1 items-stretch"
        >
            <input
                ref={inputRef}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
                placeholder="Enter your email here"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={failed}
                className={cn(
                    "h-full min-w-0 flex-1 bg-transparent px-4 text-[14px] text-foreground outline-none transition-colors placeholder:text-neutral-500 focus:bg-mist",
                    failed && "bg-[color-mix(in_oklab,var(--color-red-500)_8%,transparent)]",
                )}
            />
            <button
                type="submit"
                disabled={submitting}
                aria-label="Join waitlist"
                onPointerDown={(event) => event.preventDefault()}
                className={cn(
                    "flex h-full cursor-pointer items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70",
                    compact
                        ? cn(
                              PLAIN,
                              "aspect-square border-l border-edge transition-colors hover:bg-mist active:bg-mist",
                          )
                        : cn(INVERTED, "px-4 transition-opacity hover:opacity-90"),
                )}
            >
                {!compact && <span>{submitting ? "Joining..." : "Join waitlist"}</span>}
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
