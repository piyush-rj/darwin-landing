import { motion } from "motion/react";
import type { ReactNode } from "react";

import {
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

const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;

function ReviewerAvatar({ letter }: { letter: string }) {
    return (
        <span
            aria-hidden
            className="relative inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-linear-to-br from-[#C7B9FF] via-[#9D8AF5] to-[#6C55DE] text-[9px] leading-none font-semibold text-white shadow-[0_2px_6px_-1px_rgba(108,85,222,0.5)] ring-1 ring-overlay/15 ring-inset before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-b before:from-white/35 before:to-transparent before:opacity-80"
        >
            <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">{letter}</span>
        </span>
    );
}

function CheckRow({
    icon,
    label,
    done,
    children,
}: {
    icon: ReactNode;
    label: string;
    done: boolean;
    children: ReactNode;
}) {
    return (
        <div className="flex h-9 items-center gap-2.5 px-3 text-[12.5px]">
            {icon}
            <span className="text-foreground/80">{label}</span>
            <span
                className={cn(
                    "ml-auto flex items-center gap-1 font-mono text-[10.5px] tracking-[0.08em] uppercase transition-colors",
                    done ? DONE_TONE : "text-neutral-400",
                )}
            >
                {children}
            </span>
        </div>
    );
}

export default function PullRequestStage({ frame }: { frame: number }) {
    if (frame < LOOP.opened) {
        return (
            <div className="flex h-[18.25rem] items-center justify-center rounded-md border border-dashed border-edge text-[12.5px] text-neutral-400">
                Waiting for a passing run
            </div>
        );
    }

    const merged = frame >= LOOP.merged;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-md border border-edge bg-snow"
        >
            <div className="border-b border-edge px-3 py-2.5">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <GithubLogoIcon className="size-3.5 text-foreground/70" aria-hidden />
                    acme/web
                    <span className="font-mono text-neutral-400">#910</span>
                </div>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-foreground">
                    {merged ? (
                        <MergeIcon className="size-3.5 shrink-0 text-green-600" aria-hidden />
                    ) : (
                        <PullRequestOpenIcon
                            className="size-3.5 shrink-0 text-green-500"
                            aria-hidden
                        />
                    )}
                    fix(checkout): round after conversion
                </p>
                <p className="mt-1 font-mono text-[10.5px] text-neutral-400">
                    <span className="text-green-600">+12</span>{" "}
                    <span className="text-red-500">−4</span> · 1 file · closes NOC-142
                </p>
            </div>

            <div className="divide-y divide-edge">
                <CheckRow
                    icon={<RunnerIcon className="size-3.5 text-neutral-400" aria-hidden />}
                    label="Tests in runner-04"
                    done={frame >= LOOP.checked}
                >
                    {frame >= LOOP.checked ? (
                        <>
                            <CheckIcon className="size-3" aria-hidden /> 214 passed
                        </>
                    ) : (
                        "Running"
                    )}
                </CheckRow>
                <CheckRow
                    icon={<ReviewerAvatar letter="M" />}
                    label="Review from Maya"
                    done={frame >= LOOP.approved}
                >
                    {frame >= LOOP.approved ? (
                        <>
                            <CheckIcon className="size-3" aria-hidden /> Approved
                        </>
                    ) : (
                        "Requested"
                    )}
                </CheckRow>
            </div>

            <div className="border-t border-edge p-3">
                <div
                    className={cn(
                        "flex h-9 items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors duration-500",
                        merged
                            ? "bg-green-600 text-white"
                            : frame >= LOOP.approved
                              ? "bg-foreground text-snow"
                              : "bg-mist text-neutral-400",
                    )}
                >
                    <MergeIcon className="size-3.5" aria-hidden />
                    {merged ? "Merged" : "Merge pull request"}
                </div>
            </div>
        </motion.div>
    );
}
