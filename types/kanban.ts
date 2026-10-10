import type { IconType } from "@/components/icons";

export const KanbanStatus = {
    Todo: "Todo",
    Queued: "Queued",
    InProgress: "InProgress",
    InReview: "InReview",
    Done: "Done",
    Failed: "Failed",
    Cancelled: "Cancelled",
} as const;
export type KanbanStatus = (typeof KanbanStatus)[keyof typeof KanbanStatus];

/** Static definition for a column header. `titleBox`/`cardTint` are the per-status colours. */
export type KanbanColumnDef = {
    status: KanbanStatus;
    title: string;
    icon: IconType;
    /** Tailwind classes for the coloured box wrapping the column title. */
    titleBox: string;
};
