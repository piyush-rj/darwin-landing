import FadeIn from "@/components/new-landing/FadeIn";
import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import { CardShell, IssueRow, PanelHeading, PanelTag } from "./ComparisonParts";

const WAITING_ISSUES = [
    { title: "Tooltip clips on mobile", days: 41 },
    { title: "CSV export drops the last row", days: 33 },
    { title: "Retry button double-submits", days: 27 },
    { title: "Dates render in UTC", days: 19 },
    { title: "Search ignores accents", days: 12 },
];

export default function StaleBacklogPanel() {
    const todo = KanbanBoard.glyphFor(KanbanStatus.Todo);

    return (
        <div className="relative isolate flex h-full flex-col overflow-hidden bg-[color-mix(in_oklab,var(--color-foreground)_8%,var(--color-snow))] px-6 pt-8 pb-10 md:px-9">
            <div className="grain-strong pointer-events-none absolute inset-0 -z-10 opacity-20 [.landing-dark_&]:opacity-5" />
            <FadeIn>
                <div className="flex items-center gap-2">
                    <PanelTag>Backlog</PanelTag>
                    <PanelTag>
                        <span className={cn("size-1.5 rounded-full bg-current", todo.titleBox)} />
                        Waiting
                    </PanelTag>
                </div>
                <PanelHeading
                    title="A backlog is triaged once."
                    caption="Then it waits for an engineer to get to it."
                />
            </FadeIn>

            <FadeIn delay={0.12} className="relative mx-auto mt-12 w-full max-w-[30rem]">
                <CardShell className="bg-snow/45">
                    <div className="flex items-center gap-3">
                        <span className="text-[17px] text-foreground">Closed this week:</span>
                        <span className="border border-dashed border-foreground/30 px-2 py-0.5 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-neutral-500 tabular-nums">
                            7%
                        </span>
                    </div>
                    <div className="mt-6 h-[13.5rem] overflow-hidden">
                        {WAITING_ISSUES.map((issue, index) => (
                            <IssueRow
                                key={issue.title}
                                icon={todo.icon}
                                iconClassName={todo.titleBox}
                                title={issue.title}
                                meta={`Open ${issue.days}d`}
                                index={index}
                            />
                        ))}
                    </div>
                </CardShell>
            </FadeIn>
        </div>
    );
}
