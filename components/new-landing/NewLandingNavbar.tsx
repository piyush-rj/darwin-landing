import Link from "next/link";

import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import LandingThemeToggle from "@/components/new-landing/LandingThemeToggle";
import WaitlistNavForm from "@/components/new-landing/WaitlistNavForm";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { label: "Security", href: "/#security" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Why Darwin", href: "/why" },
    { label: "Blog", href: "/blog?tab=blogs" },
    { label: "Changelog", href: "/blog?tab=changelog" },
];

const CELL = "flex h-full items-center border-r border-edge px-4 text-[14px] text-foreground";

export default function NewLandingNavbar() {
    return (
        <header className="sticky top-0 z-50 flex h-11 w-full items-stretch border-b border-edge bg-ink">
            <Link
                href="/"
                aria-label="Darwin home"
                className={cn(CELL, "w-14 justify-center px-0")}
            >
                <DarwinBlockLogo className="size-8" />
            </Link>

            <nav className="hidden items-stretch lg:flex">
                {NAV_LINKS.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={cn(CELL, "transition-colors hover:bg-mist")}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <LandingThemeToggle className="flex h-full items-center border-r border-edge px-4" />

            <div className="ml-auto flex items-stretch border-l border-edge">
                <WaitlistNavForm />
            </div>
        </header>
    );
}
