"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import RollingSwap from "@/components/utility/RollingSwap";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { RAISED_SHADOW } from "../boxStyles";
import StatusBlock from "../StatusBlock";
import {
    PICKUP_BEATS,
    PICKUP_LOOP_MS,
    PICKUP_STILL_BEAT,
    type PickupBeat,
    type PickupPhase,
    STALE_ISSUES,
} from "./pickupTimeline";
import { pixelEase } from "./pixelEase";
import { useTimelineBeat } from "./useTimelineBeat";

const SLIDE = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;
const DROP = { duration: 0.5, ease: pixelEase(10) };
const DUST = [
    [-16, -10],
    [16, -10],
    [-12, 8],
    [12, 8],
];

function laneFor(phase: PickupPhase) {
    if (phase === "progress") return KanbanStatus.InProgress;
    if (phase === "review") return KanbanStatus.InReview;
    if (phase === "done" || phase === "leave") return KanbanStatus.Done;
    return KanbanStatus.Todo;
}

function footerFor(beat: PickupBeat) {
    const issue = STALE_ISSUES[beat.issue];
    if (beat.phase === "waiting") {
        return { text: `Waiting ${issue.waitedDays - beat.daysAgo} days`, tone: "text-red-500" };
    }
    if (beat.phase === "claim") return { text: "Claimed just now", tone: "text-neutral-500" };
    if (beat.phase === "progress") {
        return { text: `Fixing in ${issue.runner}`, tone: "text-amber-600" };
    }
    if (beat.phase === "review") {
        return { text: `${issue.tests} tests passed`, tone: "text-green-600" };
    }
    return { text: `Merged by ${issue.reviewer}`, tone: "text-green-600" };
}

function AssigneeSlot({ claimed, dropKey }: { claimed: boolean; dropKey: string }) {
    return (
        <span
            className={cn(
                "relative flex size-8 shrink-0 items-center justify-center",
                !claimed && "border border-dashed border-neutral-300",
            )}
        >
            {claimed && (
                <m.span
                    key={dropKey}
                    className="relative z-20 flex"
                    initial={{ y: -240 }}
                    animate={{ y: 0 }}
                    transition={DROP}
                >
                    <DarwinBlockLogo className={cn("size-8", DARWIN_LOGO_BRAND_COLOR)} />
                </m.span>
            )}
            {claimed &&
                DUST.map(([x, y]) => (
                    <m.span
                        key={`${dropKey}-${x}-${y}`}
                        aria-hidden
                        className="absolute size-1.5 bg-foreground/40"
                        initial={{ x: 0, y: 0, scale: 0 }}
                        animate={{ x, y, scale: [0, 1, 0] }}
                        transition={{ delay: DROP.duration, duration: 0.45, ease: "easeOut" }}
                    />
                ))}
        </span>
    );
}

function IssueCard({ beat, cycle }: { beat: PickupBeat; cycle: number }) {
    const issue = STALE_ISSUES[beat.issue];
    const claimed = beat.phase !== "waiting";
    const footer = footerFor(beat);

    return (
        <div className={cn("border border-edge bg-snow", RAISED_SHADOW)}>
            <div className="flex h-11 items-center gap-2.5 border-b border-edge px-4">
                <StatusBlock status={laneFor(beat.phase)} />
                <span className="font-mono text-[11px] text-neutral-400">{issue.id}</span>
                <span className="ml-auto border border-edge px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-neutral-500 uppercase">
                    {issue.label}
                </span>
            </div>
            <p className="px-4 pt-4 pb-5 text-[19px] leading-tight tracking-[-0.015em] text-foreground">
                {issue.title}
            </p>
            <div className="flex h-14 items-center gap-3 border-t border-dashed border-edge px-4">
                <AssigneeSlot claimed={claimed} dropKey={`${cycle}-${beat.issue}`} />
                <span
                    className={cn(
                        "text-[13.5px] transition-colors duration-300",
                        claimed ? "text-foreground" : "text-neutral-400",
                    )}
                >
                    {claimed ? "Darwin" : "Unassigned"}
                </span>
                <span
                    className={cn(
                        "ml-auto font-mono text-[11px] tracking-[0.08em] uppercase transition-colors duration-300",
                        footer.tone,
                    )}
                >
                    <RollingSwap text={footer.text} />
                </span>
            </div>
        </div>
    );
}

export default function PickupStage() {
    const { ref, beat, cycle } = useTimelineBeat(PICKUP_BEATS, PICKUP_LOOP_MS, PICKUP_STILL_BEAT);
    const lane = laneFor(beat.phase);

    return (
        <div ref={ref} className="flex w-full flex-col items-center">
            <span
                className={cn(
                    "relative z-10 flex h-8 items-center gap-2.5 bg-foreground px-3 font-mono text-[11.5px] tracking-[0.12em] text-snow uppercase",
                    RAISED_SHADOW,
                )}
            >
                <StatusBlock status={lane} />
                <RollingSwap text={KanbanBoard.columnFor(lane)!.title} />
            </span>
            <div className="relative mt-6 h-[214px] w-full max-w-[24rem]">
                <AnimatePresence initial={false}>
                    {beat.phase !== "leave" && (
                        <m.div
                            key={`${cycle}-${beat.issue}`}
                            className="absolute inset-x-0 top-0"
                            initial={{ y: -520 }}
                            animate={{ y: 0, transition: SLIDE }}
                            exit={{ y: 560, transition: { ...SLIDE, duration: 0.55 } }}
                        >
                            <IssueCard beat={beat} cycle={cycle} />
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
