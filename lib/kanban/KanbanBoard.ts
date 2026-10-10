import {
    CancelledStatusIcon,
    DoneStatusIcon,
    FailedStatusIcon,
    InProgressStatusIcon,
    InReviewStatusIcon,
    OffBoardStatusIcon,
    QueuedStatusIcon,
    TodoStatusIcon,
} from "@/components/icons";
import { type KanbanColumnDef, KanbanStatus } from "@/types/kanban";

export type StatusGlyph = Pick<KanbanColumnDef, "icon" | "titleBox">;

/** Board configuration and lane bookkeeping for the LLM Kanban. */
export class KanbanBoard {
    /**
     * Status glyph colours are literals, not tokens, so a lane reads the same
     * whichever theme is active — the status is a property of the issue, not of
     * the surface it sits on. Every value clears 3:1 against both grounds.
     */
    static readonly COLUMNS: KanbanColumnDef[] = [
        {
            status: KanbanStatus.Todo,
            title: "To Do",
            icon: TodoStatusIcon,
            titleBox: "text-[#8a8f98]",
        },
        {
            status: KanbanStatus.Queued,
            title: "Queued",
            icon: QueuedStatusIcon,
            titleBox: "text-[#7e838d]",
        },
        {
            status: KanbanStatus.InProgress,
            title: "In Progress",
            icon: InProgressStatusIcon,
            titleBox: "text-yellow-400",
        },
        {
            status: KanbanStatus.InReview,
            title: "In Review",
            icon: InReviewStatusIcon,
            titleBox: "text-[#8999FF]",
        },
        {
            status: KanbanStatus.Done,
            title: "Done",
            icon: DoneStatusIcon,
            titleBox: "text-[#34C75C]",
        },
        {
            status: KanbanStatus.Failed,
            title: "Failed",
            icon: FailedStatusIcon,
            titleBox: "text-[#e5484d]",
        },
        {
            status: KanbanStatus.Cancelled,
            title: "Cancelled",
            icon: CancelledStatusIcon,
            titleBox: "text-[#6f747e]",
        },
    ];

    private static readonly COLUMN_BY_STATUS = new Map(
        KanbanBoard.COLUMNS.map((column) => [column.status as string, column]),
    );

    static columnFor(status: string | undefined): KanbanColumnDef | undefined {
        return status ? KanbanBoard.COLUMN_BY_STATUS.get(status) : undefined;
    }

    /**
     * Issues parked in a custom column sit outside the LLM lanes, so they have no
     * `COLUMNS` entry. Their glyph lives here rather than in `COLUMNS`, which
     * would add a lane to the board.
     */
    private static readonly OFF_BOARD_GLYPH: StatusGlyph = {
        icon: OffBoardStatusIcon,
        titleBox: "text-[#6f747e]",
    };

    /** The status circle for any issue, on a board lane or parked off it. */
    static glyphFor(status: string | undefined): StatusGlyph {
        const column = KanbanBoard.columnFor(status);
        return column
            ? { icon: column.icon, titleBox: column.titleBox }
            : KanbanBoard.OFF_BOARD_GLYPH;
    }
}
