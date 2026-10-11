import { KanbanStatus } from "@/types/kanban";

export const FRAME_MS = 860;

export const LOOP = {
    firstLog: 3,
    opened: 10,
    checked: 12,
    approved: 13,
    merged: 14,
    frames: 19,
};

export const BOARD_LOOP = {
    assigned: 1,
    started: 2,
    inReview: 5,
    done: 9,
    frames: 13,
};

export function boardStatusAt(frame: number): KanbanStatus {
    if (frame < BOARD_LOOP.started) return KanbanStatus.Todo;
    if (frame < BOARD_LOOP.inReview) return KanbanStatus.InProgress;
    if (frame < BOARD_LOOP.done) return KanbanStatus.InReview;
    return KanbanStatus.Done;
}
