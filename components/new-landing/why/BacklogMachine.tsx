"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { FooterLinkHoverArrowIcon, PullRequestOpenIcon } from "@/components/icons";
import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import RollingSwap from "@/components/utility/RollingSwap";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { RAISED_SHADOW } from "../boxStyles";
import StatusBlock from "../StatusBlock";
import {
    BACKLOG,
    type BacklogIssue,
    ISSUE_SOURCES,
    type IssueSource,
    MACHINE_BEATS,
    MACHINE_LOOP_MS,
    type MachineBeat,
    PACKET_MS,
    STILL_BEAT,
} from "./backlogTimeline";
import MachineWiring from "./MachineWiring";
import { pixelEase } from "./pixelEase";
import { SourceIcon } from "./SourceIcon";
import { useTimelineBeat } from "./useTimelineBeat";

const ROW_HEIGHT = 44;
const SLIDE = { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const;
const PROGRESS_CELLS = 6;
const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;

function chipText(beat: MachineBeat) {
    if (beat.active === null) {
        return beat.phase === "clear" ? "Backlog clear" : "Waiting for work";
    }
    const issue = BACKLOG[beat.active];
    if (beat.phase === "work") return `Fixing ${issue.id}`;
    if (beat.phase === "tested") return `${issue.tests} tests passed`;
    if (beat.phase === "ship") return `Opening PR #${issue.pullRequest}`;
    return `Picking up ${issue.id}`;
}

function MachineSlot({ beat }: { beat: MachineBeat }) {
    const working = beat.phase === "work";
    const proven = beat.phase === "tested" || beat.phase === "ship" || beat.phase === "clear";

    return (
        <div className={cn("bg-foreground p-1.5", RAISED_SHADOW)}>
            <div
                className="relative flex size-28 items-center justify-center lg:size-32"
                style={{
                    background:
                        "color-mix(in oklab, var(--color-foreground) 90%, var(--color-snow))",
                    boxShadow:
                        "inset 3px 3px 0 color-mix(in oklab, var(--color-black) 45%, transparent), inset -3px -3px 0 color-mix(in oklab, var(--color-snow) 10%, transparent)",
                }}
            >
                <m.div
                    animate={working ? { y: [0, -5, 0] } : { y: 0 }}
                    transition={
                        working
                            ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                            : { duration: 0.3 }
                    }
                >
                    <DarwinBlockLogo
                        className={cn("size-16 lg:size-20", DARWIN_LOGO_BRAND_COLOR)}
                    />
                </m.div>
                <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
                    {Array.from({ length: PROGRESS_CELLS }, (_, cell) => (
                        <span
                            key={cell}
                            className={cn(
                                "size-1.5 transition-colors duration-200",
                                proven
                                    ? "bg-green-500"
                                    : working
                                      ? "bg-(--tone)"
                                      : "bg-[color-mix(in_oklab,var(--color-snow)_14%,transparent)]",
                            )}
                            style={{ transitionDelay: working ? `${cell * 90}ms` : "0ms" }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

const BEAM_EASE = pixelEase(12);

function Beam({
    direction,
    packet,
    status,
    className,
}: {
    direction: "up" | "down";
    packet: string | null;
    status: KanbanStatus;
    className: string;
}) {
    const from = direction === "up" ? "100%" : "-18px";
    const to = direction === "up" ? "-18px" : "100%";

    return (
        <div
            className={cn("relative w-[18px] overflow-hidden", className)}
            style={{
                backgroundImage:
                    "linear-gradient(to bottom, color-mix(in oklab, var(--color-white) 45%, transparent) 1px, transparent 1px)",
                backgroundSize: "100% 18px",
            }}
        >
            {packet && (
                <m.div
                    key={packet}
                    aria-hidden
                    className="absolute left-0.5 flex"
                    initial={{ top: from }}
                    animate={{ top: to }}
                    transition={{ duration: PACKET_MS / 1000, ease: BEAM_EASE }}
                >
                    <StatusBlock status={status} />
                </m.div>
            )}
        </div>
    );
}

const ROW_VARIANTS = {
    hidden: { height: 0 },
    shown: (index: number) => ({
        height: ROW_HEIGHT,
        transition: { ...SLIDE, delay: index * 0.1 },
    }),
    gone: { height: 0, transition: SLIDE },
};

const ROW_CONTENT_VARIANTS = {
    hidden: { y: -ROW_HEIGHT },
    shown: (index: number) => ({ y: 0, transition: { ...SLIDE, delay: index * 0.1 } }),
    gone: { y: -ROW_HEIGHT, transition: SLIDE },
};

function SlideRow({ index, children }: { index: number; children: ReactNode }) {
    return (
        <m.div
            layout="position"
            custom={index}
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="shown"
            exit="gone"
            className="overflow-hidden"
        >
            <m.div
                custom={index}
                variants={ROW_CONTENT_VARIANTS}
                className="flex h-11 items-center gap-3 border-b border-dashed border-edge px-3 sm:px-4"
            >
                {children}
            </m.div>
        </m.div>
    );
}

function ColumnHeading({ label, count }: { label: string; count: number }) {
    return (
        <div className="flex h-10 items-center justify-between border-b border-edge px-3 sm:px-4">
            <span className="font-mono text-[10.5px] tracking-[0.12em] text-neutral-500 uppercase">
                {label}
            </span>
            <span className="font-mono text-[11px] text-foreground tabular-nums">
                <RollingSwap text={String(count)} direction="down" />
            </span>
        </div>
    );
}

function BacklogRow({ issue, picked }: { issue: BacklogIssue; picked: boolean }) {
    return (
        <>
            <StatusBlock
                status={picked ? KanbanStatus.InProgress : KanbanStatus.Todo}
                className="shrink-0"
            />
            <span className="hidden w-14 shrink-0 font-mono text-[10.5px] text-neutral-400 sm:block">
                {issue.id}
            </span>
            <span
                className={cn(
                    "truncate text-[13px] transition-colors duration-300",
                    picked ? "text-foreground" : "text-foreground/75",
                )}
            >
                {issue.title}
            </span>
            <SourceIcon
                source={issue.source}
                className="ml-auto size-3.5 shrink-0 text-neutral-400"
            />
        </>
    );
}

function PullRequestRow({ issue }: { issue: BacklogIssue }) {
    return (
        <>
            <span className="flex size-[18px] shrink-0 items-center justify-center bg-green-500 text-white">
                <PullRequestOpenIcon className="size-3" aria-hidden />
            </span>
            <span className="hidden w-10 shrink-0 font-mono text-[10.5px] text-neutral-400 sm:block">
                #{issue.pullRequest}
            </span>
            <span className="truncate text-[13px] text-foreground/75">{issue.title}</span>
            <span className="ml-auto hidden shrink-0 gap-1.5 font-mono text-[10.5px] md:flex">
                <span className="text-green-600">+{issue.added}</span>
                <span className="text-red-500">−{issue.removed}</span>
            </span>
        </>
    );
}

function EmptyColumn({ children }: { children: ReactNode }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 font-mono text-[10.5px] tracking-[0.12em] text-neutral-400 uppercase">
            {children}
        </div>
    );
}

function SourceTabs({ active }: { active: IssueSource }) {
    return (
        <div className="flex items-stretch gap-1 p-1 pb-1.5">
            {ISSUE_SOURCES.map((source) => {
                const selected = source === active;
                return (
                    <span
                        key={source}
                        className={cn(
                            "relative flex h-9 items-center gap-2 px-3 text-[13px] transition-colors duration-300 sm:px-3.5",
                            selected ? "text-foreground" : "text-snow/60",
                        )}
                    >
                        {selected && (
                            <m.span
                                layoutId="why-source-tab"
                                transition={SLIDE}
                                className="absolute inset-0 bg-snow"
                            />
                        )}
                        <SourceIcon source={source} className="relative size-3.5" />
                        <span className="relative max-sm:hidden">{source}</span>
                    </span>
                );
            })}
            <Link
                href="/how-it-works"
                className="ml-auto flex items-center gap-2 bg-snow/8 px-3.5 text-[13px] text-snow transition-colors hover:bg-snow/14 max-md:hidden"
            >
                How it works
                <FooterLinkHoverArrowIcon className="size-4 rotate-[-135deg]" />
            </Link>
        </div>
    );
}

export default function BacklogMachine({ tone }: { tone: string }) {
    const { ref, beat, cycle } = useTimelineBeat(MACHINE_BEATS, MACHINE_LOOP_MS, STILL_BEAT);
    const waiting = BACKLOG.slice(beat.taken);
    const shipped = BACKLOG.slice(0, beat.shipped).reverse();
    const activeSource = beat.active === null ? "Board" : BACKLOG[beat.active].source;
    const picked = beat.phase === "select" ? beat.active : null;
    const rising = beat.phase === "rise" ? `${cycle}-${beat.active}-up` : null;
    const shipping = beat.phase === "ship" ? `${cycle}-${beat.active}-down` : null;

    return (
        <div
            ref={ref}
            className="relative mx-auto flex w-full max-w-[64rem] flex-col items-center xl:max-w-[768px]"
            style={{ "--tone": tone } as CSSProperties}
        >
            <MachineWiring beat={beat} cycle={cycle} />
            <span
                className={cn(
                    "flex h-8 w-56 items-center justify-center bg-foreground font-mono text-[11.5px] tracking-[0.12em] text-snow uppercase",
                    RAISED_SHADOW,
                )}
            >
                <RollingSwap text={chipText(beat)} />
            </span>

            <div className="mt-4">
                <MachineSlot beat={beat} />
            </div>

            <div className="flex h-16 gap-1.5 lg:h-24">
                <Beam
                    direction="up"
                    packet={rising}
                    status={KanbanStatus.Todo}
                    className="bg-amber-100"
                />
                <Beam
                    direction="down"
                    packet={shipping}
                    status={KanbanStatus.Done}
                    className="bg-orange-500"
                />
            </div>

            <div className={cn("w-full bg-foreground p-1.5", RAISED_SHADOW)}>
                <SourceTabs active={activeSource} />
                <div className="grid grid-cols-2 bg-snow">
                    <div className="min-w-0">
                        <ColumnHeading label="Backlog" count={waiting.length} />
                        <div className="relative h-[220px] overflow-hidden">
                            <AnimatePresence initial={false}>
                                {waiting.map((issue, index) => (
                                    <SlideRow key={issue.id} index={index}>
                                        <BacklogRow
                                            issue={issue}
                                            picked={picked === BACKLOG.indexOf(issue)}
                                        />
                                    </SlideRow>
                                ))}
                            </AnimatePresence>
                            {waiting.length === 0 && (
                                <EmptyColumn>
                                    <StatusBlock status={KanbanStatus.Done} scale={2} />
                                    Nothing left to fix
                                </EmptyColumn>
                            )}
                        </div>
                    </div>
                    <div className="min-w-0 border-l border-edge">
                        <ColumnHeading label="Pull requests" count={shipped.length} />
                        <div className="relative h-[220px] overflow-hidden">
                            <AnimatePresence initial={false}>
                                {shipped.map((issue) => (
                                    <SlideRow key={issue.id} index={0}>
                                        <PullRequestRow issue={issue} />
                                    </SlideRow>
                                ))}
                            </AnimatePresence>
                            {shipped.length === 0 && (
                                <EmptyColumn>
                                    <span className={cn("size-1.5 bg-current", DONE_TONE)} />
                                    Nothing shipped yet
                                </EmptyColumn>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
