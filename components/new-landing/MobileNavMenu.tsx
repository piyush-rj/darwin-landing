"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import type { MouseEvent } from "react";

import { CtaArrowIcon } from "@/components/icons";
import LandingThemeToggle from "@/components/new-landing/LandingThemeToggle";

export type NavLink = { label: string; href: string };

const ITEM_STAGGER_SECONDS = 0.04;

export default function MobileNavMenu({
    links,
    onNavigate,
}: {
    links: NavLink[];
    onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
    return (
        <m.div
            id="mobile-nav-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 top-11 bottom-0 z-40 flex flex-col overflow-y-auto bg-ink lg:hidden"
        >
            <nav aria-label="Main">
                {links.map((link, index) => (
                    <m.div
                        key={link.label}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.28,
                            delay: index * ITEM_STAGGER_SECONDS,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <Link
                            href={link.href}
                            onClick={(event) => onNavigate(event, link.href)}
                            className="flex h-16 items-center justify-between border-b border-edge px-6 text-[20px] tracking-[-0.01em] text-foreground transition-colors active:bg-mist"
                        >
                            {link.label}
                            <CtaArrowIcon className="size-5 text-neutral-500" />
                        </Link>
                    </m.div>
                ))}
            </nav>

            <div className="mt-auto flex items-center justify-between border-t border-edge px-6 py-4">
                <span className="font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
                    Appearance
                </span>
                <LandingThemeToggle className="flex size-10 items-center justify-center border border-edge" />
            </div>
        </m.div>
    );
}
