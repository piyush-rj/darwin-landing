import { KanbanStatus } from "@/types/kanban";

type StatusSprite = { status: KanbanStatus; rows: string[] };

export const STATUS_SPRITES: StatusSprite[] = [
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
