"use client";

import Image from "next/image";
import { type CSSProperties, useState } from "react";

import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";

type FounderKey = "Rishi" | "Anjan" | "Piyush";

type CompactPlacement = { x: number; bottom: number; width: number };

type Portrait = {
    x: number;
    src: string;
    founder?: FounderKey;
    width?: number;
    compact?: CompactPlacement;
};

const FOUNDERS: { key: FounderKey; name: string; role: string; bio: string }[] = [
    {
        key: "Rishi",
        name: "Rishi Kant",
        role: "Founder & CEO",
        bio: "Full-stack engineer who took Nocturn from zero to one before starting Darwin.",
    },
    {
        key: "Anjan",
        name: "Anjan Suman",
        role: "Co-founder",
        bio: "Full-stack engineer who co-built Nocturn and now works on how Darwin runs your code.",
    },
    {
        key: "Piyush",
        name: "Piyush Raj",
        role: "Co-founder",
        bio: "Full-stack engineer and designer who co-built Nocturn and shapes how Darwin feels.",
    },
];

const CROWD_WIDTH = 16;
const FOUNDER_WIDTH = 19;

const crowd = (index: number) => `/images/team/background/${index}.png`;
const founder = (key: FounderKey) => `/images/team/founders/${key.toLowerCase()}.png`;

const ROWS: { shelf: number; portraits: Portrait[] }[] = [
    {
        shelf: 54.9,
        portraits: [
            { x: 18, src: crowd(1) },
            { x: 39.5, src: crowd(7) },
            { x: 60.5, src: crowd(3) },
            { x: 82, src: crowd(9) },
        ],
    },
    {
        shelf: 77.2,
        portraits: [
            { x: 8, src: crowd(5) },
            { x: 29, src: crowd(4) },
            {
                x: 50,
                src: founder("Rishi"),
                founder: "Rishi",
                compact: { x: 50, bottom: 30, width: 40 },
            },
            { x: 71, src: crowd(6) },
            { x: 92, src: crowd(2) },
        ],
    },
    {
        shelf: 100,
        portraits: [
            { x: 15, src: crowd(8) },
            {
                x: 36,
                src: founder("Anjan"),
                founder: "Anjan",
                width: 16.5,
                compact: { x: 24, bottom: 0, width: 36 },
            },
            {
                x: 64,
                src: founder("Piyush"),
                founder: "Piyush",
                compact: { x: 76, bottom: 0, width: 42 },
            },
            { x: 85, src: crowd(10) },
        ],
    },
];

function CornerTick({ className }: { className: string }) {
    return <span aria-hidden className={cn("absolute top-0 h-px w-3 bg-neutral-400", className)} />;
}

export default function TeamSection() {
    const [spotlight, setSpotlight] = useState<FounderKey | null>(null);

    return (
        <section
            id="team"
            className="flex w-full flex-col border-b border-edge bg-ink lg:h-[calc(100svh-2.75rem)]"
        >
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="border-edge px-6 pt-16 pb-10 md:px-9 lg:border-r lg:pt-20">
                    <p className={MONO_LABEL}>Team</p>
                    <h1 className="mt-5 max-w-[18ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                        <RollingText text="The people behind Darwin." />
                    </h1>
                </div>
                <div className="flex items-end bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <FadeIn delay={0.15}>
                        <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                            A small team of engineers building the teammate we always wanted: one
                            that takes the issue and comes back with a pull request.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="flex justify-center overflow-hidden border-t border-edge px-6 md:px-9 lg:min-h-0 lg:flex-1 lg:[container-type:size]">
                <div className="relative flex w-full flex-col justify-end border-x border-edge pt-6 lg:h-full lg:w-[min(80rem,100cqw,calc((100cqh-2rem)*2.5))] lg:pt-0">
                    <CornerTick className="-left-1.5" />
                    <CornerTick className="-right-1.5" />
                    <FadeIn y={0} className="relative aspect-[3/2] w-full lg:aspect-[5/2]">
                        {ROWS.map((row) =>
                            row.portraits.map((portrait) => {
                                const owner = portrait.founder;
                                const placement = {
                                    left: `${portrait.x}%`,
                                    bottom: `${100 - row.shelf}%`,
                                    width: `${portrait.width ?? (owner ? FOUNDER_WIDTH : CROWD_WIDTH)}%`,
                                };
                                if (!owner) {
                                    return (
                                        <Image
                                            key={`${row.shelf}-${portrait.x}`}
                                            src={portrait.src}
                                            alt=""
                                            aria-hidden
                                            width={240}
                                            height={260}
                                            className="portrait-blurred pointer-events-none absolute z-10 -translate-x-1/2 mask-b-from-50% mask-b-to-88% max-lg:hidden"
                                            style={placement}
                                        />
                                    );
                                }
                                const dimmed = spotlight !== null && spotlight !== owner;
                                return (
                                    <div
                                        key={`${row.shelf}-${portrait.x}`}
                                        onMouseEnter={() => setSpotlight(owner)}
                                        onMouseLeave={() => setSpotlight(null)}
                                        className="team-founder absolute bottom-(--compact-bottom) left-(--compact-x) z-10 grid w-(--compact-width) -translate-x-1/2 hover:z-20 lg:bottom-(--bottom) lg:left-(--left) lg:w-(--width)"
                                        style={
                                            {
                                                "--left": placement.left,
                                                "--bottom": placement.bottom,
                                                "--width": placement.width,
                                                "--compact-x": `${portrait.compact?.x}%`,
                                                "--compact-bottom": `${portrait.compact?.bottom}%`,
                                                "--compact-width": `${portrait.compact?.width}%`,
                                            } as CSSProperties
                                        }
                                    >
                                        <Image
                                            src={portrait.src}
                                            alt={owner}
                                            width={240}
                                            height={260}
                                            className={cn(
                                                "portrait-sharp col-start-1 row-start-1 w-full mask-b-from-50% mask-b-to-88% transition-opacity duration-400 will-change-[opacity]",
                                                dimmed && "opacity-0",
                                            )}
                                        />
                                        <Image
                                            src={portrait.src}
                                            alt=""
                                            aria-hidden
                                            width={240}
                                            height={260}
                                            className={cn(
                                                "portrait-blurred pointer-events-none col-start-1 row-start-1 w-full mask-b-from-50% mask-b-to-88% transition-opacity duration-400 will-change-[opacity]",
                                                !dimmed && "opacity-0",
                                            )}
                                        />
                                    </div>
                                );
                            }),
                        )}
                    </FadeIn>
                </div>
            </div>

            <ul className="grid grid-cols-1 border-t border-edge md:grid-cols-3">
                {FOUNDERS.map((person) => {
                    const lit = spotlight === person.key;
                    return (
                        <li
                            key={person.key}
                            onMouseEnter={() => setSpotlight(person.key)}
                            onMouseLeave={() => setSpotlight(null)}
                            className={cn(
                                "relative flex flex-col gap-1.5 border-edge px-6 py-5 transition-colors duration-300 not-last:max-md:border-b md:px-9 md:not-last:border-r",
                                lit && "bg-mist",
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    "absolute top-3 left-3 size-1.5 bg-primary transition-opacity duration-300",
                                    lit ? "opacity-100" : "opacity-0",
                                )}
                            />
                            <span className="flex items-baseline justify-between gap-4">
                                <span className="text-[17px] tracking-[-0.01em] text-foreground">
                                    {person.name}
                                </span>
                                <span className={MONO_LABEL}>{person.role}</span>
                            </span>
                            <span className="max-w-[44ch] text-[14px] leading-[1.5] text-neutral-500">
                                {person.bio}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
