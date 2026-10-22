"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PullRequestGlyph } from "../PixelGlyphs";
import type { IssueSource, MachineBeat } from "./backlogTimeline";
import { BACKLOG } from "./backlogTimeline";
import { pixelEase } from "./pixelEase";
import { SourceIcon } from "./SourceIcon";

const TILE = 96;
const CONSOLE_TOP = 284;
const WIRED_SOURCES: IssueSource[] = ["Slack", "Telegram", "GitHub"];
const PULSE = { duration: 0.42, ease: pixelEase(8) };

function Tile({
    left,
    top,
    lit,
    children,
}: {
    left: string;
    top: number;
    lit: boolean;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                "absolute flex size-24 items-center justify-center transition-colors duration-300",
                lit
                    ? "bg-foreground text-snow"
                    : "bg-[color-mix(in_oklab,var(--tone)_16%,var(--color-snow))] text-foreground",
            )}
            style={{ left, top }}
        >
            {children}
        </div>
    );
}

function TileLabel({ left, top, children }: { left: string; top: number; children: ReactNode }) {
    return (
        <p
            className="absolute flex size-24 items-end p-2.5 font-mono text-[10.5px] leading-[1.3] tracking-[0.12em] text-foreground/75 uppercase"
            style={{ left, top }}
        >
            {children}
        </p>
    );
}

function Wire({ left, top, pulse }: { left: string; top: number; pulse: string | null }) {
    return (
        <div className="absolute h-0.5 w-24 bg-foreground" style={{ left, top: top - 1 }}>
            <span className="absolute -top-0.5 -left-0.5 size-1.5 bg-foreground" />
            <span className="absolute -top-0.5 -right-0.5 size-1.5 bg-foreground" />
            {pulse && (
                <m.span
                    key={pulse}
                    className="absolute -top-[3px] size-2 bg-snow"
                    initial={{ left: "0%" }}
                    animate={{ left: "calc(100% - 8px)" }}
                    transition={PULSE}
                />
            )}
        </div>
    );
}

export default function MachineWiring({ beat, cycle }: { beat: MachineBeat; cycle: number }) {
    const selecting = beat.phase === "select" && beat.active !== null;
    const pickedSource = selecting ? BACKLOG[beat.active!].source : null;
    const delivered = (beat.phase === "select" && beat.shipped > 0) || beat.phase === "clear";
    const delivery = delivered ? `${cycle}-${beat.shipped}` : null;
    const outLeft = `calc(100% + ${TILE}px)`;

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 max-xl:hidden">
            <TileLabel left={`-${TILE * 2}px`} top={CONSOLE_TOP - TILE}>
                Filed in
            </TileLabel>
            {WIRED_SOURCES.map((source, index) => {
                const top = CONSOLE_TOP + index * TILE;
                const lit = pickedSource === source;
                return (
                    <div key={source}>
                        <Tile left={`-${TILE * 2}px`} top={top} lit={lit}>
                            <SourceIcon source={source} className="size-7" />
                        </Tile>
                        <Wire
                            left={`-${TILE}px`}
                            top={top + TILE / 2}
                            pulse={lit ? `${cycle}-${beat.active}` : null}
                        />
                    </div>
                );
            })}

            <TileLabel left={outLeft} top={CONSOLE_TOP}>
                Shipped to
                <br />
                your repo
            </TileLabel>
            <Wire left="100%" top={CONSOLE_TOP + TILE * 1.5} pulse={delivery} />
            <Tile left={outLeft} top={CONSOLE_TOP + TILE} lit={delivered}>
                <PullRequestGlyph className="size-8" />
            </Tile>
        </div>
    );
}
