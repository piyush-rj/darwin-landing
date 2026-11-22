"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

import JoinWaitlistButton from "./JoinWaitlistButton";
import { PAGE_CONTAINER } from "./pageContainer";

const NAV_LINKS = [
    { label: "How it works", href: "/how-it-works" },
    { label: "Why Darwin", href: "/why" },
    { label: "Team", href: "/team" },
    { label: "Changelog", href: "/changelog" },
];

const PILL =
    "inline-flex h-9 items-center rounded-full px-4 text-[14px] font-medium tracking-[-0.01em] transition-colors";

function subscribeToScroll(onScroll: () => void) {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
}

function useScrolledPastTop() {
    return useSyncExternalStore(
        subscribeToScroll,
        () => window.scrollY > 4,
        () => false,
    );
}

export default function LandingNavbar() {
    const scrolled = useScrolledPastTop();

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
                scrolled
                    ? "border-stone-900/[0.06] bg-snow/80 backdrop-blur-xl"
                    : "border-transparent",
            )}
        >
            <div className={cn(PAGE_CONTAINER, "grid h-16 grid-cols-[1fr_auto_1fr] items-center")}>
                <Link
                    href="/new"
                    className="justify-self-start font-editorial text-[24px] leading-none tracking-[-0.02em]"
                >
                    Darwin
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="rounded-full px-3.5 py-2 text-[14.5px] tracking-[-0.01em] text-stone-600 transition-colors hover:text-stone-950"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="col-start-3 flex items-center gap-2 justify-self-end">
                    <Link
                        href="/login"
                        className={cn(
                            PILL,
                            "bg-stone-900/[0.05] text-stone-900 hover:bg-stone-900/[0.09] max-sm:hidden",
                        )}
                    >
                        Log in
                    </Link>
                    <JoinWaitlistButton className="h-9 px-4 text-[14px]" />
                </div>
            </div>
        </header>
    );
}
