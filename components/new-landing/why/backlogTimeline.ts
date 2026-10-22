export type IssueSource = "Board" | "Slack" | "Telegram" | "GitHub";

export type BacklogIssue = {
    id: string;
    title: string;
    source: IssueSource;
    pullRequest: number;
    added: number;
    removed: number;
    tests: number;
};

export const BACKLOG: BacklogIssue[] = [
    {
        id: "NOC-142",
        title: "Checkout total rounds wrong",
        source: "Slack",
        pullRequest: 910,
        added: 12,
        removed: 4,
        tests: 214,
    },
    {
        id: "NOC-139",
        title: "Avatar 404s on Safari",
        source: "Board",
        pullRequest: 911,
        added: 6,
        removed: 2,
        tests: 88,
    },
    {
        id: "NOC-137",
        title: "CSV export drops the last row",
        source: "Telegram",
        pullRequest: 912,
        added: 9,
        removed: 3,
        tests: 132,
    },
    {
        id: "NOC-133",
        title: "Retry button double-submits",
        source: "GitHub",
        pullRequest: 913,
        added: 14,
        removed: 7,
        tests: 167,
    },
    {
        id: "NOC-131",
        title: "Dates render in UTC",
        source: "Board",
        pullRequest: 914,
        added: 5,
        removed: 5,
        tests: 96,
    },
];

export const ISSUE_SOURCES: IssueSource[] = ["Board", "Slack", "Telegram", "GitHub"];

export type MachinePhase = "select" | "rise" | "work" | "tested" | "ship" | "clear" | "refill";

export type MachineBeat = {
    at: number;
    phase: MachinePhase;
    active: number | null;
    taken: number;
    shipped: number;
};

const ISSUE_MS = 3000;
const CLEAR_MS = 2600;
const REFILL_MS = 1800;

const ISSUE_BEATS: [offset: number, phase: MachinePhase][] = [
    [0, "select"],
    [450, "rise"],
    [1100, "work"],
    [1750, "tested"],
    [2250, "ship"],
];

export const PACKET_MS = 650;

export const MACHINE_BEATS: MachineBeat[] = [
    ...BACKLOG.flatMap((_, issue) =>
        ISSUE_BEATS.map(([offset, phase]) => ({
            at: issue * ISSUE_MS + offset,
            phase,
            active: issue,
            taken: phase === "select" ? issue : issue + 1,
            shipped: issue,
        })),
    ),
    {
        at: BACKLOG.length * ISSUE_MS,
        phase: "clear",
        active: null,
        taken: BACKLOG.length,
        shipped: BACKLOG.length,
    },
    {
        at: BACKLOG.length * ISSUE_MS + CLEAR_MS,
        phase: "refill",
        active: null,
        taken: 0,
        shipped: 0,
    },
];

export const MACHINE_LOOP_MS = BACKLOG.length * ISSUE_MS + CLEAR_MS + REFILL_MS;

export const STILL_BEAT = MACHINE_BEATS.findIndex(
    (beat) => beat.active === 2 && beat.phase === "work",
);
