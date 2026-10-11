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

import { HARD_SHADOW } from "../boxStyles";
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

const ROW_HEIGHT_PX = 38;

const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;

export default function RunnerStage({ frame }: { frame: number }) {
    const visible = Math.max(0, Math.min(LOG.length, frame - LOOP.firstLog + 1));
    const passed = frame >= LOOP.opened;

    return (
        <div className={cn("border border-edge bg-snow", HARD_SHADOW)}>
            <ul className="flex flex-col" style={{ height: `${LOG.length * ROW_HEIGHT_PX}px` }}>
                <AnimatePresence initial={false}>
                    {LOG.slice(0, visible).map((line, index) => {
                        const current = !passed && index === visible - 1;
                        return (
                            <motion.li
                                key={line.text}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                style={{ height: ROW_HEIGHT_PX }}
                                className="flex shrink-0 items-center gap-3 border-b border-dashed border-edge px-3 text-[13.5px] last:border-b-0"
                            >
                                <span
                                    className={cn(
                                        "flex size-6 shrink-0 items-center justify-center border",
                                        line.passed && cn("border-current", DONE_TONE),
                                        current && "border-(--tone) bg-(--tone) text-white",
                                        !line.passed && !current && "border-edge text-neutral-400",
                                    )}
                                >
                                    <line.icon className="size-3.5" aria-hidden />
                                </span>
                                <span
                                    className={cn(
                                        "truncate",
                                        line.passed || current
                                            ? "text-foreground"
                                            : "text-foreground/75",
                                    )}
                                >
                                    {line.text}
                                </span>
                                {line.detail && (
                                    <span className="ml-auto shrink-0 font-mono text-[11.5px] text-neutral-400">
                                        {line.detail}
                                    </span>
                                )}
                            </motion.li>
                        );
                    })}
                </AnimatePresence>
            </ul>
        </div>
    );
}
