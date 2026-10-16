import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import PixelSprite from "./PixelSprite";

type StatusSprite = { status: KanbanStatus; rows: string[] };

const SHADES: Record<string, string> = {
    b: "currentColor",
    h: "color-mix(in oklab, currentColor 55%, white)",
    s: "color-mix(in oklab, currentColor 72%, black)",
    f: "color-mix(in oklab, currentColor 12%, white)",
    k: "var(--color-snow)",
};

const STATUS_SPRITES: StatusSprite[] = [
    {
        status: KanbanStatus.Todo,
        rows: [
            "..hhhhhhhhhh..",
            ".hbbbbbbbbbbb.",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            ".bbbbbbbbbbbs.",
            "..ssssssssss..",
        ],
    },
    {
        status: KanbanStatus.InProgress,
        rows: [
            "..hhhhhhhhhh..",
            ".hbbbbbbbbbbb.",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbfffhhbbfffbs",
            "hbfffhbbbfffbs",
            "hbfffbbbbfffbs",
            "hbfffbbbbfffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            ".bbbbbbbbbbbs.",
            "..ssssssssss..",
        ],
    },
    {
        status: KanbanStatus.InReview,
        rows: [
            "..hhhhhhhhhh..",
            ".hbbbbbbbbbbb.",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffbbbbbbffbs",
            "hbffbbbbbbffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            "hbffbbbbffffbs",
            "hbffbbbbffffbs",
            "hbffffffffffbs",
            "hbffffffffffbs",
            ".bbbbbbbbbbbs.",
            "..ssssssssss..",
        ],
    },
    {
        status: KanbanStatus.Done,
        rows: [
            "..hhhhhhhhhh..",
            ".hbbbbbbbbbbb.",
            "hbbbbbbbbbbbbs",
            "hbbbbbbbbbbbbs",
            "hbbbbbbbbkkbbs",
            "hbbbbbbbkkbbbs",
            "hbbkkbbkkbbbbs",
            "hbbbkkkkbbbbbs",
            "hbbbbkkbbbbbbs",
            "hbbbbbbbbbbbbs",
            "hbbbbbbbbbbbbs",
            "hbbbbbbbbbbbbs",
            ".bbbbbbbbbbbs.",
            "..ssssssssss..",
        ],
    },
];

export const STATUS_BLOCK_ORDER = STATUS_SPRITES.map((sprite) => sprite.status);

export default function StatusBlock({
    status,
    scale = 1,
    className,
}: {
    status: KanbanStatus;
    scale?: number;
    className?: string;
}) {
    const sprite = STATUS_SPRITES.find((candidate) => candidate.status === status)!;
    return (
        <PixelSprite
            art={{ rows: sprite.rows, colors: SHADES }}
            scale={scale}
            className={cn(KanbanBoard.glyphFor(status).titleBox, className)}
        />
    );
}
