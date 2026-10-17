import clsx from "clsx";
import type { ReactNode } from "react";
import { useId } from "react";
import type { IconBaseProps } from "react-icons";
import { FaTowerBroadcast } from "react-icons/fa6";
import { HiCheckCircle } from "react-icons/hi2";
import { TbLineDashed } from "react-icons/tb";

import { createIcon } from "./createIcon";

export const CancelledStatusIcon = createIcon(CancelledGlyph);

export const DoneStatusIcon = createIcon(DoneGlyph);

export const FailedStatusIcon = createIcon(FailedGlyph);

export const InProgressStatusIcon = createIcon(InProgressGlyph);

export const InReviewStatusIcon = createIcon(InReviewGlyph);

export const OffBoardStatusIcon = createIcon(OffBoardGlyph);

export const QueuedStatusIcon = createIcon(QueuedGlyph);

const STROKE = 1.5;

const token = {
    x: 2.75,
    y: 2.75,
    width: 10.5,
    height: 10.5,
    rx: 2,
    stroke: "currentColor",
    strokeWidth: STROKE,
} as const;

const solidToken = {
    x: 2.25,
    y: 2.25,
    width: 11.5,
    height: 11.5,
    rx: 2.5,
    fill: "currentColor",
} as const;

const mark = {
    stroke: "currentColor",
    strokeWidth: STROKE,
    strokeLinecap: "round",
    strokeLinejoin: "round",
} as const;

const CHECK = "M5.75 8.25 L7.2 9.65 L10.3 6.25";
const CROSS = "M6 6 L10 10 M10 6 L6 10";
const SLASH = "M6 6 L10 10";
const HOLD = "M6.6 5.8 L6.6 10.2 M9.4 5.8 L9.4 10.2";
const CHANGESET = "M5.8 6.7 H10.2 M5.8 9.3 H8.9";

function StatusGlyph({
    size,
    color,
    title,
    children,
    ...props
}: IconBaseProps & { children: ReactNode }) {
    return (
        <svg
            viewBox="0 0 16 16"
            width={size ?? "1em"}
            height={size ?? "1em"}
            fill="none"
            color={color}
            focusable="false"
            aria-hidden={title ? undefined : true}
            {...props}
        >
            {title ? <title>{title}</title> : null}
            {children}
        </svg>
    );
}

function TodoGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} />
        </StatusGlyph>
    );
}

function QueuedGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} strokeDasharray="2 1.214" />
        </StatusGlyph>
    );
}

function InProgressGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} />
            <rect x={6} y={6} width={4} height={4} rx={1} fill="currentColor" />
        </StatusGlyph>
    );
}

function InReviewGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} />
            <path d={CHANGESET} {...mark} />
        </StatusGlyph>
    );
}

function DoneGlyph(props: IconBaseProps) {
    const knockout = useId();
    return (
        <StatusGlyph {...props}>
            <mask id={knockout}>
                <rect {...solidToken} fill="white" />
                <path d={CHECK} {...mark} stroke="black" />
            </mask>
            <rect {...solidToken} mask={`url(#${knockout})`} />
        </StatusGlyph>
    );
}

function FailedGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} />
            <path d={CROSS} {...mark} />
        </StatusGlyph>
    );
}

function CancelledGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} />
            <path d={SLASH} {...mark} />
        </StatusGlyph>
    );
}

function OffBoardGlyph(props: IconBaseProps) {
    return (
        <StatusGlyph {...props}>
            <rect {...token} />
            <path d={HOLD} {...mark} />
        </StatusGlyph>
    );
}

export const TodoStatusIcon = createIcon(TodoGlyph);

export const NoPriorityIcon = createIcon(TbLineDashed);

export const UrgentPriorityIcon = createIcon(FaTowerBroadcast);

export const SuccessCircleIcon = createIcon(HiCheckCircle);

function HighPriorityGlyph({ className }: IconBaseProps) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            focusable="false"
            className={clsx("size-4", className)}
        >
            <rect x="1.5" y="8" width="3" height="6" rx="1" />
            <rect x="6.5" y="5" width="3" height="9" rx="1" />
            <rect x="11.5" y="2" width="3" height="12" rx="1" />
        </svg>
    );
}

function MediumPriorityGlyph({ className }: IconBaseProps) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            focusable="false"
            className={clsx("size-4", className)}
        >
            <rect x="1.5" y="8" width="3" height="6" rx="1" />
            <rect x="6.5" y="5" width="3" height="9" rx="1" />
            <rect x="11.5" y="2" width="3" height="12" rx="1" fillOpacity="0.4" />
        </svg>
    );
}

function LowPriorityGlyph({ className }: IconBaseProps) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            focusable="false"
            className={clsx("size-4", className)}
        >
            <rect x="1.5" y="8" width="3" height="6" rx="1" />
            <rect x="6.5" y="5" width="3" height="9" rx="1" fillOpacity="0.4" />
            <rect x="11.5" y="2" width="3" height="12" rx="1" fillOpacity="0.4" />
        </svg>
    );
}

export const HighPriorityIcon = createIcon(HighPriorityGlyph);

export const MediumPriorityIcon = createIcon(MediumPriorityGlyph);

export const LowPriorityIcon = createIcon(LowPriorityGlyph);
