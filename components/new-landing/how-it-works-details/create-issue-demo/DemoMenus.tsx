import type { CSSProperties, ReactNode } from "react";

import { CheckIcon } from "@/components/icons";
import PlaygroundAvatar from "@/components/playground/Core/components/PlaygroundAvatar";
import TagDisplay from "@/components/playground/Home/TagsDisplay/TagDisplay";
import { PRIORITY_OPTIONS } from "@/components/playground/Issue/issueHelpers";
import { MENU_ITEM, MENU_SURFACE } from "@/components/ui/menuSurface";
import { cn } from "@/lib/utils";

import {
    AT,
    DATE_MENU,
    DEMO_MEMBERS,
    DEMO_TAGS,
    FIELD_ROW,
    isBetween,
    PILL_WIDTH,
    STAGE_HEIGHT,
} from "./createIssueScript";

const ROLE_TAG = {
    Admin: "bg-amber-500/15 text-amber-600",
    Write: "bg-sky-500/15 text-sky-600",
};

const CALENDAR_LEAD_DAYS = [28, 29, 30];
const OCTOBER_DAYS = 31;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const RANGE_START = 14;
const RANGE_END = 17;

const TAGS_LEFT =
    FIELD_ROW.left +
    PILL_WIDTH.priority +
    PILL_WIDTH.mode +
    PILL_WIDTH.bugProof +
    FIELD_ROW.gap * 3;
const MEMBERS_LEFT = TAGS_LEFT + PILL_WIDTH.tags + FIELD_ROW.gap;

function MenuPanel({
    left,
    width,
    children,
}: {
    left: number;
    width: number;
    children: ReactNode;
}) {
    const style: CSSProperties = { left, width, bottom: STAGE_HEIGHT - FIELD_ROW.bottom };
    return (
        <div style={style} className={cn(MENU_SURFACE, "absolute overflow-hidden p-0")}>
            {children}
        </div>
    );
}

function SearchInput({ placeholder }: { placeholder: string }) {
    return (
        <div className="flex h-9 items-center border-b border-border px-3 text-xs text-neutral-500">
            {placeholder}
        </div>
    );
}

export function PriorityMenu({ time }: { time: number }) {
    if (!isBetween(time, AT.priorityOpen, AT.priorityPick + 150)) return null;
    const hovering = time >= AT.priorityPick - 250;

    return (
        <MenuPanel left={FIELD_ROW.left} width={208}>
            <div className="p-1">
                {PRIORITY_OPTIONS.map((option, index) => (
                    <div
                        key={option.value}
                        data-selected={hovering ? option.value === "high" : index === 0}
                        className={cn(MENU_ITEM, "h-[34px] rounded-lg")}
                    >
                        <option.icon
                            className={cn("size-4 text-neutral-400", option.iconClassName)}
                        />
                        <span className="flex-1">{option.label}</span>
                        {option.value === "medium" && (
                            <CheckIcon className="size-4 text-neutral-200" />
                        )}
                        <span className="w-3 text-right text-[12px] text-neutral-500">
                            {option.rank}
                        </span>
                    </div>
                ))}
            </div>
        </MenuPanel>
    );
}

export function MembersMenu({ time }: { time: number }) {
    if (!isBetween(time, AT.membersOpen, AT.membersClose)) return null;
    const picked = time >= AT.membersPick;

    return (
        <MenuPanel left={MEMBERS_LEFT} width={288}>
            <SearchInput placeholder="Search members..." />
            <div className="p-1">
                {DEMO_MEMBERS.map((member, index) => {
                    const checked = picked && index === 0;
                    return (
                        <div
                            key={member.email}
                            data-selected={index === 0}
                            className={cn(MENU_ITEM, "h-11 rounded-lg")}
                        >
                            <span
                                className={cn(
                                    "flex size-3.5 items-center justify-center rounded border",
                                    checked
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-overlay/25",
                                )}
                            >
                                {checked && <CheckIcon className="size-2.5" />}
                            </span>
                            <PlaygroundAvatar
                                letter={member.name[0]}
                                tone={member.tone}
                                src={member.avatarSrc}
                                size="lg"
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="text-[13px] leading-tight text-neutral-100">
                                    {member.name}
                                </span>
                                <span className="text-[11px] leading-tight text-neutral-500">
                                    {member.email}
                                </span>
                            </span>
                            <span
                                className={cn(
                                    "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                    ROLE_TAG[member.role],
                                )}
                            >
                                {member.role}
                            </span>
                        </div>
                    );
                })}
            </div>
        </MenuPanel>
    );
}

export function TagsMenu({ time }: { time: number }) {
    if (!isBetween(time, AT.tagsOpen, AT.tagsClose)) return null;
    const picked = time >= AT.tagsPick;

    return (
        <MenuPanel left={TAGS_LEFT} width={160}>
            <SearchInput placeholder="Search or create tag..." />
            <div className="p-1">
                {DEMO_TAGS.map((tag, index) => (
                    <div key={tag.name} className={cn(MENU_ITEM, "h-8 rounded-lg")}>
                        <TagDisplay name={tag.name} color={tag.color} className="flex-1" />
                        {picked && index === 0 && <CheckIcon className="size-4 text-neutral-400" />}
                    </div>
                ))}
            </div>
        </MenuPanel>
    );
}

export function DateMenu({ time }: { time: number }) {
    if (!isBetween(time, AT.dateOpen, AT.dateClose)) return null;
    const start = time >= AT.dateStart ? RANGE_START : null;
    const end = time >= AT.dateEnd ? RANGE_END : null;
    const trailing = 7 - ((CALENDAR_LEAD_DAYS.length + OCTOBER_DAYS) % 7);
    const days = [
        ...CALENDAR_LEAD_DAYS.map((day) => ({ day, inMonth: false })),
        ...Array.from({ length: OCTOBER_DAYS }, (_, index) => ({ day: index + 1, inMonth: true })),
        ...Array.from({ length: trailing }, (_, index) => ({ day: index + 1, inMonth: false })),
    ];

    return (
        <MenuPanel left={DATE_MENU.left} width={DATE_MENU.width}>
            <div className="flex h-9 items-center justify-between px-3">
                <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                    Start and end date
                </span>
                <span className="text-[11px] text-neutral-500">Clear</span>
            </div>
            <div className="h-px bg-overlay/5" />
            <div className="p-3">
                <p className="flex h-8 items-center justify-center text-[13px] font-medium text-neutral-100">
                    October 2026
                </p>
                <div className="grid h-6 grid-cols-7 text-center text-[11px] text-neutral-500">
                    {WEEKDAYS.map((weekday) => (
                        <span key={weekday}>{weekday}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map(({ day, inMonth }, index) => {
                        const isEnd = inMonth && (day === start || day === end);
                        const inRange =
                            inMonth && start !== null && end !== null && day > start && day < end;
                        return (
                            <span
                                key={index}
                                className={cn(
                                    "flex size-8 items-center justify-center rounded-full text-[12.5px]",
                                    !inMonth && "text-neutral-600",
                                    inMonth && "text-neutral-200",
                                    inRange && "rounded-none bg-overlay/5",
                                    isEnd && "bg-primary text-primary-foreground",
                                    inMonth &&
                                        day === RANGE_START &&
                                        !isEnd &&
                                        "ring-1 ring-overlay/20",
                                )}
                            >
                                {day}
                            </span>
                        );
                    })}
                </div>
            </div>
        </MenuPanel>
    );
}
