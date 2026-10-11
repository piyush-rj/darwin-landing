import { LayoutGroup, motion } from "motion/react";

import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";

import { HARD_SHADOW } from "../boxStyles";
import StatusBlock, { STATUS_BLOCK_ORDER } from "../StatusBlock";
import { BOARD_LOOP, boardStatusAt } from "./loopTimeline";

const MOVE = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

export default function BoardStage({ frame, cycle }: { frame: number; cycle: number }) {
    const status = boardStatusAt(frame);
    const leaving = frame === BOARD_LOOP.frames - 1;

    return (
        <div className={cn("border border-edge bg-snow", HARD_SHADOW)}>
            <LayoutGroup>
                <div className="flex flex-col">
                    {STATUS_BLOCK_ORDER.map((lane) => {
                        const column = KanbanBoard.columnFor(lane)!;
                        const holdsIssue = lane === status;
                        return (
                            <motion.div
                                key={lane}
                                layout
                                transition={MOVE}
                                className="border-b border-dashed border-edge px-3 py-2.5 last:border-b-0"
                            >
                                <div className="flex items-center gap-2.5 text-[12.5px]">
                                    <StatusBlock
                                        status={lane}
                                        depth={2}
                                        className="size-[18px]"
                                        iconClassName="size-[9px]"
                                    />
                                    <span className="text-foreground/85">{column.title}</span>
                                    <span
                                        className={cn(
                                            "ml-auto flex size-5 items-center justify-center border font-mono text-[10.5px] tabular-nums transition-colors duration-300",
                                            holdsIssue
                                                ? "border-(--tone) bg-(--tone) text-white"
                                                : "border-edge text-neutral-400",
                                        )}
                                    >
                                        {holdsIssue ? 1 : 0}
                                    </span>
                                </div>
                                {holdsIssue && (
                                    <motion.div
                                        layoutId={`board-issue-${cycle}`}
                                        initial={frame === 0 ? { opacity: 0, y: -28 } : false}
                                        animate={
                                            leaving ? { opacity: 0, y: 56 } : { opacity: 1, y: 0 }
                                        }
                                        transition={MOVE}
                                        className={cn(
                                            "mt-2.5 border border-edge bg-snow px-3 py-2.5",
                                            HARD_SHADOW,
                                        )}
                                    >
                                        <div className="font-mono text-[10.5px] tracking-[0.08em] text-neutral-400">
                                            NOC-142
                                        </div>
                                        <p className="mt-1 text-[13px] text-foreground">
                                            Checkout total rounds wrong
                                        </p>
                                        <div className="mt-2 flex h-5 items-center gap-1.5 text-[11.5px] text-neutral-500">
                                            {frame >= BOARD_LOOP.assigned ? (
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
                            </motion.div>
                        );
                    })}
                </div>
            </LayoutGroup>
        </div>
    );
}
