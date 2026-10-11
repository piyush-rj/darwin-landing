import { motion } from "motion/react";
import Image from "next/image";
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

import { HARD_SHADOW } from "../boxStyles";
import { LOOP } from "./loopTimeline";

const DONE_TONE = KanbanBoard.glyphFor(KanbanStatus.Done).titleBox;
const DIFF_BLOCKS = ["added", "added", "added", "removed", "unchanged"] as const;
const BUTTON_FILL =
    "border-[color-mix(in_oklab,var(--tone)_80%,black)] bg-[color-mix(in_oklab,var(--tone)_80%,black)] text-white";
const MOVE = { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const;

function Tile({ done, children }: { done: boolean; children: ReactNode }) {
    return (
        <span
            className={cn(
                "flex size-6 shrink-0 items-center justify-center border transition-colors duration-300",
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
        <div className="flex h-[38px] items-center gap-3 border-b border-dashed border-edge px-3 text-[13.5px]">
            {tile}
            <span className="text-foreground/80">{label}</span>
            <span
                className={cn(
                    "ml-auto flex items-center gap-1 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors duration-300",
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
            <div className="flex h-[246px] items-center justify-center gap-2 border border-dashed border-edge bg-snow/60 font-mono text-[11px] tracking-[0.12em] text-neutral-400 uppercase">
                <span aria-hidden className="size-1.5 animate-pulse bg-current" />
                Waiting for a passing run
            </div>
        );
    }

    const checked = frame >= LOOP.checked;
    const approved = frame >= LOOP.approved;
    const merged = frame >= LOOP.merged;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={MOVE}
            className={cn("border border-edge bg-snow", HARD_SHADOW)}
        >
            <div className="border-b border-edge px-3 py-3">
                <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                    <GithubLogoIcon className="size-3.5 text-foreground/70" aria-hidden />
                    acme/web
                    <span className="text-neutral-400">#910</span>
                </div>
                <p className="mt-2 flex items-center gap-2.5 text-[14px] text-foreground">
                    <span
                        className={cn(
                            "flex size-6 shrink-0 items-center justify-center text-white transition-colors duration-500",
                            merged ? "bg-(--tone)" : "bg-green-500",
                        )}
                    >
                        {merged ? (
                            <MergeIcon className="size-3.5" aria-hidden />
                        ) : (
                            <PullRequestOpenIcon className="size-3.5" aria-hidden />
                        )}
                    </span>
                    fix(checkout): round after conversion
                </p>
                <div className="mt-2.5 flex items-center gap-2 font-mono text-[11px] text-neutral-400">
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
                        <RunnerIcon className="size-3.5" aria-hidden />
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
                            "size-6 shrink-0 overflow-hidden border bg-white transition-colors duration-300",
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

            <div className="p-3 pb-4">
                <motion.div
                    animate={{ y: merged ? 3 : 0 }}
                    transition={MOVE}
                    className={cn(
                        "flex h-10 items-center justify-center gap-2 border text-[13.5px] font-medium transition-[background-color,border-color,color,box-shadow] duration-300",
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
    );
}
