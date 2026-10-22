export type StaleIssue = {
    id: string;
    title: string;
    label: string;
    waitedDays: number;
    runner: string;
    pullRequest: number;
    tests: number;
    reviewer: string;
};

export const STALE_ISSUES: StaleIssue[] = [
    {
        id: "NOC-142",
        title: "Checkout total rounds wrong",
        label: "Bug",
        waitedDays: 41,
        runner: "runner-04",
        pullRequest: 910,
        tests: 214,
        reviewer: "Piyush",
    },
    {
        id: "NOC-088",
        title: "Search ignores accents",
        label: "Bug",
        waitedDays: 88,
        runner: "runner-11",
        pullRequest: 911,
        tests: 132,
        reviewer: "Rishi",
    },
    {
        id: "NOC-151",
        title: "Tooltip clips on mobile",
        label: "UI",
        waitedDays: 17,
        runner: "runner-02",
        pullRequest: 912,
        tests: 96,
        reviewer: "Anjan",
    },
];

export type PickupPhase = "waiting" | "claim" | "progress" | "review" | "done" | "leave";

export type PickupBeat = {
    at: number;
    issue: number;
    phase: PickupPhase;
    daysAgo: number;
};

const ISSUE_MS = 7200;

const ISSUE_BEATS: [offset: number, phase: PickupPhase, daysAgo: number][] = [
    [0, "waiting", 2],
    [900, "waiting", 1],
    [1500, "waiting", 0],
    [2300, "claim", 0],
    [3100, "progress", 0],
    [4500, "review", 0],
    [5800, "done", 0],
    [6800, "leave", 0],
];

export const PICKUP_BEATS: PickupBeat[] = STALE_ISSUES.flatMap((_, issue) =>
    ISSUE_BEATS.map(([offset, phase, daysAgo]) => ({
        at: issue * ISSUE_MS + offset,
        issue,
        phase,
        daysAgo,
    })),
);

export const PICKUP_LOOP_MS = STALE_ISSUES.length * ISSUE_MS;

export const PICKUP_STILL_BEAT = PICKUP_BEATS.findIndex(
    (beat) => beat.issue === 0 && beat.phase === "review",
);
