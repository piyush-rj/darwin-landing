import type { ComponentType } from "react";

import {
    DoneStatusIcon,
    InProgressStatusIcon,
    InReviewStatusIcon,
    TodoStatusIcon,
} from "@/components/icons";

export type LaneKey = "todo" | "progress" | "review" | "done";

export type Lane = {
    key: LaneKey;
    title: string;
    Icon: ComponentType<{ className?: string }>;
    tone: string;
};

export const LANES: Lane[] = [
    { key: "todo", title: "To Do", Icon: TodoStatusIcon, tone: "text-neutral-400" },
    { key: "progress", title: "In Progress", Icon: InProgressStatusIcon, tone: "text-yellow-400" },
    { key: "review", title: "In Review", Icon: InReviewStatusIcon, tone: "text-indigo-400" },
    { key: "done", title: "Done", Icon: DoneStatusIcon, tone: "text-green-500" },
];

export type Priority = "Urgent" | "High" | "Medium";

export type Label = { name: string; tone: string };

export type CardActivity =
    | { kind: "queued" }
    | { kind: "working"; step: string; runner: string }
    | { kind: "waiting" }
    | { kind: "review"; pullRequest: number; additions: number; deletions: number }
    | { kind: "merged"; duration: string };

export type BoardCard = {
    id: string;
    title: string;
    lane: LaneKey;
    priority: Priority;
    labels: Label[];
    assignee: { initials: string; tone: string } | "darwin";
    activity?: CardActivity;
    created: string;
};

const BUG: Label = { name: "bug", tone: "bg-red-400" };
const FRONTEND: Label = { name: "frontend", tone: "bg-violet-300" };
const INFRA: Label = { name: "infra", tone: "bg-sky-400" };

export const BACKGROUND_CARDS: BoardCard[] = [
    {
        id: "NOC-51",
        title: "Issue search misses anything with a hyphen in the title",
        lane: "todo",
        priority: "Medium",
        labels: [BUG],
        assignee: { initials: "DV", tone: "bg-emerald-950 text-emerald-400" },
        created: "Created Nov 14",
    },
    {
        id: "NOC-39",
        title: "OTP lockout counter never resets after a successful sign-in",
        lane: "todo",
        priority: "Urgent",
        labels: [BUG],
        assignee: "darwin",
        activity: { kind: "queued" },
        created: "Created Nov 12",
    },
    {
        id: "NOC-33",
        title: "GitHub check-run status never clears when a PR is force-pushed",
        lane: "done",
        priority: "Medium",
        labels: [INFRA],
        assignee: "darwin",
        activity: { kind: "merged", duration: "4m 05s" },
        created: "Created Nov 8",
    },
    {
        id: "NOC-29",
        title: "Board loses column order when two people drag at the same time",
        lane: "done",
        priority: "High",
        labels: [FRONTEND, BUG],
        assignee: "darwin",
        activity: { kind: "merged", duration: "6m 40s" },
        created: "Created Nov 6",
    },
];

export const FOCUS_CARD: Omit<BoardCard, "lane" | "activity"> = {
    id: "NOC-42",
    title: "Kanban card avatars flash the wrong colour on first paint",
    priority: "High",
    labels: [FRONTEND, BUG],
    assignee: "darwin",
    created: "Created Nov 16",
};

export type PanelKind = "logs" | "question" | "pullRequest";

export type MockScene = {
    focusLane: LaneKey;
    focusAssignee: BoardCard["assignee"];
    focusActivity?: CardActivity;
    panel: PanelKind | null;
    inboxCount: number;
    band: string;
};

export const MOCK_WIDTH = 1240;
export const MOCK_HEIGHT = 760;
export const TITLE_BAR_HEIGHT = 36;
export const PANE_BAR_HEIGHT = 42;
export const SIDEBAR_WIDTH = 240;
export const LANE_WIDTH = 336;
export const LANE_GAP = 8;
export const LANE_STEP = LANE_WIDTH + LANE_GAP;
export const BOARD_INSET = 12;
export const LANE_PAD = 8;
export const LANE_HEADER_HEIGHT = 28;
export const CARD_WIDTH = LANE_WIDTH - 2 * LANE_PAD;
export const FOCUS_CARD_Y = BOARD_INSET + LANE_PAD + LANE_HEADER_HEIGHT + LANE_GAP;
export function laneIndex(lane: LaneKey) {
    return LANES.findIndex((candidate) => candidate.key === lane);
}

export const BOARD_WIDTH =
    2 * BOARD_INSET + LANES.length * LANE_WIDTH + (LANES.length - 1) * LANE_GAP;
export const VISIBLE_BOARD_WIDTH = MOCK_WIDTH - SIDEBAR_WIDTH;

export function cardX(lanePosition: number) {
    return BOARD_INSET + lanePosition * LANE_STEP + LANE_PAD;
}

export function boardPan(lanePosition: number, visibleWidth: number) {
    const centered = lanePosition * LANE_STEP - (visibleWidth - LANE_WIDTH) / 2;
    return Math.min(Math.max(0, centered), BOARD_WIDTH - visibleWidth);
}

const PRIYA: BoardCard["assignee"] = { initials: "PN", tone: "bg-indigo-950 text-indigo-300" };

export const MOCK_SCENES: MockScene[] = [
    {
        focusLane: "todo",
        focusAssignee: PRIYA,
        panel: null,
        inboxCount: 3,
        band: "bg-sky-300",
    },
    {
        focusLane: "progress",
        focusAssignee: "darwin",
        focusActivity: { kind: "working", step: "Reproducing the bug", runner: "runner-07" },
        panel: "logs",
        inboxCount: 3,
        band: "bg-amber-300",
    },
    {
        focusLane: "review",
        focusAssignee: "darwin",
        focusActivity: { kind: "waiting" },
        panel: "question",
        inboxCount: 4,
        band: "bg-rose-300",
    },
    {
        focusLane: "done",
        focusAssignee: "darwin",
        focusActivity: { kind: "merged", duration: "3m 12s" },
        panel: "pullRequest",
        inboxCount: 3,
        band: "bg-violet-300",
    },
];
