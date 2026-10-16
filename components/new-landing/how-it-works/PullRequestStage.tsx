import { motion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";

import {
    BreadcrumbSeparatorIcon,
    CheckIcon,
    GithubLogoIcon,
    MergeIcon,
    PullRequestOpenIcon,
    RunnerIcon,
} from "@/components/icons";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { LOOP } from "./loopTimeline";
import MockWindow from "./MockWindow";

const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;
const DIFF_BLOCKS = ["added", "added", "added", "removed", "unchanged"] as const;
const BUTTON_FILL =
    "border-[color-mix(in_oklab,var(--tone)_80%,black)] bg-[color-mix(in_oklab,var(--tone)_80%,black)] text-white";
const MOVE = { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const;

const CHANGED_FILES = [
    { path: "src/checkout/total.ts", added: 7, removed: 4 },
    { path: "src/checkout/total.test.ts", added: 5, removed: 0 },
];

const DIFF_LINES = [
    { sign: "−", text: "return Math.round(subtotal * rate) / 100;" },
    { sign: "+", text: "const converted = convert(subtotal, rate);" },
    { sign: "+", text: "return roundCents(converted);" },
];

function Tile({ done, children }: { done: boolean; children: ReactNode }) {
    return (
        <span
            className={cn(
                "flex size-5 shrink-0 items-center justify-center border transition-colors duration-300",
                done ? BUTTON_FILL : "border-edge text-neutral-400",
            )}
        >
            {children}
        </span>
    );
}

function CheckRow({
    tile,
    label,
    done,
    children,
}: {
    tile: ReactNode;
    label: string;
    done: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex h-[32px] items-center gap-2.5 border-b border-dashed border-foreground/15 px-3 text-[11.5px]">
            {tile}
            <span className="text-foreground/80">{label}</span>
            <span
                className={cn(
                    "ml-auto flex items-center gap-1 font-mono text-[9.5px] tracking-[0.08em] uppercase transition-colors duration-300",
                    done ? DONE_TONE : "text-neutral-400",
                )}
            >
                {children}
            </span>
        </div>
    );
}

const WINDOW_TITLE = (
    <>
        <GithubLogoIcon className="size-3.5 text-foreground/70" aria-hidden />
        <span className="text-neutral-500">acme/web</span>
        <BreadcrumbSeparatorIcon className="size-3.5 text-neutral-400" />
        Pull requests
    </>
);

export default function PullRequestStage({ frame }: { frame: number }) {
    if (frame < LOOP.opened) {
        return (
            <MockWindow title={WINDOW_TITLE}>
                <div className="flex h-full items-center justify-center gap-2 font-mono text-[10px] tracking-[0.12em] text-neutral-400 uppercase">
                    <span aria-hidden className="size-1.5 animate-pulse bg-current" />
                    Waiting for a passing run
                </div>
            </MockWindow>
        );
    }

    const checked = frame >= LOOP.checked;
    const approved = frame >= LOOP.approved;
    const merged = frame >= LOOP.merged;

    return (
        <MockWindow title={WINDOW_TITLE} status="#910">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={MOVE}
                className="flex h-full flex-col"
            >
                <div className="m-3 bg-foreground/[0.04] p-2.5 font-mono text-[9.5px]">
                    <div className="tracking-[0.08em] text-neutral-400 uppercase">
                        Files changed · {CHANGED_FILES.length}
                    </div>
                    {CHANGED_FILES.map((file) => (
                        <div key={file.path} className="mt-1.5 flex items-center gap-2">
                            <span className="truncate text-foreground/75">{file.path}</span>
                            <span className="ml-auto text-green-600">+{file.added}</span>
                            <span className="text-red-500">−{file.removed}</span>
                        </div>
                    ))}
                    <div className="mt-2.5 overflow-hidden border border-foreground/10 bg-snow py-1 leading-[1.8]">
                        {DIFF_LINES.map((line) => (
                            <div
                                key={line.text}
                                className={cn(
                                    "truncate px-2",
                                    line.sign === "+"
                                        ? "bg-green-500/10 text-green-700"
                                        : "bg-red-500/10 text-red-600",
                                )}
                            >
                                {line.sign} {line.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-y border-foreground/15 px-3 py-2.5">
                    <p className="flex items-center gap-2 text-[12.5px] text-foreground">
                        <span
                            className={cn(
                                "flex size-5 shrink-0 items-center justify-center text-white transition-colors duration-500",
                                merged ? "bg-(--tone)" : "bg-green-500",
                            )}
                        >
                            {merged ? (
                                <MergeIcon className="size-3" aria-hidden />
                            ) : (
                                <PullRequestOpenIcon className="size-3" aria-hidden />
                            )}
                        </span>
                        fix(checkout): round after conversion
                    </p>
                    <div className="mt-1.5 truncate font-mono text-[9.5px] text-neutral-400">
                        Darwin wants to merge darwin/noc-142 into main
                    </div>
                    <div className="mt-2 flex items-center gap-2 font-mono text-[9.5px] text-neutral-400">
                        <span className="text-green-600">+12</span>
                        <span className="text-red-500">−4</span>
                        <span aria-hidden className="flex gap-0.5">
                            {DIFF_BLOCKS.map((kind, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        "size-2",
                                        kind === "added" && "bg-green-500",
                                        kind === "removed" && "bg-red-500",
                                        kind === "unchanged" && "bg-edge",
                                    )}
                                />
                            ))}
                        </span>
                        <span>· closes NOC-142</span>
                    </div>
                </div>

                <CheckRow
                    tile={
                        <Tile done={checked}>
                            <RunnerIcon className="size-3" aria-hidden />
                        </Tile>
                    }
                    label="Tests in runner-04"
                    done={checked}
                >
                    {checked ? (
                        <>
                            <CheckIcon className="size-3" aria-hidden /> 214 passed
                        </>
                    ) : (
                        "Running"
                    )}
                </CheckRow>
                <CheckRow
                    tile={
                        <span
                            className={cn(
                                "size-5 shrink-0 overflow-hidden border bg-white transition-colors duration-300",
                                approved
                                    ? "border-[color-mix(in_oklab,var(--tone)_80%,black)]"
                                    : "border-edge",
                            )}
                        >
                            <Image
                                src="/images/team/piyush.png"
                                alt=""
                                width={48}
                                height={48}
                                className="size-full scale-[1.3] object-cover object-[50%_40%]"
                            />
                        </span>
                    }
                    label="Review from Piyush"
                    done={approved}
                >
                    {approved ? (
                        <>
                            <CheckIcon className="size-3" aria-hidden /> Approved
                        </>
                    ) : (
                        "Requested"
                    )}
                </CheckRow>

                <div className="p-3">
                    <motion.div
                        animate={{ y: merged ? 3 : 0 }}
                        transition={MOVE}
                        className={cn(
                            "flex h-8 items-center justify-center gap-2 border text-[11.5px] font-medium transition-[background-color,border-color,color,box-shadow] duration-300",
                            merged &&
                                cn(
                                    BUTTON_FILL,
                                    "shadow-[0_0_0_color-mix(in_oklab,var(--tone)_55%,black)]",
                                ),
                            approved &&
                                !merged &&
                                cn(
                                    BUTTON_FILL,
                                    "shadow-[0_3px_0_color-mix(in_oklab,var(--tone)_55%,black)]",
                                ),
                            !approved &&
                                "border-edge bg-mist text-neutral-400 shadow-[0_3px_0_var(--color-edge)]",
                        )}
                    >
                        {merged ? (
                            <CheckIcon className="size-3.5" aria-hidden />
                        ) : (
                            <MergeIcon className="size-3.5" aria-hidden />
                        )}
                        {merged ? "Merged" : "Merge pull request"}
                    </motion.div>
                </div>
            </motion.div>
        </MockWindow>
    );
}
