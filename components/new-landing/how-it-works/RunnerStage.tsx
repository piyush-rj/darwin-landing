import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

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
import MockWindow from "./MockWindow";

type LogLine = { icon: IconType; text: string; at: string; detail?: string; passed?: boolean };

const LOG: LogLine[] = [
    { icon: CommandIcon, text: "Clone acme/web", at: "0:00", detail: "main" },
    { icon: FileIcon, text: "Read src/checkout/total.ts", at: "0:02" },
    { icon: SearchIcon, text: "Search roundTax", at: "0:03", detail: "4 hits" },
    { icon: EditIcon, text: "Edit total.ts", at: "0:05", detail: "+12 −4" },
    { icon: CommandIcon, text: "bun test checkout", at: "0:07" },
    { icon: CheckIcon, text: "214 tests passed", at: "0:12", detail: "4.8s", passed: true },
    { icon: CommitsIcon, text: "Commit fix(checkout)", at: "0:13", detail: "a41f9c2" },
];

const TEST_OUTPUT = [
    "total.test.ts › rounds after currency conversion",
    "total.test.ts › keeps cents for zero-decimal currencies",
    "tax.test.ts › applies the regional rate once",
    "cart.test.ts › sums discounted lines",
];

const TEST_RUN_STEP = 5;
const ROW_HEIGHT_PX = 30;

const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;

export default function RunnerStage({ frame }: { frame: number }) {
    const visible = Math.max(0, Math.min(LOG.length, frame - LOOP.firstLog + 1));
    const passed = frame >= LOOP.opened;
    const testsRunning = visible >= TEST_RUN_STEP;
    const testsDone = visible > TEST_RUN_STEP;

    return (
        <MockWindow
            title={
                <>
                    <RunnerIcon className="size-3.5 text-neutral-500" aria-hidden />
                    runner-04
                    <span className="font-mono text-[10px] text-neutral-400">acme/web</span>
                </>
            }
            status={
                <>
                    <span
                        className={cn(
                            "size-1.5",
                            passed ? "bg-green-500" : "animate-pulse bg-(--tone)",
                        )}
                    />
                    {passed ? "Passed" : "Running"}
                </>
            }
        >
            <div className="flex h-full flex-col">
                <ul
                    className="flex shrink-0 flex-col"
                    style={{ height: `${LOG.length * ROW_HEIGHT_PX}px` }}
                >
                    <AnimatePresence initial={false}>
                        {LOG.slice(0, visible).map((line, index) => {
                            const current = !passed && index === visible - 1;
                            return (
                                <m.li
                                    key={line.text}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ height: ROW_HEIGHT_PX }}
                                    className="flex shrink-0 items-center gap-2.5 border-b border-dashed border-foreground/15 px-3 text-[11.5px]"
                                >
                                    <span className="w-7 shrink-0 font-mono text-[9.5px] text-neutral-400 tabular-nums">
                                        {line.at}
                                    </span>
                                    <span
                                        className={cn(
                                            "flex size-5 shrink-0 items-center justify-center border",
                                            line.passed && cn("border-current", DONE_TONE),
                                            current && "border-(--tone) bg-(--tone) text-white",
                                            !line.passed &&
                                                !current &&
                                                "border-foreground/15 text-neutral-400",
                                        )}
                                    >
                                        <line.icon className="size-3" aria-hidden />
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
                                        <span className="ml-auto shrink-0 font-mono text-[9.5px] text-neutral-400">
                                            {line.detail}
                                        </span>
                                    )}
                                </m.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
                <div className="m-2.5 flex-1 bg-foreground/[0.04] p-2.5 font-mono text-[9.5px] leading-[1.9] text-neutral-500">
                    <div className="text-foreground/70">$ bun test checkout</div>
                    {testsRunning &&
                        TEST_OUTPUT.map((test) => (
                            <div key={test} className="truncate">
                                <span className={cn(testsDone ? DONE_TONE : "text-neutral-400")}>
                                    {testsDone ? "✓" : "·"}
                                </span>{" "}
                                {test}
                            </div>
                        ))}
                    {testsDone && (
                        <div className="mt-1 text-foreground/70">214 pass · 0 fail · 4.82s</div>
                    )}
                </div>
            </div>
        </MockWindow>
    );
}
