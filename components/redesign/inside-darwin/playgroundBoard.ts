import type { ComponentType } from "react";

import {
    DoneStatusIcon,
    InProgressStatusIcon,
    InReviewStatusIcon,
    QueuedStatusIcon,
    TodoStatusIcon,
} from "@/components/icons";

export type LaneKey = "todo" | "queued" | "progress" | "review" | "done";

export type Lane = {
    key: LaneKey;
    title: string;
    Icon: ComponentType<{ className?: string }>;
    tone: string;
};

export const LANES: Lane[] = [
    { key: "todo", title: "To Do", Icon: TodoStatusIcon, tone: "text-neutral-400" },
    { key: "queued", title: "Queued", Icon: QueuedStatusIcon, tone: "text-neutral-500" },
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
        lane: "queued",
        priority: "Urgent",
        labels: [BUG],
        assignee: "darwin",
        activity: { kind: "queued" },
        created: "Created Nov 12",
    },
    {
        id: "NOC-37",
        title: "Runner leaks containers when an attempt is aborted mid-clone",
        lane: "progress",
        priority: "High",
        labels: [INFRA],
        assignee: "darwin",
        activity: { kind: "working", step: "Running tests", runner: "runner-03" },
        created: "Created Nov 10",
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

export type SceneKey = "board" | "work" | "question" | "pullRequest";

export type MockScene = {
    key: SceneKey;
    focusLane: LaneKey;
    focusActivity: CardActivity;
    boardShift: number;
    callout: { label: string; x: number; y: number; drop?: number };
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
export const PANEL = { left: SIDEBAR_WIDTH + BOARD_INSET + 12, top: 300, width: 380 };

const PANEL_EDGE = PANEL.left + PANEL.width + 4;

export const MOCK_SCENES: MockScene[] = [
    {
        key: "board",
        band: "bg-sky-300",
        focusLane: "queued",
        focusActivity: { kind: "queued" },
        boardShift: 0,
        callout: { label: "Kanban board", x: SIDEBAR_WIDTH - 8, y: 263, drop: 50 },
    },
    {
        key: "work",
        band: "bg-amber-300",
        focusLane: "progress",
        focusActivity: { kind: "working", step: "Reproducing the bug", runner: "runner-07" },
        boardShift: -2 * LANE_STEP,
        callout: { label: "Agent logs", x: PANEL_EDGE, y: PANEL.top + 22 },
    },
    {
        key: "question",
        band: "bg-rose-300",
        focusLane: "progress",
        focusActivity: { kind: "waiting" },
        boardShift: -2 * LANE_STEP,
        callout: { label: "Questions", x: PANEL_EDGE, y: PANEL.top + 22 },
    },
    {
        key: "pullRequest",
        band: "bg-violet-300",
        focusLane: "review",
        focusActivity: { kind: "review", pullRequest: 482, additions: 18, deletions: 6 },
        boardShift: -3 * LANE_STEP,
        callout: { label: "Pull request", x: PANEL_EDGE, y: PANEL.top + 250 },
    },
];
