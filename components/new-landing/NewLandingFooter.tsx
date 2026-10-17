"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import WaitlistNavForm from "@/components/new-landing/WaitlistNavForm";
import { cn } from "@/lib/utils";

const CELL = "border-edge px-6 py-6 md:px-5";
const LINK = "text-[15px] text-foreground transition-colors hover:text-primary";

const LINK_COLUMNS = [
    {
        heading: "Company",
        links: [
            { label: "Home", href: "/" },
            { label: "Team", href: "/team" },
            { label: "Why Darwin", href: "/why" },
        ],
    },
    {
        heading: "Product",
        links: [
            { label: "How it works", href: "/how-it-works" },
            { label: "Integrations", href: "/integrations" },
            { label: "Pricing", href: "/#pricing" },
        ],
    },
    {
        heading: "Resources",
        links: [
            { label: "Blog", href: "/blog?tab=blogs" },
            { label: "Changelog", href: "/blog?tab=changelog" },
        ],
    },
    {
        heading: "Social",
        links: [{ label: "X", href: "https://x.com/heydarwin_app" }],
    },
];

export default function NewLandingFooter() {
    const pathname = usePathname();

    return (
        <footer className="w-full bg-ink text-foreground">
            <div className="grid grid-cols-2 border-b border-edge lg:grid-cols-[minmax(0,2.2fr)_repeat(4,minmax(0,1fr))_14rem] lg:grid-rows-[14rem]">
                <div
                    className={cn(
                        CELL,
                        "flex min-h-52 flex-col justify-between gap-8 col-span-2 lg:col-span-1 lg:border-r",
                    )}
                >
                    <p className="text-[26px] leading-[1.05] font-semibold tracking-[-0.03em] uppercase sm:text-[28px]">
                        Issues in.
                        <br />
                        Pull requests out.
                    </p>
                    <div className="flex h-12 w-full items-stretch border border-edge">
                        <WaitlistNavForm />
                    </div>
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
                                        {...(link.href.startsWith("http") && {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                        })}
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
