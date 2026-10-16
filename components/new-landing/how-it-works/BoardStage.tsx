import { LayoutGroup, motion } from "motion/react";
import type { ComponentType } from "react";

import {
    BreadcrumbSeparatorIcon,
    HighPriorityIcon,
    LowPriorityIcon,
    MediumPriorityIcon,
} from "@/components/icons";
import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { HARD_SHADOW } from "../boxStyles";
import StatusBlock from "../StatusBlock";
import { BOARD_LOOP, boardStatusAt } from "./loopTimeline";
import MockWindow from "./MockWindow";

const MOVE = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;
const LANES = [KanbanStatus.Todo, KanbanStatus.InProgress, KanbanStatus.Done];

type Issue = {
    id: string;
    title: string;
    label: string;
    priority: ComponentType<{ className?: string }>;
    assignee: string | null;
};

const DARWIN = "darwin";

const OTHER_ISSUES: Partial<Record<KanbanStatus, Issue[]>> = {
    [KanbanStatus.Todo]: [
        {
            id: "NOC-151",
            title: "Tooltip clips on mobile",
            label: "UI",
            priority: LowPriorityIcon,
            assignee: "J",
        },
        {
            id: "NOC-149",
            title: "CSV export drops the last row",
            label: "Data",
            priority: MediumPriorityIcon,
            assignee: null,
        },
    ],
    [KanbanStatus.InProgress]: [
        {
            id: "NOC-138",
            title: "Retry button double-submits",
            label: "Bug",
            priority: HighPriorityIcon,
            assignee: "R",
        },
    ],
    [KanbanStatus.Done]: [
        {
            id: "NOC-131",
            title: "Avatar 404s on Safari",
            label: "Bug",
            priority: MediumPriorityIcon,
            assignee: DARWIN,
        },
        {
            id: "NOC-127",
            title: "Sort resets after refresh",
            label: "UI",
            priority: LowPriorityIcon,
            assignee: DARWIN,
        },
    ],
};

function Assignee({ who }: { who: string | null }) {
    if (who === DARWIN) return <DarwinBlockLogo className="size-3" />;
    return (
        <span
            className={cn(
                "flex size-3 items-center justify-center text-[7px]",
                who
                    ? "bg-foreground/10 text-foreground/70"
                    : "border border-dashed border-foreground/25",
            )}
        >
            {who}
        </span>
    );
}

function IssueCard({
    issue,
    active = false,
    className,
}: {
    issue: Issue;
    active?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "border bg-snow px-2 py-1.5",
                active ? "border-(--tone)" : "border-foreground/10",
                className,
            )}
        >
            <p
                className={cn(
                    "truncate text-[10.5px] leading-[1.3]",
                    active ? "text-foreground" : "text-foreground/70",
                )}
            >
                {issue.title}
            </p>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.06em] text-neutral-400">
                {issue.id}
                <issue.priority className="size-2.5" />
                <span className="border border-foreground/10 px-1 text-[8px] uppercase max-sm:hidden">
                    {issue.label}
                </span>
                <span className="ml-auto">
                    <Assignee who={issue.assignee} />
                </span>
            </div>
        </div>
    );
}

export default function BoardStage({ frame, cycle }: { frame: number; cycle: number }) {
    const status = boardStatusAt(frame);
    const assigned = frame >= BOARD_LOOP.assigned;
    const trackedIssue: Issue = {
        id: "NOC-142",
        title: "Checkout total rounds wrong",
        label: "Bug",
        priority: HighPriorityIcon,
        assignee: assigned ? DARWIN : "M",
    };

    return (
        <MockWindow
            title={
                <>
                    <span className="text-neutral-500">Acme</span>
                    <BreadcrumbSeparatorIcon className="size-3.5 text-neutral-400" />
                    <span>Web board</span>
                </>
            }
            status="Sprint 14"
        >
            <LayoutGroup>
                <div className="grid h-full grid-cols-3 gap-1.5 p-2.5">
                    {LANES.map((lane) => {
                        const column = KanbanBoard.columnFor(lane)!;
                        const holdsIssue = lane === status;
                        const others = OTHER_ISSUES[lane] ?? [];
                        return (
                            <div key={lane} className="flex min-w-0 flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 px-0.5 text-[10.5px]">
                                    <StatusBlock status={lane} />
                                    <span className="truncate text-foreground/85">
                                        {column.title}
                                    </span>
                                </div>
                                <div className="flex flex-1 flex-col gap-1.5 bg-foreground/[0.04] p-1">
                                    {holdsIssue && (
                                        <motion.div
                                            layoutId={`board-issue-${cycle}`}
                                            initial={frame === 0 ? { opacity: 0, y: -28 } : false}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={MOVE}
                                            className={HARD_SHADOW}
                                        >
                                            <IssueCard issue={trackedIssue} active />
                                        </motion.div>
                                    )}
                                    {others.map((issue) => (
                                        <IssueCard
                                            key={issue.id}
                                            issue={issue}
                                            className="max-sm:hidden"
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </LayoutGroup>
        </MockWindow>
    );
}
