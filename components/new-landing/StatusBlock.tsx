import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import { KanbanStatus } from "@/types/kanban";

import PixelBlockArt, { type PixelArt } from "./PixelBlockArt";

type Block = PixelArt & { status: KanbanStatus; dark: string };

const STONE = {
    base: "var(--color-zinc-400)",
    light: "var(--color-zinc-300)",
    dark: "var(--color-zinc-500)",
    deep: "var(--color-zinc-600)",
};

const GOLD = {
    base: "var(--color-amber-400)",
    light: "var(--color-amber-300)",
    dark: "var(--color-amber-500)",
    deep: "var(--color-amber-700)",
};

const LAPIS = {
    base: "var(--color-indigo-600)",
    light: "var(--color-indigo-400)",
    dark: "var(--color-indigo-700)",
    deep: "var(--color-indigo-900)",
};

const GRASS = {
    base: "var(--color-green-500)",
    light: "var(--color-lime-400)",
    dark: "var(--color-green-600)",
    dirt: "var(--color-amber-800)",
    dirtLight: "var(--color-amber-700)",
    dirtDark: "var(--color-amber-900)",
};

const BLOCKS: Block[] = [
    {
        status: KanbanStatus.Todo,
        base: STONE.base,
        light: STONE.light,
        dark: STONE.dark,
        outline: STONE.deep,
        pixels: [
            [2, 3, 4, 1, STONE.dark],
            [6, 4, 1, 3, STONE.dark],
            [9, 2, 1, 4, STONE.dark],
            [10, 6, 4, 1, STONE.dark],
            [3, 9, 1, 4, STONE.dark],
            [4, 9, 5, 1, STONE.dark],
            [11, 10, 1, 4, STONE.dark],
            [7, 12, 4, 1, STONE.dark],
            [3, 6, 2, 1, STONE.light],
            [11, 3, 2, 1, STONE.light],
            [6, 11, 1, 1, STONE.light],
            [13, 12, 1, 1, STONE.light],
            [8, 7, 1, 1, STONE.deep],
        ],
    },
    {
        status: KanbanStatus.InProgress,
        base: GOLD.base,
        light: GOLD.light,
        dark: GOLD.dark,
        outline: GOLD.deep,
        pixels: [
            [1, 5, 14, 1, GOLD.deep],
            [1, 10, 14, 1, GOLD.deep],
            [5, 1, 1, 4, GOLD.deep],
            [11, 6, 1, 4, GOLD.deep],
            [4, 11, 1, 4, GOLD.deep],
            [2, 3, 2, 1, GOLD.light],
            [8, 2, 3, 1, GOLD.light],
            [2, 8, 3, 1, GOLD.light],
            [13, 8, 1, 1, GOLD.light],
            [7, 13, 3, 1, GOLD.light],
            [8, 7, 2, 1, GOLD.dark],
            [12, 12, 2, 1, GOLD.dark],
        ],
    },
    {
        status: KanbanStatus.InReview,
        base: LAPIS.base,
        light: LAPIS.light,
        dark: LAPIS.dark,
        outline: LAPIS.deep,
        pixels: [
            [2, 2, 2, 2, LAPIS.light],
            [11, 3, 2, 1, LAPIS.light],
            [12, 4, 1, 1, LAPIS.light],
            [3, 11, 1, 2, LAPIS.light],
            [12, 11, 2, 2, LAPIS.light],
            [7, 13, 2, 1, LAPIS.light],
            [6, 2, 1, 1, LAPIS.deep],
            [2, 7, 1, 1, LAPIS.deep],
            [13, 8, 1, 1, LAPIS.deep],
            [9, 12, 1, 1, LAPIS.deep],
        ],
    },
    {
        status: KanbanStatus.Done,
        base: GRASS.dirt,
        light: GRASS.light,
        dark: GRASS.dirtDark,
        outline: GRASS.dirtDark,
        pixels: [
            [0, 0, 16, 5, GRASS.base],
            [1, 5, 2, 1, GRASS.base],
            [5, 5, 3, 2, GRASS.base],
            [10, 5, 1, 2, GRASS.base],
            [13, 5, 2, 1, GRASS.base],
            [6, 7, 1, 1, GRASS.dark],
            [2, 1, 2, 1, GRASS.light],
            [9, 2, 2, 1, GRASS.light],
            [13, 1, 1, 1, GRASS.light],
            [5, 3, 1, 1, GRASS.dark],
            [12, 3, 1, 1, GRASS.dark],
            [3, 9, 1, 1, GRASS.dirtLight],
            [9, 10, 2, 1, GRASS.dirtLight],
            [5, 13, 1, 1, GRASS.dirtLight],
            [12, 13, 1, 1, GRASS.dirtLight],
            [7, 11, 1, 1, GRASS.dirtDark],
            [2, 12, 1, 1, GRASS.dirtDark],
            [13, 9, 1, 1, GRASS.dirtDark],
        ],
    },
];

export const STATUS_BLOCK_ORDER = BLOCKS.map((block) => block.status);

export default function StatusBlock({
    status,
    depth = 4,
    className,
    iconClassName,
}: {
    status: KanbanStatus;
    depth?: number;
    className?: string;
    iconClassName?: string;
}) {
    const block = BLOCKS.find((candidate) => candidate.status === status)!;
    const column = KanbanBoard.columnFor(status)!;
    return (
        <span
            style={{ boxShadow: `0 0 0 1px ${block.outline}, 0 ${depth}px 0 ${block.outline}` }}
            className={cn("relative flex shrink-0 items-center justify-center", className)}
        >
            <PixelBlockArt art={block} />
            <column.icon
                className={cn(
                    "relative text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.45)]",
                    iconClassName,
                )}
            />
        </span>
    );
}
