import { KanbanStatus } from "@/types/kanban";

export const FRAME_MS = 650;

export const LOOP = {
    assigned: 1,
    started: 2,
    firstLog: 3,
    opened: 10,
    checked: 12,
    approved: 13,
    merged: 14,
    frames: 19,
};

export function statusAt(frame: number): KanbanStatus {
    if (frame < LOOP.started) return KanbanStatus.Todo;
    if (frame < LOOP.opened) return KanbanStatus.InProgress;
    if (frame < LOOP.merged) return KanbanStatus.InReview;
    return KanbanStatus.Done;
}
