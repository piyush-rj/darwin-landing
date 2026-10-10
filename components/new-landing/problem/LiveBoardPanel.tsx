"use client";

import { AnimatePresence, motion } from "motion/react";

import { GithubLogoIcon, PullRequestOpenIcon } from "@/components/icons";
import { DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import FadeIn from "@/components/new-landing/FadeIn";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { useVisualTicker } from "../useVisualTicker";
import { CardShell, IssueRow, PanelHeading, PanelTag } from "./ComparisonParts";

const SHIPPED_ISSUES = [
    "Tooltip clips on mobile",
    "CSV export drops the last row",
    "Retry button double-submits",
    "Dates render in UTC",
    "Search ignores accents",
    "Sort resets after refresh",
    "Avatar 404s on Safari",
];

const VISIBLE_ROWS = 5;
const SECONDS_BETWEEN = 3;

function ageLabel(slot: number) {
    return slot === 0 ? "Just now" : `${slot * SECONDS_BETWEEN}s ago`;
}

export default function LiveBoardPanel() {
    const { ref, frame } = useVisualTicker(2600, SHIPPED_ISSUES.length);
    const done = KanbanBoard.glyphFor(KanbanStatus.Done);
    const rows = Array.from({ length: VISIBLE_ROWS }, (_, slot) => {
        const issue = (frame - slot + SHIPPED_ISSUES.length) % SHIPPED_ISSUES.length;
        return { issue, slot, title: SHIPPED_ISSUES[issue] };
    });

    return (
        <div
            ref={ref}
            className="relative isolate flex flex-col overflow-hidden px-6 pt-8 pb-10 md:px-9"
            style={{
                background: "var(--color-primary)",
            }}
        >
            <div className="grain-strong pointer-events-none absolute inset-0 -z-10 opacity-12" />
            <FadeIn delay={0.08}>
                <div className="flex items-center gap-2">
                    <PanelTag className="border-white/25 bg-white/15 text-white">
                        <DarwinBlockLogo className="size-3.5" />
                        Darwin
                    </PanelTag>
                    <PanelTag className="border-white/25 bg-white/15 text-white">
                        <span className={cn("size-1.5 rounded-full bg-current", done.titleBox)} />
                        Live
                    </PanelTag>
                </div>
                <PanelHeading
                    inverse
                    title="Darwin clears it as it lands."
                    caption="Fixed by the agent, proven in a runner."
                />
            </FadeIn>

            <FadeIn delay={0.2} className="relative mx-auto mt-12 w-full max-w-[30rem]">
                <div className="absolute -top-[34px] right-[34px] z-10 rounded-[16px] bg-white/20 p-1.5">
                    <div className="flex size-14 items-center justify-center rounded-[11px] border border-edge bg-snow shadow-[0_10px_24px_-12px_rgba(16,24,40,0.25)]">
                        <DarwinBlockLogo className="size-11" />
                    </div>
                </div>
                <div className="absolute top-[14px] -right-[2px] z-10 rounded-[16px] bg-white/20 p-1.5 sm:-right-[30px]">
                    <div className="flex size-14 items-center justify-center rounded-[11px] border border-edge bg-snow shadow-[0_10px_24px_-12px_rgba(16,24,40,0.25)]">
                        <GithubLogoIcon className="size-10 text-foreground" />
                    </div>
                </div>

                <CardShell className="bg-white/20">
                    <div className="flex items-center gap-3">
                        <span className="text-[17px] text-foreground">Closed this week:</span>
                        <span className="rounded-[6px] bg-primary/15 p-0.5">
                            <span className="block rounded-[4px] bg-primary/30 px-2 py-0.5 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-foreground tabular-nums">
                                94%
                            </span>
                        </span>
                    </div>
                    <div className="mt-6 h-[13.5rem] overflow-hidden">
                        <AnimatePresence initial={false} mode="popLayout">
                            {rows.map((row) => (
                                <motion.div
                                    key={row.issue}
                                    layout
                                    initial={{ opacity: 0, y: -12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <IssueRow
                                        icon={row.slot === 0 ? PullRequestOpenIcon : done.icon}
                                        iconClassName={
                                            row.slot === 0 ? "text-green-500" : done.titleBox
                                        }
                                        title={row.title}
                                        meta={ageLabel(row.slot)}
                                        index={row.slot}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </CardShell>
            </FadeIn>
        </div>
    );
}
