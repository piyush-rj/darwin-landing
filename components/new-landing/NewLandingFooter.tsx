"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FooterLinkHoverArrowIcon } from "@/components/icons";
import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { cn } from "@/lib/utils";

const MONO_LABEL = "font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase";
const CELL = "border-edge px-6 py-6 md:px-5";
const LINK = "text-[15px] text-foreground transition-colors hover:text-primary";

const LINK_COLUMNS = [
    {
        heading: "Company",
        links: [
            { label: "Home", href: "/" },
            { label: "About us", href: "/about" },
            { label: "Why Darwin", href: "/why" },
        ],
    },
    {
        heading: "Product",
        links: [
            { label: "How it works", href: "/#how-it-works" },
            { label: "Integrations", href: "/integrations" },
            { label: "Pricing", href: "/#pricing" },
        ],
    },
    {
        heading: "Resources",
        links: [
            { label: "Blog", href: "/blog?tab=blogs" },
            { label: "Changelog", href: "/blog?tab=changelog" },
            { label: "Waitlist", href: "/join-waitlist" },
        ],
    },
    {
        heading: "Social",
        links: [
            { label: "GitHub", href: "#" },
            { label: "X", href: "#" },
            { label: "LinkedIn", href: "#" },
        ],
    },
];

export default function NewLandingFooter() {
    const pathname = usePathname();

    return (
        <footer className="w-full bg-ink text-foreground">
            <div className="grid grid-cols-2 border-b border-edge lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_minmax(0,1.4fr)]">
                <div
                    className={cn(
                        CELL,
                        "flex min-h-52 flex-col justify-between gap-8 col-span-2 lg:col-span-1 lg:border-r",
                    )}
                >
                    <p className="max-w-[12ch] text-[26px] leading-[1.05] font-semibold tracking-[-0.03em] uppercase sm:text-[28px]">
                        Issues in. Pull requests out.
                    </p>
                    <Link
                        href="/login"
                        className="group flex w-fit items-center gap-2 text-[15px] text-neutral-500 transition-colors hover:text-primary"
                    >
                        Open Darwin
                        <FooterLinkHoverArrowIcon className="size-4 -rotate-90 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {LINK_COLUMNS.map((column, index) => (
                    <nav
                        key={column.heading}
                        aria-label={column.heading}
                        className={cn(
                            CELL,
                            "border-t lg:border-t-0 lg:border-r",
                            index % 2 === 0 && "border-r",
                        )}
                    >
                        <p className={MONO_LABEL}>{column.heading}</p>
                        <ul className="mt-6 space-y-3">
                            {column.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            LINK,
                                            pathname === link.href && "text-primary",
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}

                <div className="hidden items-center justify-center lg:flex">
                    <DarwinBlockLogo className="size-24" />
                </div>
            </div>

            {/* <div className="relative border-b border-edge px-5 py-8 sm:px-10 sm:py-12">
                <div aria-hidden className={cn("absolute inset-x-8 top-3 h-2", RULER_TICKS)} />
                <div aria-hidden className={cn("absolute inset-x-8 bottom-3 h-2", RULER_TICKS)} />
                <NetherPortalTile className="top-4 left-3" />
                <NetherPortalTile className="top-4 right-3" />
                <NetherPortalTile className="top-auto bottom-1 left-3" />
                <NetherPortalTile className="top-auto right-3 bottom-1" />
                <BlueprintWordmark />
            </div>

            <div className="flex items-center px-6 py-5 md:px-5">
                <p className={cn(MONO_LABEL, "text-[11px]")}>© 2026 Darwin. All rights reserved.</p>
            </div> */}
        </footer>
    );
}
