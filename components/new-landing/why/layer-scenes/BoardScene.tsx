"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

import { GithubLogoIcon } from "@/components/icons";
import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { useLoopClock } from "@/components/new-landing/how-it-works-details/create-issue-demo/useLoopClock";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { BoardGlyph } from "../../PixelGlyphs";
import StatusBlock from "../../StatusBlock";
import { ClaudeMark, EASE, SceneWindow } from "./sceneKit";

const WIDTH = 560;
const LOOP = 10800;
const STILL = 2400;

const AT = {
    aIn: 600,
    aClaim: 1900,
    aMove: 3000,
    bIn: 4600,
    bClaim: 5900,
    bMove: 7000,
    fade: 10200,
};

const LANE_X = [16, 290];
const CARD_X = [LANE_X[0] + 8, LANE_X[1] + 8];
const SLOT_Y = [58, 166];
const MOVE = { duration: 0.6, ease: EASE };

type SceneIssue = {
    id: string;
    title: string;
    source?: { label: string; icon: ReactNode };
};

const ISSUE_A: SceneIssue = {
    id: "NOC-142",
    title: "Checkout total rounds wrong",
    source: {
        label: "GitHub",
        icon: <GithubLogoIcon className="size-3 text-foreground/70" aria-hidden />,
    },
};

const ISSUE_B: SceneIssue = {
    id: "NOC-143",
    title: "Dark mode flashes on load",
    source: {
        label: "Claude",
        icon: <ClaudeMark className="size-3" style={{ color: "#d97757" }} />,
    },
};

const ISSUE_OLD: SceneIssue = { id: "NOC-138", title: "Dates render in UTC" };

function SceneCard({
    issue,
    x,
    y,
    shown,
    claimed,
    working,
    dimmed,
}: {
    issue: SceneIssue;
    x: number;
    y: number;
    shown: boolean;
    claimed: boolean;
    working: boolean;
    dimmed?: boolean;
}) {
    return (
        <m.div
            className={cn(
                "absolute top-0 left-0 z-10 w-[238px] rounded-lg border border-black/10 bg-snow p-3 shadow-[0_10px_24px_-14px_rgba(24,18,48,0.35)]",
                dimmed && "opacity-70",
            )}
            initial={false}
            animate={{ x, y: shown ? y : y - 36, opacity: shown ? (dimmed ? 0.7 : 1) : 0 }}
            transition={MOVE}
        >
            <div className="flex items-center gap-2">
                <m.span
                    key={String(working)}
                    className="flex"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                >
                    <StatusBlock
                        status={working ? KanbanStatus.InProgress : KanbanStatus.Todo}
                        className="size-3.5"
                    />
                </m.span>
                <span className="font-mono text-[10.5px] text-neutral-400">{issue.id}</span>
                {issue.source && (
                    <span className="ml-auto flex items-center gap-1 rounded-sm border border-edge px-1.5 py-0.5 text-[10px] text-neutral-500">
                        {issue.source.icon}
                        via {issue.source.label}
                    </span>
                )}
            </div>
            <p className="mt-1.5 truncate text-[13px] leading-snug font-medium text-foreground">
                {issue.title}
            </p>
            <div className="relative mt-2.5 h-5">
                <m.span
                    className="absolute inset-y-0 left-0 flex items-center gap-1.5"
                    initial={false}
                    animate={{ opacity: claimed ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="size-3.5 rounded-sm border border-dashed border-neutral-300" />
                    <span className="text-[11px] text-neutral-400">Unassigned</span>
                </m.span>
                <m.span
                    className="absolute inset-0 flex items-center gap-1.5"
                    initial={false}
                    animate={{ opacity: claimed ? 1 : 0, scale: claimed ? 1 : 0.85 }}
                    transition={{ duration: 0.3, ease: EASE }}
                >
                    <DarwinBlockLogo className={cn("size-4", DARWIN_LOGO_BRAND_COLOR)} />
                    <span className="text-[11px] text-foreground">Darwin</span>
                    <span className="ml-auto text-[10.5px] font-medium text-violet-500">
                        just now
                    </span>
                </m.span>
            </div>
        </m.div>
    );
}

function Lane({
    left,
    status,
    name,
    count,
}: {
    left: number;
    status: KanbanStatus;
    name: string;
    count: number;
}) {
    return (
        <div
            className="absolute inset-y-4 w-[254px] rounded-lg border border-edge/70 bg-mist/60"
            style={{ left }}
        >
            <div className="flex h-9 items-center gap-2 px-2.5">
                <StatusBlock status={status} className="size-3.5" />
                <span className="text-[12.5px] text-foreground/85">{name}</span>
                <m.span
                    key={count}
                    initial={{ scale: 0.7, opacity: 0.4 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="ml-auto flex size-5 items-center justify-center rounded-sm border border-edge bg-snow font-mono text-[10.5px] text-neutral-500 tabular-nums"
                >
                    {count}
                </m.span>
            </div>
        </div>
    );
}

export default function BoardScene() {
    const { ref, time } = useLoopClock(LOOP, STILL);
    const live = time < AT.fade;
    const aIn = live && time >= AT.aIn;
    const aClaim = live && time >= AT.aClaim;
    const aMove = live && time >= AT.aMove;
    const bIn = live && time >= AT.bIn;
    const bClaim = live && time >= AT.bClaim;
    const bMove = live && time >= AT.bMove;

    const todoCount = (aIn && !aMove ? 1 : 0) + (bIn && !bMove ? 1 : 0) + 1;
    const workingCount = (aMove ? 1 : 0) + (bMove ? 1 : 0);
    const oldSlot = (aIn && !aMove) || (bIn && !bMove) ? 1 : 0;

    const toastIssue =
        time >= AT.bClaim && time < AT.bClaim + 1600
            ? ISSUE_B
            : time >= AT.aClaim && time < AT.aClaim + 1600
              ? ISSUE_A
              : null;

    return (
        <div ref={ref}>
            <div>
                <SceneWindow
                    width={WIDTH}
                    title={
                        <>
                            <BoardGlyph className="size-4 text-foreground/70" />
                            <span className="text-neutral-500">acme</span>
                            <span className="text-neutral-300">/</span>
                            Board
                        </>
                    }
                >
                    <div className="relative h-[292px]">
                        <Lane
                            left={LANE_X[0]}
                            status={KanbanStatus.Todo}
                            name="To do"
                            count={todoCount}
                        />
                        <Lane
                            left={LANE_X[1]}
                            status={KanbanStatus.InProgress}
                            name="In progress"
                            count={workingCount}
                        />

                        <SceneCard
                            issue={ISSUE_OLD}
                            x={CARD_X[0]}
                            y={SLOT_Y[oldSlot]}
                            shown
                            claimed={false}
                            working={false}
                            dimmed
                        />
                        <SceneCard
                            issue={ISSUE_A}
                            x={aMove ? CARD_X[1] : CARD_X[0]}
                            y={SLOT_Y[0]}
                            shown={aIn}
                            claimed={aClaim}
                            working={aMove}
                        />
                        <SceneCard
                            issue={ISSUE_B}
                            x={bMove ? CARD_X[1] : CARD_X[0]}
                            y={SLOT_Y[bMove ? 1 : 0]}
                            shown={bIn}
                            claimed={bClaim}
                            working={bMove}
                        />

                        <m.div
                            initial={false}
                            animate={{
                                opacity: toastIssue ? 1 : 0,
                                y: toastIssue ? 0 : -8,
                            }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="absolute top-2.5 right-2.5 z-30 flex items-center gap-2 rounded-md border border-black/10 bg-snow px-3 py-2 shadow-[0_10px_28px_-12px_rgba(24,18,48,0.4)]"
                        >
                            <DarwinBlockLogo className={cn("size-4", DARWIN_LOGO_BRAND_COLOR)} />
                            <span className="text-[11.5px] text-foreground">
                                <span className="font-mono text-[10.5px] text-neutral-400">
                                    {(toastIssue ?? ISSUE_A).id}
                                </span>{" "}
                                claimed by Darwin
                            </span>
                        </m.div>
                    </div>
                </SceneWindow>
            </div>
        </div>
    );
}
