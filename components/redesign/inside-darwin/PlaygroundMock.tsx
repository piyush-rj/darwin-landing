"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import type { ComponentType, ReactNode } from "react";

import {
    AgentNavIcon,
    AssigneeGroupIcon,
    BellIcon,
    ChatsNavIcon,
    ChevronDownIcon,
    ComposeIcon,
    DisplayOptionsIcon,
    FilterIcon,
    GanttNavIcon,
    HighPriorityIcon,
    InboxNavIcon,
    KanbanNavIcon,
    LabelsNavIcon,
    MediumPriorityIcon,
    MilestonesNavIcon,
    MoonIcon,
    MyIssuesNavIcon,
    PlusIcon,
    PullRequestOpenIcon,
    RunnerIcon,
    SettingsIcon,
    SpinnerIcon,
    UrgentPriorityIcon,
} from "@/components/icons";
import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";

import { usePerforatedEdge } from "../usePerforatedEdge";
import {
    BACKGROUND_CARDS,
    BOARD_INSET,
    type BoardCard,
    type CardActivity,
    FOCUS_CARD,
    LANE_WIDTH,
    LANES,
    MOCK_HEIGHT,
    MOCK_WIDTH,
    type MockScene,
    PANE_BAR_HEIGHT,
    type Priority,
    SIDEBAR_WIDTH,
    TITLE_BAR_HEIGHT,
} from "./playgroundBoard";
import { LogsPanel, PullRequestPanel, QuestionCard } from "./PlaygroundPanels";

const SPRING = { type: "spring", stiffness: 240, damping: 34 } as const;

function NavRow({
    Icon,
    label,
    active,
    badge,
}: {
    Icon: ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    badge?: number;
}) {
    return (
        <div
            className={`flex h-7.5 items-center gap-2.5 rounded-[5px] px-2 tracking-wide ${active ? "bg-active text-overlay" : "text-overlay/85"}`}
        >
            <Icon className={`size-4 ${active ? "text-overlay/80" : "text-overlay/45"}`} />
            <span className="flex-1">{label}</span>
            {badge && (
                <span className="rounded-full bg-overlay/10 px-1.5 text-[10.5px] leading-4.5 text-overlay/80 tabular-nums">
                    {badge}
                </span>
            )}
        </div>
    );
}

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <p className="mt-3 flex h-7.5 items-center px-2 text-[11.5px] tracking-wide text-neutral-500">
            {children}
        </p>
    );
}

function Sidebar() {
    return (
        <aside
            className="flex shrink-0 flex-col border-r border-edge bg-charcoal text-[12.5px] font-medium"
            style={{ width: SIDEBAR_WIDTH }}
        >
            <div className="flex items-center gap-2 px-3" style={{ height: PANE_BAR_HEIGHT }}>
                <span className="flex size-6 items-center justify-center rounded-md bg-matcha/15 text-matcha">
                    <MoonIcon className="size-3.5" />
                </span>
                <span className="text-[12.5px] font-semibold text-overlay">Nocturn</span>
                <ChevronDownIcon className="size-3 text-overlay/40" />
                <ComposeIcon className="ml-auto size-4 text-overlay/50" />
            </div>
            <nav className="flex flex-col px-2 pt-2">
                <NavRow Icon={AgentNavIcon} label="Agent" />
                <NavRow Icon={InboxNavIcon} label="Inbox" badge={3} />
                <NavRow Icon={MyIssuesNavIcon} label="My issues" />
                <NavRow Icon={ChatsNavIcon} label="Chats" />
                <SectionLabel>Board</SectionLabel>
                <NavRow Icon={KanbanNavIcon} label="Kanban" active />
                <NavRow Icon={MilestonesNavIcon} label="Milestones" />
                <NavRow Icon={GanttNavIcon} label="Gantt" />
                <NavRow Icon={LabelsNavIcon} label="Labels" />
                <SectionLabel>Teams</SectionLabel>
                <NavRow Icon={AssigneeGroupIcon} label="Agent Core" />
                <NavRow Icon={AssigneeGroupIcon} label="Runners" />
                <NavRow Icon={AssigneeGroupIcon} label="Web" />
            </nav>
            <div className="mt-auto flex items-center gap-2.5 border-t border-edge px-3 py-3">
                <span className="flex size-6 items-center justify-center rounded-md bg-indigo-950 text-[10px] font-semibold text-indigo-300">
                    PN
                </span>
                <span className="flex-1 text-overlay/85">Priya Nair</span>
                <BellIcon className="size-4 text-overlay/45" />
                <SettingsIcon className="size-4 text-overlay/45" />
            </div>
        </aside>
    );
}

const PRIORITY_ICONS: Record<Priority, ComponentType<{ className?: string }>> = {
    Urgent: UrgentPriorityIcon,
    High: HighPriorityIcon,
    Medium: MediumPriorityIcon,
};

function AgentChip({ children }: { children: ReactNode }) {
    return (
        <span className="flex h-5.5 items-center gap-1.5 rounded-full bg-overlay/6 pr-2 pl-1 text-neutral-300">
            <DarwinBlockLogo className="size-4" />
            {children}
        </span>
    );
}

function Activity({ activity }: { activity: CardActivity }) {
    switch (activity.kind) {
        case "queued":
            return <AgentChip>Darwin · queued</AgentChip>;
        case "working":
            return (
                <span className="flex w-full items-center gap-1.5 text-yellow-400">
                    <SpinnerIcon className="size-3.5 animate-spin" />
                    <span className="flex-1 truncate">{activity.step}</span>
                    <span className="flex items-center gap-1 text-neutral-500">
                        <RunnerIcon className="size-3.5" />
                        {activity.runner}
                    </span>
                </span>
            );
        case "waiting":
            return (
                <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="size-1.5 rounded-full bg-yellow-400" />
                    Waiting for your answer
                </span>
            );
        case "review":
            return (
                <span className="flex items-center gap-2">
                    <span className="flex h-5.5 items-center gap-1 rounded-full px-2 text-indigo-300 ring-1 ring-indigo-400/40">
                        <PullRequestOpenIcon className="size-3.5" />#{activity.pullRequest}
                    </span>
                    <span className="text-green-400 tabular-nums">+{activity.additions}</span>
                    <span className="-ml-1 text-red-400 tabular-nums">−{activity.deletions}</span>
                    <span className="ml-auto">
                        <AgentChip>Darwin</AgentChip>
                    </span>
                </span>
            );
        case "merged":
            return (
                <span className="text-neutral-500">
                    <span className="text-green-400">✓ Merged</span> · {activity.duration}
                </span>
            );
    }
}

function IssueCard({ card, focused }: { card: BoardCard; focused?: boolean }) {
    const PriorityIcon = PRIORITY_ICONS[card.priority];
    const lane = LANES.find((candidate) => candidate.key === card.lane);
    const StatusIcon = lane?.Icon;

    return (
        <div
            className={`surface-card flex flex-col gap-2.5 rounded-md p-[9px] ${focused ? "ring-1 ring-overlay/15" : ""} ${card.activity?.kind === "merged" ? "opacity-80" : ""}`}
        >
            <div className="flex items-center justify-between text-[11px] text-neutral-500 tabular-nums">
                {card.id}
                {card.assignee === "darwin" ? (
                    <span className="flex size-5 -rotate-7 items-center justify-center rounded-[5px] bg-graphite">
                        <DarwinBlockLogo className="size-4" />
                    </span>
                ) : (
                    <span
                        className={`flex size-5 -rotate-7 items-center justify-center rounded-[5px] text-[9px] font-semibold ${card.assignee.tone}`}
                    >
                        {card.assignee.initials}
                    </span>
                )}
            </div>
            <div className="flex gap-2">
                {StatusIcon && <StatusIcon className={`mt-0.5 size-3.5 shrink-0 ${lane.tone}`} />}
                <p className="line-clamp-2 text-[14px] leading-snug font-medium text-neutral-100">
                    {card.title}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-neutral-400">
                <span className="flex h-5.5 items-center gap-1 rounded-full px-2 ring-1 ring-overlay/8">
                    <PriorityIcon className="size-3" />
                    {card.priority}
                </span>
                {card.labels.map((label) => (
                    <span
                        key={label.name}
                        className="flex h-5.5 items-center gap-1.5 rounded-full px-2 ring-1 ring-overlay/8"
                    >
                        <span className={`size-1.5 rounded-full ${label.tone}`} />
                        {label.name}
                    </span>
                ))}
            </div>
            {card.activity && (
                <div className="flex text-[11.5px]">
                    <Activity activity={card.activity} />
                </div>
            )}
            <p className="text-[11px] text-neutral-600">{card.created}</p>
        </div>
    );
}

function Board({ scene }: { scene: MockScene }) {
    const focus: BoardCard = {
        ...FOCUS_CARD,
        lane: scene.focusLane,
        activity: scene.focusActivity,
    };

    return (
        <div className="relative flex-1 overflow-hidden">
            <m.div
                className="flex h-full gap-x-2"
                style={{ paddingInline: BOARD_INSET, paddingTop: BOARD_INSET }}
                animate={{ x: scene.boardShift }}
                transition={SPRING}
            >
                {LANES.map((lane) => {
                    const cards = BACKGROUND_CARDS.filter((card) => card.lane === lane.key);
                    const count = cards.length + (lane.key === scene.focusLane ? 1 : 0);
                    return (
                        <div
                            key={lane.key}
                            className="flex shrink-0 flex-col gap-2 rounded-t-lg bg-ink/20 p-2 ring-[0.5px] ring-snow/3"
                            style={{ width: LANE_WIDTH }}
                        >
                            <div className="flex h-7 items-center gap-2 px-1">
                                <lane.Icon className={`size-3.5 ${lane.tone}`} />
                                <span className="text-[13px] font-semibold text-neutral-200">
                                    {lane.title}
                                </span>
                                <span className="text-[11px] text-neutral-500 tabular-nums">
                                    {count}
                                </span>
                                <PlusIcon className="ml-auto size-3.5 text-neutral-600" />
                            </div>
                            {lane.key === scene.focusLane && (
                                <m.div layoutId="focus-card" transition={SPRING}>
                                    <IssueCard card={focus} focused />
                                </m.div>
                            )}
                            {cards.map((card) => (
                                <m.div key={card.id} layout="position" transition={SPRING}>
                                    <IssueCard card={card} />
                                </m.div>
                            ))}
                        </div>
                    );
                })}
            </m.div>
        </div>
    );
}

const CALLOUT_LEAD = 22;

function Callout({ scene }: { scene: MockScene }) {
    const { label, x, y, drop = 0 } = scene.callout;
    return (
        <m.div
            className="pointer-events-none absolute z-30"
            initial={false}
            animate={{ left: x, top: y }}
            transition={SPRING}
        >
            <span className="absolute -top-1 -left-1 size-2 rounded-full bg-snow ring-4 ring-snow/15" />
            <span
                className="absolute top-0 left-0 h-px bg-snow/80"
                style={{ width: CALLOUT_LEAD }}
            />
            <m.span
                className="absolute top-0 w-px bg-snow/80"
                style={{ left: CALLOUT_LEAD }}
                initial={false}
                animate={{ height: drop }}
                transition={SPRING}
            />
            <m.div
                className="absolute flex items-center"
                style={{ left: CALLOUT_LEAD, translateY: "-50%" }}
                initial={false}
                animate={{ top: drop }}
                transition={SPRING}
            >
                <span className="h-px w-[18px] bg-snow/80" />
                <span className="relative overflow-hidden rounded-full bg-snow px-3.5 py-1.5 text-[14px] font-medium whitespace-nowrap text-ink shadow-lg shadow-black/40">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <m.span
                            key={label}
                            className="block"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.24 }}
                        >
                            {label}
                        </m.span>
                    </AnimatePresence>
                </span>
            </m.div>
        </m.div>
    );
}

export default function PlaygroundMock({ scene }: { scene: MockScene }) {
    const [bandEdgeRef, bandEdgeStyle] = usePerforatedEdge<HTMLDivElement>();
    const [frameEdgeRef, frameEdgeStyle] = usePerforatedEdge<HTMLDivElement>();
    return (
        <div className="relative" style={{ width: MOCK_WIDTH, height: MOCK_HEIGHT }}>
            <div aria-hidden className="absolute -inset-3 drop-shadow-sm">
                <div
                    ref={bandEdgeRef}
                    style={bandEdgeStyle}
                    className={`size-full transition-colors duration-700 ease-out ${scene.band}`}
                />
            </div>

            <div className="theme-playground relative size-full">
                <div
                    ref={frameEdgeRef}
                    style={frameEdgeStyle}
                    className="relative flex size-full flex-col overflow-hidden bg-background text-foreground"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_70%_0%,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent_70%)]"
                    />
                    <div
                        className="relative flex shrink-0 items-center gap-1.5 border-b border-edge bg-charcoal px-4"
                        style={{ height: TITLE_BAR_HEIGHT }}
                    >
                        <span className="size-2.5 rounded-full bg-overlay/15" />
                        <span className="size-2.5 rounded-full bg-overlay/15" />
                        <span className="size-2.5 rounded-full bg-overlay/15" />
                        <span className="ml-4 text-[12px] text-neutral-500">appx / nocturn</span>
                    </div>
                    <div className="relative flex min-h-0 flex-1">
                        <Sidebar />
                        <main className="surface-chrome flex min-w-0 flex-1 flex-col">
                            <div
                                className="flex shrink-0 items-center gap-2 border-b border-edge px-4 text-[13px]"
                                style={{ height: PANE_BAR_HEIGHT }}
                            >
                                <span className="font-medium text-neutral-100">Kanban</span>
                                <span className="rounded-full px-2 text-[11px] leading-5 text-neutral-400 ring-1 ring-overlay/8">
                                    All issues
                                </span>
                                <span className="ml-auto flex items-center gap-1 text-neutral-500">
                                    <FilterIcon className="size-7 rounded-md p-1.5" />
                                    <DisplayOptionsIcon className="size-7 rounded-md p-1.5" />
                                </span>
                                <span className="h-4 w-px bg-edge" />
                                <span className="flex h-7 items-center gap-1 rounded-md bg-overlay px-2.5 text-[12px] font-medium text-ink">
                                    <PlusIcon className="size-3.5" />
                                    New issue
                                </span>
                            </div>
                            <Board scene={scene} />
                        </main>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {scene.key === "work" && <LogsPanel key="logs" />}
                    {scene.key === "question" && <QuestionCard key="question" />}
                    {scene.key === "pullRequest" && <PullRequestPanel key="pull-request" />}
                </AnimatePresence>

                <Callout scene={scene} />
            </div>
        </div>
    );
}
