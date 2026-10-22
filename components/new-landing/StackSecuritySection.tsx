"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

import { BackChevronIcon, CtaArrowIcon, TelegramLogoIcon } from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import HairlineFigure from "@/components/utility/HairlineFigure";
import RollingText from "@/components/utility/RollingText";
import {
    INTEGRATION_CYCLES_MS,
    INTEGRATIONS,
    mountIntegrationTower,
} from "@/lib/hairline/figures/integrationTower";
import { cn } from "@/lib/utils";

function LogoImage({ name, className }: { name: string; className?: string }) {
    return (
        <Image
            src={`/images/integrations/${name}.svg`}
            alt=""
            width={40}
            height={40}
            className={cn("size-7 sm:size-10", className)}
        />
    );
}

const LOGOS: Record<string, ReactNode> = {
    GitHub: <LogoImage name="github" />,
    Telegram: <TelegramLogoIcon className="size-8 text-sky-500 sm:size-11" />,
    Slack: <LogoImage name="slack" className="scale-[2.4]" />,
    Figma: <LogoImage name="figma" />,
};

const POINTS = [
    "Issues come in from Slack, Telegram and Figma.",
    "When Darwin is stuck, it asks your team before guessing.",
    "Fixes go back as pull requests on GitHub.",
    "Nothing ships until a person approves it.",
];

function useRotatingIntegration() {
    const [active, setActive] = useState(0);
    const step = (by: number) =>
        setActive((current) => (current + by + INTEGRATIONS.length) % INTEGRATIONS.length);

    useEffect(() => {
        const timer = window.setTimeout(
            () => setActive((current) => (current + 1) % INTEGRATIONS.length),
            INTEGRATION_CYCLES_MS[active],
        );
        return () => window.clearTimeout(timer);
    }, [active]);

    return { active, step };
}

export default function StackSecuritySection() {
    const { active, step } = useRotatingIntegration();

    return (
        <section id="security" className="w-full border-b border-edge bg-ink">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="border-edge px-6 pt-20 pb-12 md:px-9 lg:border-r lg:pt-28">
                    <p className={MONO_LABEL}>Stack and security</p>
                    <h2 className="mt-5 max-w-[18ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                        <RollingText text="Fits your stack. Keeps your code safe." />
                    </h2>
                </div>
                <div className="flex items-end bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <FadeIn delay={0.15}>
                        <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                            Darwin works inside the tools your team already uses, with access you
                            grant and can take back at any time.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="grid grid-cols-1 border-t border-edge lg:grid-cols-2">
                <div className="flex items-center justify-center border-edge px-4 py-8 max-lg:order-1 max-lg:border-b md:px-9 lg:border-r lg:py-10">
                    <HairlineFigure
                        figure={mountIntegrationTower}
                        value={active}
                        label="An issue travels from one of your tools into the Darwin tower, is tested floor by floor, and leaves as a pull request to GitHub."
                        className="max-w-[40rem]"
                    />
                </div>

                <div className="flex flex-col max-lg:contents">
                    <div className="flex flex-1 flex-col justify-center px-6 py-14 max-lg:order-3 md:px-12 lg:px-16">
                        <FadeIn>
                            <h3 className="max-w-[22ch] text-[26px] leading-[1.15] font-medium tracking-[-0.03em] text-foreground sm:text-[30px]">
                                Works where your team already talks.
                            </h3>
                            <ul className="mt-8 flex flex-col gap-4">
                                {POINTS.map((point) => (
                                    <li key={point} className="flex items-start gap-4">
                                        <span
                                            aria-hidden
                                            className="mt-2 size-1.5 shrink-0 bg-primary"
                                        />
                                        <span className="max-w-[44ch] text-[16px] leading-[1.5] text-neutral-500">
                                            {point}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </FadeIn>
                        <FadeIn delay={0.15}>
                            <Link
                                href="/#how-it-works"
                                className="group mt-10 inline-flex w-fit items-center gap-2 bg-foreground py-3 pr-3.5 pl-5 font-mono text-[12px] tracking-[0.12em] text-snow uppercase transition-opacity hover:opacity-90"
                            >
                                Learn more
                                <CtaArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </FadeIn>
                    </div>

                    <div className="border-edge max-lg:order-2 max-lg:border-b lg:border-t">
                        <div className="flex items-stretch border-b border-edge">
                            <p className="flex-1 px-6 py-4 font-mono text-[12px] tracking-[0.12em] text-foreground uppercase md:px-9">
                                Integrations
                            </p>
                            <button
                                type="button"
                                aria-label="Previous integration"
                                onClick={() => step(-1)}
                                className="flex w-14 cursor-pointer items-center justify-center border-l border-edge text-foreground transition-colors hover:bg-mist"
                            >
                                <BackChevronIcon className="size-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next integration"
                                onClick={() => step(1)}
                                className="flex w-14 cursor-pointer items-center justify-center border-l border-edge text-foreground transition-colors hover:bg-mist"
                            >
                                <CtaArrowIcon className="size-4" />
                            </button>
                        </div>

                        <ul className="grid grid-cols-4">
                            {INTEGRATIONS.map((integration, index) => {
                                const selected = index === active;
                                return (
                                    <li
                                        key={integration.name}
                                        aria-current={selected ? "true" : undefined}
                                        className={cn(
                                            "relative flex h-20 items-center justify-center border-dashed border-edge not-last:border-r sm:h-32",
                                        )}
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "absolute top-3 left-3 size-1.5 bg-primary transition-opacity duration-300",
                                                selected ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                "flex size-8 items-center justify-center overflow-hidden transition-[opacity,filter] duration-300 sm:size-11",
                                                selected ? "opacity-100" : "opacity-45 grayscale",
                                            )}
                                        >
                                            {LOGOS[integration.name]}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
