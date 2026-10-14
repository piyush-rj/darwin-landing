import { PointerCursorIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { CURSOR_PATH, span } from "./createIssueScript";

const TRAVEL_MS = 450;
const CLICK_MS = 160;

function easeInOut(progress: number) {
    return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
}

function cursorAt(time: number) {
    const nextIndex = CURSOR_PATH.findIndex((stop) => stop.at > time);
    const next = CURSOR_PATH[nextIndex === -1 ? CURSOR_PATH.length - 1 : nextIndex];
    const previous = CURSOR_PATH[nextIndex <= 0 ? 0 : nextIndex - 1];
    const travel =
        nextIndex === -1
            ? 0
            : easeInOut(span(time, Math.max(previous.at, next.at - TRAVEL_MS), next.at));
    const clicking = CURSOR_PATH.some(
        (stop) => stop.click && time >= stop.at && time < stop.at + CLICK_MS,
    );

    return {
        x: previous.x + (next.x - previous.x) * travel,
        y: previous.y + (next.y - previous.y) * travel,
        clicking,
    };
}

export default function DemoCursor({ time }: { time: number }) {
    const cursor = cursorAt(time);

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute z-50"
            style={{ left: cursor.x, top: cursor.y }}
        >
            <span
                className={cn(
                    "absolute -top-3 -left-3 size-6 rounded-full bg-primary/25 transition-all duration-150",
                    cursor.clicking ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
            />
            <PointerCursorIcon
                className={cn(
                    "relative size-6 text-white filter-[drop-shadow(0_0_1px_rgb(0_0_0))_drop-shadow(0_4px_6px_rgb(0_0_0/0.2))] transition-transform duration-100",
                    cursor.clicking && "scale-85",
                )}
            />
        </div>
    );
}
