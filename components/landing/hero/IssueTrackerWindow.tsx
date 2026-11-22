"use client";

import * as m from "motion/react-m";
import { useRef } from "react";

import {
    DoneStatusIcon,
    InProgressStatusIcon,
    InReviewStatusIcon,
    PullRequestOpenIcon,
    TodoStatusIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

import { DarwinAvatar, PersonAvatar } from "./Avatar";
import { useLoopClock } from "./useLoopClock";

const FILED = 500;
const CLAIMED = 1900;
const REVIEWING = 4600;
const LOOP = 8000;
const MOMENTS = [0, FILED, CLAIMED, REVIEWING];
const EASE = [0.22, 1, 0.36, 1] as const;

const SIDEBAR_ITEMS = [
    { label: "Inbox", count: 3 },
    { label: "My issues" },
    { label: "Active", selected: true },
    { label: "Backlog" },
];

const STATUS = {
    todo: { icon: TodoStatusIcon, tone: "text-stone-400" },
    progress: { icon: InProgressStatusIcon, tone: "text-amber-500" },
    review: { icon: InReviewStatusIcon, tone: "text-emerald-600" },
    done: { icon: DoneStatusIcon, tone: "text-violet-500" },
};

type Status = keyof typeof STATUS;

const EARLIER_ISSUES: {
    id: string;
    title: string;
    status: Status;
    owner: "darwin" | { initials: string; tone: "amber" | "sky" | "rose" };
    pullRequest?: string;
}[] = [
    {
        id: "WEB-139",
        title: "Dark mode forgets the choice",
        status: "review",
        owner: "darwin",
        pullRequest: "#316",
    },
    {
        id: "WEB-137",
        title: "Retry failed webhooks",
        status: "progress",
        owner: { initials: "MK", tone: "sky" },
    },
    {
        id: "WEB-131",
        title: "Date picker skips Feb 29",
        status: "done",
        owner: "darwin",
        pullRequest: "#309",
    },
    {
        id: "WEB-128",
        title: "Rename Workspace to Team",
        status: "done",
        owner: "darwin",
        pullRequest: "#304",
    },
    {
        id: "WEB-124",
        title: "Invoice PDF clips addresses",
        status: "todo",
        owner: { initials: "SR", tone: "rose" },
    },
];

function StatusGlyph({ status }: { status: Status }) {
    const { icon: Icon, tone } = STATUS[status];
    return <Icon className={cn("size-3.5 shrink-0 transition-colors duration-300", tone)} />;
}

function PullRequestTag({ number }: { number: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
            <PullRequestOpenIcon className="size-2.5 text-emerald-600" />
            {number}
        </span>
    );
}

const ROW = "flex h-10 items-center gap-2.5 border-b border-stone-900/[0.05] px-4 text-[12.5px]";

export default function IssueTrackerWindow() {
    const windowRef = useRef<HTMLDivElement>(null);
    const time = useLoopClock(windowRef, MOMENTS, LOOP, REVIEWING);
    const filed = time >= FILED;
    const claimed = time >= CLAIMED;
    const reviewing = time >= REVIEWING;
    const status: Status = reviewing ? "review" : claimed ? "progress" : "todo";

    return (
        <div
            ref={windowRef}
            className="flex h-full overflow-hidden rounded-[8px] bg-snow shadow-sm ring-1 ring-stone-900/[0.06]"
        >
            <aside className="hidden w-36 shrink-0 flex-col border-r border-stone-900/[0.05] bg-stone-50/60 p-3 sm:flex">
                <div className="flex items-center gap-2 px-1.5 py-1 text-[12.5px] font-medium">
                    <span className="grid size-5 place-items-center rounded-[5px] bg-stone-900 text-[10px] text-paper">
                        A
                    </span>
                    Acme
                </div>
                <nav className="mt-4 flex flex-col gap-0.5 text-[12px]">
                    {SIDEBAR_ITEMS.map((item) => (
                        <span
                            key={item.label}
                            className={cn(
                                "flex items-center rounded-[5px] px-2 py-1.5",
                                item.selected
                                    ? "bg-stone-900/[0.05] text-stone-900"
                                    : "text-stone-500",
                            )}
                        >
                            {item.label}
                            {item.count && (
                                <span className="ml-auto text-[11px] text-stone-400">
                                    {item.count}
                                </span>
                            )}
                        </span>
                    ))}
                </nav>
                <p className="mt-5 px-2 text-[10.5px] tracking-[0.04em] text-stone-400 uppercase">
                    Teammates
                </p>
                <div className="mt-2 flex flex-col gap-1.5 px-2 text-[12px] text-stone-600">
                    <span className="flex items-center gap-2">
                        <DarwinAvatar className="size-4 text-[9px]" />
                        Darwin
                    </span>
                    <span className="flex items-center gap-2">
                        <PersonAvatar initials="MK" tone="sky" className="size-4 text-[8px]" />
                        Maya
                    </span>
                    <span className="flex items-center gap-2">
                        <PersonAvatar initials="SR" tone="rose" className="size-4 text-[8px]" />
                        Sam
                    </span>
                </div>
            </aside>

            <div className="min-w-0 flex-1">
                <div className="flex h-11 items-center gap-2 border-b border-stone-900/[0.05] px-4 text-[12.5px]">
                    <span className="font-medium text-stone-900">Active issues</span>
                    <span className="text-stone-400">Web</span>
                    <span className="ml-auto rounded-full border border-stone-900/[0.08] px-2 py-0.5 text-[11px] text-stone-500">
                        Filter
                    </span>
                </div>

                <m.div
                    initial={false}
                    animate={{ height: filed ? 40 : 0, opacity: filed ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="overflow-hidden"
                >
                    <div
                        className={cn(
                            ROW,
                            "transition-colors duration-700",
                            claimed && !reviewing ? "bg-violet-50" : "bg-transparent",
                        )}
                    >
                        <StatusGlyph status={status} />
                        <span className="w-14 shrink-0 font-mono text-[11px] text-stone-400">
                            WEB-142
                        </span>
                        <span className="truncate text-stone-900">Checkout 500s on empty cart</span>
                        <span className="ml-auto flex shrink-0 items-center gap-2">
                            <m.span
                                initial={false}
                                animate={{ opacity: reviewing ? 1 : 0, x: reviewing ? 0 : 4 }}
                                transition={{ duration: 0.4, ease: EASE }}
                            >
                                <PullRequestTag number="#318" />
                            </m.span>
                            <m.span
                                initial={false}
                                animate={{ scale: claimed ? 1 : 0.4, opacity: claimed ? 1 : 0 }}
                                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                className="inline-flex"
                            >
                                <DarwinAvatar className="size-5 text-[10px]" />
                            </m.span>
                        </span>
                    </div>
                </m.div>

                {EARLIER_ISSUES.map((issue) => (
                    <div key={issue.id} className={ROW}>
                        <StatusGlyph status={issue.status} />
                        <span className="w-14 shrink-0 font-mono text-[11px] text-stone-400">
                            {issue.id}
                        </span>
                        <span className="truncate text-stone-700">{issue.title}</span>
                        <span className="ml-auto flex shrink-0 items-center gap-2">
                            {issue.pullRequest && <PullRequestTag number={issue.pullRequest} />}
                            {issue.owner === "darwin" ? (
                                <DarwinAvatar className="size-5 text-[10px]" />
                            ) : (
                                <PersonAvatar
                                    initials={issue.owner.initials}
                                    tone={issue.owner.tone}
                                    className="size-5 text-[8.5px]"
                                />
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
