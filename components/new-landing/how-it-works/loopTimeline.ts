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
    done: 6,
    frames: 10,
};

export function boardStatusAt(frame: number): KanbanStatus {
    if (frame < BOARD_LOOP.started) return KanbanStatus.Todo;
    if (frame < BOARD_LOOP.done) return KanbanStatus.InProgress;
    return KanbanStatus.Done;
}
