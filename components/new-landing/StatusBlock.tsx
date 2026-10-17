import { KanbanBoard } from "@/lib/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import type { KanbanStatus } from "@/types/kanban";

import PixelSprite from "./PixelSprite";
import { STATUS_SPRITES } from "./statusSprites";

const SHADES: Record<string, string> = {
    b: "currentColor",
    h: "color-mix(in oklab, currentColor 55%, white)",
    s: "color-mix(in oklab, currentColor 72%, black)",
    f: "color-mix(in oklab, currentColor 12%, white)",
    k: "var(--color-snow)",
};

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
