import type { AvatarTone } from "@/components/playground/Core/components/PlaygroundAvatar";

export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 600;
export const LOOP_MS = 17000;
export const STILL_FRAME_MS = 12900;

export const AT = {
    openDialog: 900,
    titleTyping: [1400, 2900],
    bodyTyping: [3200, 4900],
    priorityOpen: 5300,
    priorityPick: 6200,
    membersOpen: 6900,
    membersPick: 7800,
    membersClose: 8200,
    tagsOpen: 8600,
    tagsPick: 9400,
    tagsClose: 9800,
    figmaOpen: 10100,
    figmaPaste: 10400,
    figmaCommit: 10900,
    dateOpen: 11300,
    dateStart: 11900,
    dateEnd: 12400,
    dateClose: 12800,
    create: 13300,
    fadeOut: 16400,
} as const;

export const DIALOG = { left: 105, top: 70, width: 750, height: 430 };
export const FIELD_ROW = { left: 129, bottom: 401, gap: 10 };
export const DATE_MENU = { left: DIALOG.left + DIALOG.width - 272, width: 248 };

const calendarColumnX = (column: number) => DATE_MENU.left + 12 + column * 32 + 16;

export const PILL_WIDTH = {
    priority: 30,
    mode: 100,
    bugProof: 112,
    tags: 64,
    membersEmpty: 100,
    membersSet: 112,
    figmaEmpty: 72,
    figmaEditing: 190,
    figmaLinked: 90,
    dateEmpty: 30,
    dateSet: 132,
};

export const DEMO_ISSUE = {
    key: "WEB-142",
    title: "Checkout button stays disabled",
    description:
        "The Pay button stays grey after a valid card is entered, so customers can't check out. It started after yesterday's release.",
    figmaLink: "https://www.figma.com/design/k9Fw2pQ/Checkout?node-id=12-48",
    figmaFileName: "Checkout",
    dateLabel: "Oct 14 – Oct 17",
};

export type DemoMember = {
    name: string;
    email: string;
    role: "Admin" | "Write";
    tone: AvatarTone;
    avatarSrc: string;
};

export const DEMO_MEMBERS: DemoMember[] = [
    {
        name: "Maya Chen",
        email: "maya@acme.dev",
        role: "Admin",
        tone: "emerald",
        avatarSrc: "/images/userpics/funny-bunny.svg",
    },
    {
        name: "Arjun Rao",
        email: "arjun@acme.dev",
        role: "Write",
        tone: "blue",
        avatarSrc: "/images/userpics/01.svg",
    },
    {
        name: "Sam Lee",
        email: "sam@acme.dev",
        role: "Write",
        tone: "purple",
        avatarSrc: "/images/userpics/no-comments.svg",
    },
];

export const DEMO_TAGS = [
    { name: "bug", color: "#e5484d" },
    { name: "checkout", color: "#d69e1f" },
    { name: "frontend", color: "#3b82f6" },
];

export type CursorStop = { at: number; x: number; y: number; click?: boolean };

export const CURSOR_PATH: CursorStop[] = [
    { at: 0, x: 520, y: 540 },
    { at: 1300, x: 300, y: 142, click: true },
    { at: 3100, x: 320, y: 183, click: true },
    { at: AT.priorityOpen, x: 144, y: 425, click: true },
    { at: AT.priorityPick, x: 209, y: 312, click: true },
    { at: AT.membersOpen, x: 525, y: 425, click: true },
    { at: AT.membersPick, x: 555, y: 287, click: true },
    { at: AT.tagsOpen, x: 433, y: 425, click: true },
    { at: AT.tagsPick, x: 451, y: 317, click: true },
    { at: AT.figmaOpen, x: 633, y: 425, click: true },
    { at: AT.dateOpen, x: 712, y: 425, click: true },
    { at: AT.dateStart, x: calendarColumnX(2), y: 309, click: true },
    { at: AT.dateEnd, x: calendarColumnX(5), y: 309, click: true },
    { at: AT.create, x: 769, y: 470, click: true },
    { at: 14200, x: 700, y: 540 },
];

export function span(time: number, from: number, to: number) {
    return Math.min(1, Math.max(0, (time - from) / (to - from)));
}

export function typed(text: string, progress: number) {
    return text.slice(0, Math.round(text.length * progress));
}

export function isBetween(time: number, from: number, to: number) {
    return time >= from && time < to;
}
