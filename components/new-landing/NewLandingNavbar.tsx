"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { type MouseEvent, useEffect, useState } from "react";

import { MobileNavCloseIcon, MobileNavIcon } from "@/components/icons";
import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import LandingThemeToggle from "@/components/new-landing/LandingThemeToggle";
import MobileNavMenu, { type NavLink } from "@/components/new-landing/MobileNavMenu";
import WaitlistNavForm from "@/components/new-landing/WaitlistNavForm";
import { cn } from "@/lib/utils";

const NAV_LINKS: NavLink[] = [
    { label: "Security", href: "/#security" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Why Darwin", href: "/why" },
    { label: "Blog", href: "/blog?tab=blogs" },
    { label: "Changelog", href: "/blog?tab=changelog" },
];

const CELL = "flex h-full items-center border-r border-edge px-4 text-[14px] text-foreground";
const DESKTOP_QUERY = "(min-width: 1024px)";
const NAVBAR_HEIGHT = 44;
const SWAP = { duration: 0.2, ease: "easeOut" } as const;

function useMobileMenu() {
    const [open, setOpen] = useState(false);
    const lenis = useLenis();

    useEffect(() => {
        if (!open) return;
        const desktop = window.matchMedia(DESKTOP_QUERY);
        const closeOnDesktop = () => desktop.matches && setOpen(false);
        const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        desktop.addEventListener("change", closeOnDesktop);
        window.addEventListener("keydown", closeOnEscape);
        document.documentElement.style.overflow = "hidden";
        lenis?.stop();
        return () => {
            desktop.removeEventListener("change", closeOnDesktop);
            window.removeEventListener("keydown", closeOnEscape);
            document.documentElement.style.overflow = "";
            lenis?.start();
        };
    }, [open, lenis]);

    function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
        setOpen(false);
        if (!href.startsWith("/#")) return;
        event.preventDefault();
        const target = href.slice(1);
        requestAnimationFrame(() => {
            if (lenis) lenis.scrollTo(target, { offset: -NAVBAR_HEIGHT });
            else document.querySelector(target)?.scrollIntoView();
        });
    }

    return { open, toggle: () => setOpen((value) => !value), navigate };
}

export default function NewLandingNavbar() {
    const menu = useMobileMenu();

    return (
        <>
            <header className="nav-enter sticky top-0 z-50 flex h-11 w-full items-stretch border-b border-edge bg-ink">
                <Link
                    href="/"
                    aria-label="Darwin home"
                    className={cn(CELL, "w-14 shrink-0 justify-center px-0")}
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

                <LandingThemeToggle className="hidden h-full items-center border-r border-edge px-4 lg:flex" />

                <div className="ml-auto hidden w-[28rem] items-stretch justify-end border-l border-edge lg:flex">
                    <WaitlistNavForm />
                </div>

                <div className="flex flex-1 items-stretch overflow-hidden lg:hidden">
                    <WaitlistNavForm compact menuOpen={menu.open} />
                </div>

                <button
                    type="button"
                    onClick={menu.toggle}
                    aria-expanded={menu.open}
                    aria-controls="mobile-nav-menu"
                    aria-label={menu.open ? "Close menu" : "Open menu"}
                    className="relative flex w-14 shrink-0 cursor-pointer items-center justify-center border-l border-edge text-foreground lg:hidden"
                >
                    <AnimatePresence initial={false}>
                        <motion.span
                            key={menu.open ? "close" : "open"}
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={SWAP}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {menu.open ? (
                                <MobileNavCloseIcon className="size-6 rotate-45" />
                            ) : (
                                <MobileNavIcon className="size-6" />
                            )}
                        </motion.span>
                    </AnimatePresence>
                </button>
            </header>

            <AnimatePresence>
                {menu.open && <MobileNavMenu links={NAV_LINKS} onNavigate={menu.navigate} />}
            </AnimatePresence>
        </>
    );
}
