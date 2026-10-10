import { AnimatePresence, motion } from "motion/react";

import {
    CheckIcon,
    CommandIcon,
    CommitsIcon,
    EditIcon,
    FileIcon,
    type IconType,
    RunnerIcon,
    SearchIcon,
} from "@/components/icons";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { LOOP } from "./loopTimeline";

type LogLine = { icon: IconType; text: string; detail?: string; passed?: boolean };

const LOG: LogLine[] = [
    { icon: RunnerIcon, text: "Clone acme/web", detail: "runner-04" },
    { icon: FileIcon, text: "Read src/checkout/total.ts" },
    { icon: SearchIcon, text: "Search roundTax" },
    { icon: EditIcon, text: "Edit total.ts", detail: "+12 −4" },
    { icon: CommandIcon, text: "bun test checkout" },
    { icon: CheckIcon, text: "214 tests passed", passed: true },
    { icon: CommitsIcon, text: "Commit fix(checkout)" },
];

const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;

function runnerState(frame: number) {
    if (frame < LOOP.firstLog) return { label: "Idle", dot: "bg-neutral-300" };
    if (frame < LOOP.opened) return { label: "Running", dot: "bg-primary animate-pulse" };
    return { label: "Passed", dot: "bg-current" };
}

export default function RunnerStage({ frame }: { frame: number }) {
    const visible = Math.max(0, Math.min(LOG.length, frame - LOOP.firstLog + 1));
    const state = runnerState(frame);

    return (
        <div className="overflow-hidden rounded-md border border-edge bg-snow">
            <div className="flex items-center justify-between border-b border-edge px-3 py-2">
                <span className="flex items-center gap-2 text-[12.5px] text-foreground/80">
                    <RunnerIcon className="size-3.5 text-neutral-500" aria-hidden />
                    runner-04
                    <span className="font-mono text-[10.5px] tracking-[0.08em] text-neutral-400 uppercase">
                        Sandbox
                    </span>
                </span>
                <span
                    className={cn(
                        "flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] text-neutral-500 uppercase",
                        frame >= LOOP.opened && DONE_TONE,
                    )}
                >
                    <span className={cn("size-1.5 rounded-full", state.dot)} />
                    {state.label}
                </span>
            </div>
            <ul className="flex h-[15.5rem] flex-col gap-0.5 p-2">
                <AnimatePresence initial={false}>
                    {LOG.slice(0, visible).map((line) => (
                        <motion.li
                            key={line.text}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex h-8 items-center gap-2.5 rounded-[5px] px-1.5 text-[12.5px]"
                        >
                            <line.icon
                                className={cn(
                                    "size-3.5 shrink-0",
                                    line.passed ? DONE_TONE : "text-neutral-400",
                                )}
                                aria-hidden
                            />
                            <span
                                className={cn(
                                    "truncate",
                                    line.passed ? "text-foreground" : "text-foreground/80",
                                )}
                            >
                                {line.text}
                            </span>
                            {line.detail && (
                                <span className="ml-auto shrink-0 font-mono text-[10.5px] text-neutral-400">
                                    {line.detail}
                                </span>
                            )}
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    );
}
