"use client";

import {
    animate,
    AnimatePresence,
    type MotionValue,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useSpring,
    useTransform,
    useVelocity,
} from "motion/react";
import * as m from "motion/react-m";
import {
    type ComponentType,
    type ReactNode,
    type RefObject,
    useEffect,
    useRef,
    useState,
} from "react";

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
    boardPan,
    CARD_WIDTH,
    type CardActivity,
    cardX,
    FOCUS_CARD,
    FOCUS_CARD_Y,
    LANE_GAP,
    LANE_WIDTH,
    laneIndex,
    LANES,
    MOCK_HEIGHT,
    MOCK_WIDTH,
    type MockScene,
    PANE_BAR_HEIGHT,
    type PanelKind,
    type Priority,
    SIDEBAR_WIDTH,
    TITLE_BAR_HEIGHT,
    VISIBLE_BOARD_WIDTH,
} from "./playgroundBoard";
import { PanelContent } from "./PlaygroundPanels";

const CARD_SPRING = { stiffness: 170, damping: 26, mass: 1 } as const;
const CAMERA_SPRING = { stiffness: 80, damping: 22, mass: 1 } as const;
const HEIGHT_SPRING = { type: "spring", stiffness: 260, damping: 32 } as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SWAP = { duration: 0.28, ease: EASE_OUT } as const;
const ARRIVAL_TOLERANCE = 0.12;
const ACTIVITY_DELAY = 0.08;
const PANEL_DELAY = 0.16;

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
                <span className="overflow-hidden rounded-full bg-overlay/10 px-1.5 text-[10.5px] leading-4.5 text-overlay/80 tabular-nums">
                    <AnimatePresence mode="wait" initial={false}>
                        <m.span
                            key={badge}
                            className="block"
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            {badge}
                        </m.span>
                    </AnimatePresence>
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

function Sidebar({ inboxCount }: { inboxCount: number }) {
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
                <NavRow Icon={InboxNavIcon} label="Inbox" badge={inboxCount} />
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
                    <span className="size-1.5 animate-pulse rounded-full bg-yellow-400" />
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

function Avatar({ assignee }: { assignee: BoardCard["assignee"] }) {
    if (assignee === "darwin") {
        return (
            <span className="flex size-5 -rotate-7 items-center justify-center rounded-[5px] bg-graphite">
                <DarwinBlockLogo className="size-4" />
            </span>
        );
    }
    return (
        <span
            className={`flex size-5 -rotate-7 items-center justify-center rounded-[5px] text-[9px] font-semibold ${assignee.tone}`}
        >
            {assignee.initials}
        </span>
    );
}

function Swap({ id, delay = 0, children }: { id: string; delay?: number; children: ReactNode }) {
    return (
        <AnimatePresence mode="wait" initial={false}>
            <m.span
                key={id}
                className="block"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
                transition={{ ...SWAP, delay }}
            >
                {children}
            </m.span>
        </AnimatePresence>
    );
}

function useMeasuredHeight(ref: RefObject<HTMLElement | null>, height: MotionValue<number>) {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(() => height.set(element.offsetHeight));
        observer.observe(element);
        height.set(element.offsetHeight);
        return () => observer.disconnect();
    }, [ref, height]);
}

function AutoHeight({
    delay = 0,
    className,
    children,
}: {
    delay?: number;
    className?: string;
    children: ReactNode;
}) {
    const reduceMotion = useReducedMotion();
    const innerRef = useRef<HTMLDivElement>(null);
    const measured = useMotionValue(0);
    const height = useMotionValue(0);
    useMeasuredHeight(innerRef, measured);

    useMotionValueEvent(measured, "change", (target) => {
        if (reduceMotion) height.set(target);
        else animate(height, target, { ...HEIGHT_SPRING, delay });
    });

    return (
        <m.div className={`overflow-hidden ${className ?? ""}`} style={{ height }}>
            <div ref={innerRef}>{children}</div>
        </m.div>
    );
}

function FocusCardBody({
    card,
    panel,
    children,
}: {
    card: BoardCard;
    panel: PanelKind | null;
    children: ReactNode;
}) {
    return (
        <div className="surface-card flex flex-col gap-2.5 rounded-md p-[9px] ring-1 ring-overlay/15">
            <div className="flex h-5 items-center justify-between text-[11px] text-neutral-500 tabular-nums">
                {card.id}
                <Swap id={card.assignee === "darwin" ? "darwin" : card.assignee.initials}>
                    <Avatar assignee={card.assignee} />
                </Swap>
            </div>
            {children}
            <AutoHeight delay={PANEL_DELAY} className="-mt-2.5">
                {panel && (
                    <div className="pt-2.5">
                        <div className="rounded-md border border-overlay/8 bg-ink/30 px-3 py-2.5">
                            <PanelContent kind={panel} />
                        </div>
                    </div>
                )}
            </AutoHeight>
            <AutoHeight delay={ACTIVITY_DELAY} className="-mt-2.5">
                {card.activity && (
                    <div className="flex h-8 items-center pt-2.5 text-[11.5px]">
                        <Swap id={card.activity.kind} delay={ACTIVITY_DELAY}>
                            <Activity activity={card.activity} />
                        </Swap>
                    </div>
                )}
            </AutoHeight>
            <p className="text-[11px] text-neutral-600">{card.created}</p>
        </div>
    );
}

function CardMeta({ card }: { card: BoardCard }) {
    const PriorityIcon = PRIORITY_ICONS[card.priority];
    const lane = LANES[laneIndex(card.lane)];
    return (
        <>
            <div className="flex gap-2">
                <lane.Icon className={`mt-0.5 size-3.5 shrink-0 ${lane.tone}`} />
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
        </>
    );
}

function IssueCard({ card }: { card: BoardCard }) {
    return (
        <div
            className={`surface-card flex flex-col gap-2.5 rounded-md p-[9px] ${card.activity?.kind === "merged" ? "opacity-80" : ""}`}
        >
            <div className="flex h-5 items-center justify-between text-[11px] text-neutral-500 tabular-nums">
                {card.id}
                <Avatar assignee={card.assignee} />
            </div>
            <CardMeta card={card} />
            {card.activity && (
                <div className="flex text-[11.5px]">
                    <Activity activity={card.activity} />
                </div>
            )}
            <p className="text-[11px] text-neutral-600">{card.created}</p>
        </div>
    );
}

function visibleBoardWidth(board: HTMLDivElement | null) {
    if (!board) return VISIBLE_BOARD_WIDTH;
    const rect = board.getBoundingClientRect();
    const scale = rect.width / board.clientWidth;
    return Math.min(board.clientWidth, (window.innerWidth - rect.left) / scale);
}

function useLaneTravel(
    targetLane: number,
    boardRef: RefObject<HTMLDivElement | null>,
    reduceMotion: boolean,
) {
    const lane = useSpring(targetLane, CARD_SPRING);
    const camera = useSpring(boardPan(targetLane, VISIBLE_BOARD_WIDTH), CAMERA_SPRING);

    useEffect(() => {
        const pan = boardPan(targetLane, visibleBoardWidth(boardRef.current));
        if (reduceMotion) {
            lane.jump(targetLane);
            camera.jump(pan);
            return;
        }
        lane.set(targetLane);
        camera.set(pan);
    }, [targetLane, boardRef, reduceMotion, lane, camera]);

    return { lane, camera };
}

function useArrivedScene(lane: MotionValue<number>, scene: MockScene) {
    const [arrived, setArrived] = useState(scene);
    useMotionValueEvent(lane, "change", (position) => {
        if (Math.abs(position - laneIndex(scene.focusLane)) < ARRIVAL_TOLERANCE) {
            setArrived(scene);
        }
    });
    return arrived;
}

function useNearestLane(lane: MotionValue<number>) {
    const [nearest, setNearest] = useState(() => Math.round(lane.get()));
    useMotionValueEvent(lane, "change", (position) => setNearest(Math.round(position)));
    return nearest;
}

function LaneSlot({
    lane,
    cardHeight,
    index,
}: {
    lane: MotionValue<number>;
    cardHeight: MotionValue<number>;
    index: number;
}) {
    const height = useTransform(
        [lane, cardHeight],
        ([position, size]: number[]) =>
            Math.max(0, 1 - Math.abs(position - index)) * (size + LANE_GAP),
    );
    return <m.div aria-hidden className="shrink-0" style={{ height, marginTop: -LANE_GAP }} />;
}

function Board({ scene }: { scene: MockScene }) {
    const reduceMotion = useReducedMotion() ?? false;
    const boardRef = useRef<HTMLDivElement>(null);
    const targetLane = laneIndex(scene.focusLane);
    const { lane, camera } = useLaneTravel(targetLane, boardRef, reduceMotion);
    const arrived = useArrivedScene(lane, scene);
    const nearestLane = useNearestLane(lane);
    const velocity = useVelocity(lane);

    const focusRef = useRef<HTMLDivElement>(null);
    const cardHeight = useMotionValue(0);
    useMeasuredHeight(focusRef, cardHeight);

    const boardX = useTransform(camera, (pan) => -pan);
    const focusX = useTransform(lane, cardX);
    const lift = useTransform(velocity, (speed) => Math.min(1, Math.abs(speed) / 3));
    const scale = useTransform(lift, (amount) => 1 + amount * 0.03);
    const rotate = useTransform(velocity, (speed) => Math.max(-2.2, Math.min(2.2, speed * 0.7)));

    const focus: BoardCard = {
        ...FOCUS_CARD,
        lane: LANES[nearestLane].key,
        assignee: arrived.focusAssignee,
        activity: arrived.focusActivity,
    };

    return (
        <div ref={boardRef} className="relative flex-1 overflow-hidden">
            <m.div
                className="relative flex h-full gap-x-2"
                style={{ x: boardX, paddingInline: BOARD_INSET, paddingTop: BOARD_INSET }}
            >
                <m.div
                    className="absolute left-0 z-10"
                    style={{ top: FOCUS_CARD_Y, width: CARD_WIDTH, x: focusX, scale, rotate }}
                >
                    <m.div
                        aria-hidden
                        className="absolute inset-0 rounded-md shadow-[0_24px_48px_-12px] shadow-black/70"
                        style={{ opacity: lift }}
                    />
                    <div ref={focusRef} className="relative">
                        <FocusCardBody card={focus} panel={arrived.panel}>
                            <CardMeta card={focus} />
                        </FocusCardBody>
                    </div>
                </m.div>
                {LANES.map((column, index) => {
                    const cards = BACKGROUND_CARDS.filter((card) => card.lane === column.key);
                    const count = cards.length + (index === nearestLane ? 1 : 0);
                    return (
                        <div
                            key={column.key}
                            className="flex shrink-0 flex-col gap-2 rounded-t-lg bg-ink/20 p-2 ring-[0.5px] ring-snow/3"
                            style={{ width: LANE_WIDTH }}
                        >
                            <div className="flex h-7 shrink-0 items-center gap-2 px-1">
                                <column.Icon className={`size-3.5 ${column.tone}`} />
                                <span className="text-[13px] font-semibold text-neutral-200">
                                    {column.title}
                                </span>
                                <span className="text-[11px] text-neutral-500 tabular-nums">
                                    {count}
                                </span>
                                <PlusIcon className="ml-auto size-3.5 text-neutral-600" />
                            </div>
                            <LaneSlot lane={lane} cardHeight={cardHeight} index={index} />
                            {cards.map((card) => (
                                <IssueCard key={card.id} card={card} />
                            ))}
                        </div>
                    );
                })}
            </m.div>
        </div>
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
                        <Sidebar inboxCount={scene.inboxCount} />
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
            </div>
        </div>
    );
}
