"use client";

import * as m from "motion/react-m";

export type RelayStatus = "queued" | "progress" | "waiting" | "review";

const OUTLINE = {
    x: 2.75,
    y: 2.75,
    width: 10.5,
    height: 10.5,
    rx: 2,
    stroke: "currentColor",
    strokeWidth: 1.5,
} as const;

const MARK = {
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
} as const;

const HOLD_BARS = "M6.6 5.8 L6.6 10.2 M9.4 5.8 L9.4 10.2";
const CHANGESET = "M5.8 6.7 H10.2 M5.8 9.3 H8.9";
const MORPH = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const;

function drawn(visible: boolean) {
    return { pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 };
}

export default function StatusRelayGlyph({ status }: { status: RelayStatus }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false" className="size-full">
            <m.rect
                {...OUTLINE}
                strokeDasharray="2 1.214"
                initial={false}
                animate={{ opacity: status === "queued" ? 1 : 0 }}
                transition={MORPH}
            />
            <m.rect
                {...OUTLINE}
                initial={false}
                animate={{ opacity: status === "queued" ? 0 : 1 }}
                transition={MORPH}
            />
            <m.rect
                x={6}
                y={6}
                width={4}
                height={4}
                rx={1}
                fill="currentColor"
                style={{ transformOrigin: "8px 8px" }}
                initial={false}
                animate={{ scale: status === "progress" ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
            />
            <m.path
                d={HOLD_BARS}
                {...MARK}
                initial={false}
                animate={drawn(status === "waiting")}
                transition={MORPH}
            />
            <m.path
                d={CHANGESET}
                {...MARK}
                initial={false}
                animate={drawn(status === "review")}
                transition={{ ...MORPH, delay: status === "review" ? 0.12 : 0 }}
            />
        </svg>
    );
}
