"use client";

import { useEffect, useState } from "react";

import { SuccessCircleIcon } from "@/components/icons";

import {
    AT,
    DEMO_ISSUE,
    DIALOG,
    LOOP_MS,
    span,
    STAGE_HEIGHT,
    STAGE_WIDTH,
    STILL_FRAME_MS,
} from "./createIssueScript";
import DemoCursor from "./DemoCursor";
import DemoDialog from "./DemoDialog";
import { DateMenu, MembersMenu, PriorityMenu, TagsMenu } from "./DemoMenus";
import { useLoopClock } from "./useLoopClock";

const DIALOG_OPEN_MS = 200;
const DIALOG_CLOSE_MS = 160;
const FRAME_PADDING = 24;
const FRAME_WIDTH = DIALOG.width + FRAME_PADDING * 2;
const FRAME_HEIGHT = DIALOG.height + FRAME_PADDING * 2;
const TOAST_WIDTH = 344;

function IssueCreatedToast({ time }: { time: number }) {
    const shown = span(time, AT.create + 250, AT.create + 550);
    if (shown === 0) return null;

    return (
        <div
            className="surface-menu absolute flex items-start gap-3 rounded-lg p-3 shadow-[0_8px_24px_rgba(16,24,40,0.1)]"
            style={{
                width: TOAST_WIDTH,
                left: DIALOG.left + (DIALOG.width - TOAST_WIDTH) / 2,
                top: DIALOG.top + DIALOG.height / 2 - 32,
                opacity: shown,
                transform: `translateY(${(1 - shown) * 8}px)`,
            }}
        >
            <SuccessCircleIcon className="size-5 shrink-0 text-matcha" />
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground">Issue created.</p>
                <p className="truncate text-[12.5px] text-neutral-400">{DEMO_ISSUE.title}</p>
            </div>
            <span className="rounded-md bg-overlay/8 px-3 py-1.5 text-xs font-medium text-foreground">
                View issue
            </span>
        </div>
    );
}

export default function CreateIssueDemo() {
    const { ref, time } = useLoopClock(LOOP_MS, STILL_FRAME_MS);
    const [scale, setScale] = useState(0);

    useEffect(() => {
        const frame = ref.current;
        if (!frame) return;
        const observer = new ResizeObserver(([entry]) => {
            setScale(entry.contentRect.width / FRAME_WIDTH);
        });
        observer.observe(frame);
        return () => observer.disconnect();
    }, [ref]);

    const dialogShown =
        span(time, AT.openDialog, AT.openDialog + DIALOG_OPEN_MS) *
        (1 - span(time, AT.create + 120, AT.create + 120 + DIALOG_CLOSE_MS));
    const loopFade = span(time, 0, 250) * (1 - span(time, AT.fadeOut, LOOP_MS - 150));

    return (
        <div
            ref={ref}
            aria-hidden
            className="relative mx-auto w-full"
            style={{ maxWidth: FRAME_WIDTH, aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
        >
            <div
                className="absolute top-0 left-0 origin-top-left overflow-hidden"
                style={{
                    width: FRAME_WIDTH,
                    height: FRAME_HEIGHT,
                    transform: `scale(${scale})`,
                    opacity: scale ? 1 : 0,
                }}
            >
                <div
                    data-theme-pinned
                    className="theme-playground light absolute text-foreground"
                    style={{
                        width: STAGE_WIDTH,
                        height: STAGE_HEIGHT,
                        left: FRAME_PADDING - DIALOG.left,
                        top: FRAME_PADDING - DIALOG.top,
                        opacity: loopFade,
                    }}
                >
                    {dialogShown > 0 && (
                        <div
                            className="absolute inset-0"
                            style={{
                                opacity: dialogShown,
                                transform: `scale(${0.95 + 0.05 * dialogShown})`,
                            }}
                        >
                            <DemoDialog time={time} />
                            <PriorityMenu time={time} />
                            <MembersMenu time={time} />
                            <TagsMenu time={time} />
                            <DateMenu time={time} />
                        </div>
                    )}
                    <IssueCreatedToast time={time} />
                    <DemoCursor time={time} />
                </div>
            </div>
        </div>
    );
}
