"use client";

import * as m from "motion/react-m";

import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { useLoopClock } from "@/components/new-landing/how-it-works-details/create-issue-demo/useLoopClock";
import { BoardGlyph, TerminalGlyph } from "@/components/new-landing/PixelGlyphs";
import StatusBlock from "@/components/new-landing/StatusBlock";
import { EASE, SceneCursor, SceneWindow } from "@/components/new-landing/why/layer-scenes/sceneKit";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

const WIDTH = 1080;
const BODY_H = 470;
const LOOP = 15000;
const STILL = 8400;

const AT = {
    spawn: 700,
    claim: 2100,
    move1: 3400,
    runner: 4600,
    passed: 6200,
    move2: 7200,
    cursor: 8800,
    merge: 9900,
    move3: 10400,
    fade: 14200,
};

const SIDEBAR_W = 178;
const COL_GAP = 12;
const COL_PAD = 14;
const COL_COUNT = 4;
const COL_W = (WIDTH - SIDEBAR_W - COL_PAD * 2 - COL_GAP * (COL_COUNT - 1)) / COL_COUNT;
const CARD_W = COL_W - 16;
const HEADER_H = 46;
const SLOT_H = 92;
const HERO_SHIFT = 122;

const MOVE = { duration: 0.65, ease: EASE };

const COLUMNS = [
    { status: KanbanStatus.Todo, label: "Todo", count: 3 },
    { status: KanbanStatus.InProgress, label: "In progress", count: 2 },
    { status: KanbanStatus.InReview, label: "In review", count: 2 },
    { status: KanbanStatus.Done, label: "Done", count: 7 },
];

const NAV = ["Board", "Backlog", "Pull requests", "Settings"];
const TEAMSPACES = ["acme / web", "acme / api", "acme / mobile"];

type StaticCard = {
    id: string;
    title: string;
    column: number;
    slot: number;
    label?: { text: string; className: string };
    done?: boolean;
    darwin?: boolean;
};

const STATIC_CARDS: StaticCard[] = [
    {
        id: "NOC-138",
        title: "Dates render in UTC",
        column: 0,
        slot: 0,
        label: { text: "Bug", className: "bg-red-500/10 text-red-600" },
    },
    {
        id: "NOC-131",
        title: "Dead link in docs footer",
        column: 0,
        slot: 1,
        label: { text: "Docs", className: "bg-sky-500/10 text-sky-600" },
    },
    {
        id: "NOC-137",
        title: "Flaky retry test",
        column: 1,
        slot: 0,
        label: { text: "CI", className: "bg-amber-500/10 text-amber-600" },
        darwin: true,
    },
    {
        id: "NOC-129",
        title: "Search misses accents",
        column: 2,
        slot: 0,
        label: { text: "Bug", className: "bg-red-500/10 text-red-600" },
        darwin: true,
    },
    { id: "NOC-124", title: "Sync race on save", column: 3, slot: 0, done: true },
    { id: "NOC-118", title: "Crash on empty save", column: 3, slot: 1, done: true },
];

function columnX(column: number) {
    return COL_PAD + column * (COL_W + COL_GAP);
}

function slotY(slot: number) {
    return HEADER_H + 14 + slot * SLOT_H;
}

function heroStage(time: number) {
    if (time < AT.move1) return 0;
    if (time < AT.move2) return 1;
    if (time < AT.move3) return 2;
    return 3;
}

export default function HeroBoard({ className }: { className?: string }) {
    const { ref, time } = useLoopClock(LOOP, STILL);
    const live = time < AT.fade;

    const spawned = live && time >= AT.spawn;
    const claimed = live && time >= AT.claim;
    const running = live && time >= AT.runner && time < AT.move2;
    const passed = live && time >= AT.passed && time < AT.move2;
    const inReview = live && time >= AT.move2;
    const merged = live && time >= AT.merge + 200;
    const stage = live ? heroStage(time) : 0;

    const heroStatus = !live
        ? KanbanStatus.Todo
        : merged
          ? KanbanStatus.Done
          : stage >= 2
            ? KanbanStatus.InReview
            : stage >= 1
              ? KanbanStatus.InProgress
              : KanbanStatus.Todo;

    const heroX = columnX(stage) + 8;
    const heroY = slotY(0);

    const cursorPath = [
        { at: AT.cursor, x: columnX(2) + COL_W - 46, y: slotY(0) + 96 },
        { at: AT.merge, x: columnX(2) + 52, y: slotY(0) + 88, click: true },
        { at: AT.merge + 500, x: columnX(3) + 60, y: slotY(0) + 110 },
    ];

    return (
        <div ref={ref} className={cn("relative", className)} aria-hidden>
            <SceneWindow
                width={WIDTH}
                title={
                    <>
                        <BoardGlyph className="size-4 text-foreground/70" />
                        <span className="text-neutral-500">acme / web</span>
                        <span className="text-neutral-300">/</span>
                        Board
                    </>
                }
                status={
                    <span className="flex items-center gap-1.5 text-neutral-500">
                        <DarwinBlockLogo className={cn("size-3.5", DARWIN_LOGO_BRAND_COLOR)} />
                        darwin · watching
                    </span>
                }
            >
                <div className="relative flex" style={{ height: BODY_H }}>
                    <div
                        className="flex shrink-0 flex-col border-r border-edge bg-mist/40 px-3 pt-3.5 pb-3"
                        style={{ width: SIDEBAR_W }}
                    >
                        {NAV.map((item, index) => (
                            <span
                                key={item}
                                className={cn(
                                    "rounded-md px-2.5 py-[7px] text-[12.5px]",
                                    index === 0
                                        ? "bg-snow font-medium text-foreground shadow-[0_1px_0_rgba(24,18,48,0.06)]"
                                        : "text-neutral-500",
                                )}
                            >
                                {item}
                            </span>
                        ))}
                        <p className="mt-5 px-2.5 font-mono text-[9.5px] tracking-[0.12em] text-neutral-400 uppercase">
                            Teamspaces
                        </p>
                        <div className="mt-1.5 flex flex-col">
                            {TEAMSPACES.map((space, index) => (
                                <span
                                    key={space}
                                    className={cn(
                                        "px-2.5 py-[5px] font-mono text-[11px]",
                                        index === 0 ? "text-foreground/80" : "text-neutral-400",
                                    )}
                                >
                                    {space}
                                </span>
                            ))}
                        </div>
                        <div className="mt-auto flex items-center gap-2 px-2.5">
                            <DarwinBlockLogo className={cn("size-4", DARWIN_LOGO_BRAND_COLOR)} />
                            <span className="text-[11.5px] text-neutral-500">
                                3 issues in flight
                            </span>
                        </div>
                    </div>

                    <div className="relative flex-1">
                        {COLUMNS.map((column, index) => (
                            <div
                                key={column.label}
                                className="absolute top-0 bottom-0"
                                style={{ left: columnX(index), width: COL_W }}
                            >
                                <div className="flex h-[46px] items-center gap-2 px-2">
                                    <StatusBlock status={column.status} className="size-3.5" />
                                    <span className="text-[12.5px] font-medium text-foreground/85">
                                        {column.label}
                                    </span>
                                    <span className="ml-auto font-mono text-[10px] text-neutral-400">
                                        {column.count +
                                            (index === stage && spawned && live ? 1 : 0)}
                                    </span>
                                </div>
                                <div className="absolute inset-x-2 top-[44px] border-t border-edge" />
                            </div>
                        ))}

                        {STATIC_CARDS.map((card) => {
                            const occupied = spawned && card.column === stage;
                            const y = slotY(card.slot) + (occupied ? HERO_SHIFT : 0);
                            return (
                                <m.div
                                    key={card.id}
                                    className={cn(
                                        "absolute top-0 left-0 rounded-lg border border-black/10 bg-snow p-3 shadow-[0_8px_20px_-14px_rgba(24,18,48,0.35)]",
                                        card.done && "opacity-60",
                                    )}
                                    style={{ width: CARD_W }}
                                    initial={false}
                                    animate={{ x: columnX(card.column) + 8, y }}
                                    transition={MOVE}
                                >
                                    <div className="flex items-center gap-2">
                                        <StatusBlock
                                            status={
                                                card.done
                                                    ? KanbanStatus.Done
                                                    : COLUMNS[card.column].status
                                            }
                                            className="size-3"
                                        />
                                        <span className="font-mono text-[9.5px] text-neutral-400">
                                            {card.id}
                                        </span>
                                        {card.label && (
                                            <span
                                                className={cn(
                                                    "ml-auto rounded-sm px-1.5 py-0.5 text-[9px] font-medium",
                                                    card.label.className,
                                                )}
                                            >
                                                {card.label.text}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className={cn(
                                            "mt-1.5 truncate text-[12px] leading-snug font-medium",
                                            card.done
                                                ? "text-neutral-400 line-through"
                                                : "text-foreground",
                                        )}
                                    >
                                        {card.title}
                                    </p>
                                    {card.darwin && !card.done && (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <DarwinBlockLogo
                                                className={cn("size-3.5", DARWIN_LOGO_BRAND_COLOR)}
                                            />
                                            <span className="text-[10px] text-neutral-400">
                                                Darwin
                                            </span>
                                        </div>
                                    )}
                                </m.div>
                            );
                        })}

                        <m.div
                            className="absolute top-0 left-0 z-10 rounded-lg border border-black/10 bg-snow p-3"
                            style={{ width: CARD_W }}
                            initial={false}
                            animate={{
                                x: heroX,
                                y: spawned ? heroY : heroY - 28,
                                opacity: spawned ? 1 : 0,
                                scale: spawned ? 1 : 0.92,
                                rotate: 0,
                                boxShadow: "0 14px 30px -16px rgba(24,18,48,0.45)",
                            }}
                            transition={{
                                x: MOVE,
                                y: MOVE,
                                opacity: { duration: 0.3, ease: EASE },
                                scale: { duration: 0.3, ease: EASE },
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <StatusBlock status={heroStatus} className="size-3" />
                                <span className="font-mono text-[9.5px] text-neutral-400">
                                    NOC-142
                                </span>
                                <span className="ml-auto rounded-sm bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-600">
                                    Bug
                                </span>
                            </div>
                            <p className="mt-1.5 truncate text-[12px] leading-snug font-medium text-foreground">
                                Checkout rounds wrong
                            </p>
                            <div className="mt-2 flex h-[18px] items-center gap-1.5">
                                {claimed ? (
                                    <m.span
                                        className="flex items-center gap-1.5"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3, ease: EASE }}
                                    >
                                        <DarwinBlockLogo
                                            className={cn("size-3.5", DARWIN_LOGO_BRAND_COLOR)}
                                        />
                                        <span className="text-[10px] text-neutral-500">Darwin</span>
                                    </m.span>
                                ) : (
                                    <>
                                        <span className="size-3 rounded-sm border border-dashed border-neutral-300" />
                                        <span className="text-[10px] text-neutral-400">
                                            Unassigned
                                        </span>
                                    </>
                                )}
                                <m.span
                                    initial={false}
                                    animate={{ opacity: running || passed ? 1 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={cn(
                                        "ml-auto flex items-center gap-1 font-mono text-[9px]",
                                        passed ? "text-green-600" : "text-neutral-400",
                                    )}
                                >
                                    <TerminalGlyph className="size-3" />
                                    {passed ? "214 passed" : "runner-04"}
                                </m.span>
                                {inReview && !merged && (
                                    <m.span
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="ml-auto rounded-sm bg-foreground px-1.5 py-0.5 text-[9px] font-medium text-snow"
                                    >
                                        Merge
                                    </m.span>
                                )}
                                {merged && (
                                    <m.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="ml-auto font-mono text-[9px] whitespace-nowrap text-green-600"
                                    >
                                        #910 · merged
                                    </m.span>
                                )}
                            </div>
                        </m.div>

                        <SceneCursor time={live ? time : -1} path={cursorPath} />
                    </div>
                </div>
            </SceneWindow>
        </div>
    );
}
