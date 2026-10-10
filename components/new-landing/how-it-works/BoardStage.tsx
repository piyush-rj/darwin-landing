import { motion } from "motion/react";

import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { LOOP, statusAt } from "./loopTimeline";

const LANES = [
    KanbanStatus.Todo,
    KanbanStatus.InProgress,
    KanbanStatus.InReview,
    KanbanStatus.Done,
];

export default function BoardStage({ frame, cycle }: { frame: number; cycle: number }) {
    const status = statusAt(frame);

    return (
        <div className="flex flex-col gap-1.5 rounded-md border border-edge bg-snow p-2">
            {LANES.map((lane) => {
                const column = KanbanBoard.columnFor(lane)!;
                const holdsIssue = lane === status;
                return (
                    <div key={lane} className="rounded-md px-2 py-1.5">
                        <div className="flex items-center gap-2 text-[12.5px] text-neutral-500">
                            <column.icon className={cn("size-3.5", column.titleBox)} />
                            <span className="text-foreground/80">{column.title}</span>
                            <span className="font-mono text-[11px] text-neutral-400 tabular-nums">
                                {holdsIssue ? 1 : 0}
                            </span>
                        </div>
                        {holdsIssue && (
                            <motion.div
                                layoutId={`loop-issue-${cycle}`}
                                initial={frame === 0 ? { opacity: 0, y: -6 } : false}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-2 rounded-md border border-edge bg-snow p-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                            >
                                <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-neutral-400">
                                    <column.icon className={cn("size-3", column.titleBox)} />
                                    NOC-142
                                </div>
                                <p className="mt-1 text-[13px] text-foreground">
                                    Checkout total rounds wrong
                                </p>
                                <div className="mt-2 flex h-5 items-center gap-1.5 text-[11.5px] text-neutral-500">
                                    {frame >= LOOP.assigned ? (
                                        <>
                                            <DarwinBlockLogo className="size-4" />
                                            Darwin
                                        </>
                                    ) : (
                                        "Filed by Maya"
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
