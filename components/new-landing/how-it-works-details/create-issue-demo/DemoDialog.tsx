import type { ReactNode } from "react";

import {
    AssigneeGroupIcon,
    AutonomousModeIcon,
    BreadcrumbSeparatorIcon,
    BugProofIcon,
    CalendarIcon,
    CommandKeyIcon,
    EnterKeyIcon,
    FigmaLogoIcon,
    FilledTagIcon,
    HighPriorityIcon,
    MediumPriorityIcon,
    TemplateTriggerIcon,
} from "@/components/icons";
import PlaygroundAvatar from "@/components/playground/Core/components/PlaygroundAvatar";
import { cn } from "@/lib/utils";

import {
    AT,
    DEMO_ISSUE,
    DEMO_MEMBERS,
    DEMO_TAGS,
    DIALOG,
    FIELD_ROW,
    isBetween,
    PILL_WIDTH,
    span,
    typed,
} from "./createIssueScript";

const CAPSULE_SHELL =
    "flex min-h-[calc(1lh+0.5rem)] shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-overlay/5 px-2 py-1 text-[13px] font-medium text-neutral-400 transition-colors";

function Capsule({
    width,
    active,
    centered,
    children,
}: {
    width: number;
    active?: boolean;
    centered?: boolean;
    children: ReactNode;
}) {
    return (
        <span
            style={{ width }}
            className={cn(CAPSULE_SHELL, centered && "justify-center", active && "bg-overlay/10")}
        >
            {children}
        </span>
    );
}

function Caret() {
    return (
        <span className="ml-px inline-block h-[1.1em] w-px translate-y-[0.2em] bg-neutral-100" />
    );
}

function FigmaCapsule({ time }: { time: number }) {
    const editing = isBetween(time, AT.figmaOpen, AT.figmaCommit);
    const linked = time >= AT.figmaCommit;
    const width = editing
        ? PILL_WIDTH.figmaEditing
        : linked
          ? PILL_WIDTH.figmaLinked
          : PILL_WIDTH.figmaEmpty;

    return (
        <Capsule width={width} active={editing}>
            <FigmaLogoIcon className="size-4 shrink-0 text-overlay/60" />
            {editing ? (
                <span className="truncate text-neutral-200">
                    {time >= AT.figmaPaste ? (
                        DEMO_ISSUE.figmaLink
                    ) : (
                        <span className="text-neutral-500">Paste a Figma frame link</span>
                    )}
                </span>
            ) : (
                <span>{linked ? DEMO_ISSUE.figmaFileName : "Figma"}</span>
            )}
        </Capsule>
    );
}

export default function DemoDialog({ time }: { time: number }) {
    const title = typed(DEMO_ISSUE.title, span(time, ...AT.titleTyping));
    const description = typed(DEMO_ISSUE.description, span(time, ...AT.bodyTyping));
    const typingTitle = isBetween(time, AT.titleTyping[0] - 100, AT.titleTyping[1] + 200);
    const typingBody = isBetween(time, AT.bodyTyping[0] - 100, AT.bodyTyping[1] + 200);
    const priorityPicked = time >= AT.priorityPick;
    const member = time >= AT.membersPick ? DEMO_MEMBERS[0] : null;
    const tag = time >= AT.tagsPick ? DEMO_TAGS[0] : null;
    const dated = time >= AT.dateEnd;
    const pressing = isBetween(time, AT.create, AT.create + 160);

    return (
        <div
            className="absolute rounded-2xl border border-overlay/5 bg-graphite shadow-lg"
            style={{
                left: DIALOG.left,
                top: DIALOG.top,
                width: DIALOG.width,
                height: DIALOG.height,
            }}
        >
            <div className="absolute top-4 right-6 left-6 flex h-7 items-center justify-between">
                <div className="flex items-center gap-x-1 text-xs text-overlay">
                    <PlaygroundAvatar letter="WE" tone="emerald" size="md" />
                    <BreadcrumbSeparatorIcon className="size-3.5 text-overlay/40" />
                    <span className="text-sm">New Issue</span>
                </div>
                <span className="flex size-7 items-center justify-center rounded-full bg-overlay/5">
                    <TemplateTriggerIcon className="size-3.5 text-overlay/60" />
                </span>
            </div>

            <p className="absolute top-14 right-6 left-6 h-8 text-2xl leading-tight font-semibold">
                {title ? (
                    <span className="text-neutral-100">{title}</span>
                ) : (
                    <span className="text-overlay/38">Issue Title</span>
                )}
                {typingTitle && <Caret />}
            </p>

            <p className="absolute top-25 right-6 left-6 text-[16px] leading-[1.65]">
                {description ? (
                    <span className="text-foreground">{description}</span>
                ) : (
                    <span className="text-overlay/38">Add a description...</span>
                )}
                {typingBody && <Caret />}
            </p>

            <div
                className="absolute flex items-center"
                style={{ left: FIELD_ROW.left - DIALOG.left, top: 340, gap: FIELD_ROW.gap }}
            >
                <Capsule
                    width={PILL_WIDTH.priority}
                    centered
                    active={isBetween(time, AT.priorityOpen, AT.priorityPick + 150)}
                >
                    {priorityPicked ? (
                        <HighPriorityIcon className="size-3.5 text-overlay/60" />
                    ) : (
                        <MediumPriorityIcon className="size-3.5 text-overlay/60" />
                    )}
                </Capsule>
                <Capsule width={PILL_WIDTH.mode}>
                    <AutonomousModeIcon className="size-3.5 text-overlay/60" />
                    Auto Pilot
                </Capsule>
                <Capsule width={PILL_WIDTH.bugProof}>
                    <BugProofIcon className="size-3.5 text-overlay/60" />
                    Bug proof on
                </Capsule>
                <Capsule
                    width={PILL_WIDTH.tags}
                    active={isBetween(time, AT.tagsOpen, AT.tagsClose)}
                >
                    {tag ? (
                        <>
                            <span
                                className="size-2.5 shrink-0 rounded-full ring-2 ring-card"
                                style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                        </>
                    ) : (
                        <>
                            <FilledTagIcon className="size-3 text-overlay/60" />
                            Tags
                        </>
                    )}
                </Capsule>
                <Capsule
                    width={member ? PILL_WIDTH.membersSet : PILL_WIDTH.membersEmpty}
                    active={isBetween(time, AT.membersOpen, AT.membersClose)}
                >
                    {member ? (
                        <>
                            <PlaygroundAvatar
                                letter={member.name[0]}
                                tone={member.tone}
                                src={member.avatarSrc}
                                size="lg"
                            />
                            <span className="truncate">{member.name}</span>
                        </>
                    ) : (
                        <>
                            <AssigneeGroupIcon className="size-3.5 text-overlay/80" />
                            Members
                        </>
                    )}
                </Capsule>
                <FigmaCapsule time={time} />
                <Capsule
                    width={dated ? PILL_WIDTH.dateSet : PILL_WIDTH.dateEmpty}
                    centered={!dated}
                    active={isBetween(time, AT.dateOpen, AT.dateClose)}
                >
                    <CalendarIcon className="size-3.5 shrink-0 text-[#fab71e]" />
                    {dated && DEMO_ISSUE.dateLabel}
                </Capsule>
            </div>

            <div className="absolute right-6 bottom-4 flex h-7 items-center">
                <span
                    className={cn(
                        "flex h-7 items-center gap-1 rounded-[8px] bg-primary px-2.5 text-[0.8rem] font-medium text-ink transition-transform",
                        pressing && "scale-95",
                    )}
                >
                    Create Issue
                    <span className="ml-0.5 flex items-center gap-0.5">
                        <CommandKeyIcon className="size-3" />
                        <EnterKeyIcon className="size-3" />
                    </span>
                </span>
            </div>
        </div>
    );
}
