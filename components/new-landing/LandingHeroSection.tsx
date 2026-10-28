"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { CtaArrowIcon } from "@/components/icons";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";
import { focusNavbarWaitlist } from "@/lib/waitlist/focusNavbarWaitlist";

import FadeIn from "./FadeIn";
import { HERO_TONES, type HeroTone } from "./hero/heroTones";
import PixelDunes from "./hero/PixelDunes";

export default function LandingHeroSection() {
    const [tone, setTone] = useState<HeroTone>("indigo");
    const toggleTone = useCallback(
        () => setTone((current) => (current === "indigo" ? "purple" : "indigo")),
        [],
    );
    const palette = HERO_TONES[tone];

    return (
        <section className="relative flex min-h-[40rem] w-full flex-col items-center justify-center overflow-hidden bg-ink px-6 text-foreground lg:min-h-[calc(100dvh-2.75rem)]">
            {(Object.keys(HERO_TONES) as HeroTone[]).map((glowTone) => (
                <div
                    key={glowTone}
                    aria-hidden
                    className={cn(
                        "absolute inset-0 transition-opacity duration-700",
                        HERO_TONES[glowTone].glow,
                        glowTone !== tone && "opacity-0",
                    )}
                />
            ))}
            <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_top,color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[var(--cell,30px)_var(--cell,30px)] mask-[radial-gradient(ellipse_52%_46%_at_50%_42%,transparent_30%,black_95%)]"
            />
            <PixelDunes shades={palette.shades} onSecret={toggleTone} />

            <div className="relative flex flex-col items-center pb-[18vh] text-center">
                <h1 className="text-[clamp(2.5rem,5.4vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
                    <RollingText
                        text={"Issues in.\nPull requests out."}
                        accent={{
                            words: ["Pull", "requests"],
                            className: cn("transition-colors duration-700", palette.accent),
                        }}
                    />
                </h1>
                <FadeIn delay={1.6}>
                    <p className="mt-5 text-[14px] leading-snug text-neutral-500">
                        Tested pull requests,
                        <br />
                        from the issues you already file
                    </p>
                </FadeIn>
                <FadeIn delay={1.75}>
                    <div className="mt-7 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={focusNavbarWaitlist}
                            className={cn(
                                "group flex cursor-pointer items-center gap-2 border px-4 py-2 text-[14px] font-medium text-snow transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400",
                                palette.button,
                            )}
                        >
                            Join the waitlist
                            <CtaArrowIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                        <Link
                            href="/how-it-works"
                            className="border border-foreground/15 bg-snow px-4 py-2 text-[14px] font-medium text-foreground transition-colors duration-200 hover:border-foreground/25 hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                        >
                            How it works
                        </Link>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
