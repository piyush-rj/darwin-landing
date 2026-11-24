"use client";

import { stagger, useAnimate, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";

import WaitlistPill from "./WaitlistPill";

const NAV_LINKS = [
    { label: "How it works", href: "/how-it-works" },
    { label: "Why Darwin", href: "/why" },
    { label: "Team", href: "/team" },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const GLIDE = [0.7, 0, 0.2, 1] as const;
const CTA_TRAVEL = 56;

function barTransform(offset: number, scale: number) {
    return `translateX(${offset}px) scale(${scale})`;
}

function useFooterInView() {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const reveal = document.getElementById("footer-reveal");
        if (!reveal) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
            rootMargin: "100000px 0px -20% 0px",
        });
        observer.observe(reveal);
        return () => observer.disconnect();
    }, []);
    return inView;
}

export default function FloatingNavbar() {
    const [scope, animateScope] = useAnimate();
    const barRef = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const footerInView = useFooterInView();

    useLayoutEffect(() => {
        const bar = barRef.current;
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const centerOffset = window.innerWidth / 2 - (rect.left + rect.width / 2);
        const pace = reduceMotion ? 0 : 1;

        const entry = animateScope([
            [
                bar,
                {
                    opacity: [0, 1],
                    transform: [barTransform(centerOffset, 0.96), barTransform(centerOffset, 1)],
                },
                { duration: 0.55 * pace, at: 0.1 * pace, ease: EASE_OUT },
            ],
            [
                "[data-nav-mark]",
                { opacity: [0, 1], transform: ["translateY(-8px)", "translateY(0px)"] },
                { duration: 0.45 * pace, at: 0.3 * pace, ease: EASE_OUT },
            ],
            [
                "[data-nav-wordmark]",
                {
                    opacity: [0, 1],
                    clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
                },
                { duration: 0.5 * pace, at: 0.42 * pace, ease: EASE_OUT },
            ],
            [
                "[data-nav-link]",
                { opacity: [0, 1], transform: ["translateY(6px)", "translateY(0px)"] },
                {
                    duration: 0.45 * pace,
                    at: 0.55 * pace,
                    delay: stagger(0.07 * pace),
                    ease: EASE_OUT,
                },
            ],
            [
                bar,
                { transform: [barTransform(centerOffset, 1), barTransform(0, 1)] },
                { duration: 0.9 * pace, at: 1.15 * pace, ease: GLIDE },
            ],
            [
                "[data-nav-cta]",
                { transform: [`translateX(${CTA_TRAVEL}px)`, "translateX(0px)"] },
                { duration: 0.9 * pace, at: 1.3 * pace, ease: EASE_OUT },
            ],
            [
                "[data-nav-cta-part]",
                { opacity: [0, 1] },
                { duration: 0.6 * pace, at: 1.3 * pace, delay: stagger(0.06 * pace) },
            ],
        ]);

        return () => entry.stop();
    }, [animateScope, reduceMotion]);

    return (
        <header
            ref={scope}
            className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] md:px-8 md:pt-4"
            style={{ transform: footerInView ? "translateY(-120%)" : "translateY(0)" }}
        >
            <div className="mx-auto flex max-w-page items-start justify-between gap-4">
                <div
                    ref={barRef}
                    className="pointer-events-auto flex h-12 items-center gap-1 rounded-[8px] bg-snow pr-2 pl-3 opacity-0 shadow-[0_8px_24px_-12px] shadow-stone-900/10 ring-1 ring-plate-edge"
                >
                    <Link
                        href="/"
                        aria-label="Darwin home"
                        className="flex items-center gap-2 pr-3"
                    >
                        <span data-nav-mark className="flex opacity-0">
                            <DarwinBlockLogo className="size-7" />
                        </span>
                        <span
                            data-nav-wordmark
                            className="text-[16px] font-semibold tracking-[-0.03em] whitespace-nowrap text-stone-950 opacity-0 max-md:hidden"
                        >
                            Darwin
                        </span>
                    </Link>
                    <nav aria-label="Main" className="hidden items-center md:flex">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                data-nav-link
                                className="rounded-[3px] px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-stone-950 opacity-0 hover:bg-stone-900/5 md:px-3.5 md:text-[14px]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div data-nav-cta className="pointer-events-auto relative">
                    <WaitlistPill navbar />
                </div>
            </div>
        </header>
    );
}
