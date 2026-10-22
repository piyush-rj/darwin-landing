import type { ComponentType } from "react";

import { HighPriorityIcon, LowPriorityIcon, MediumPriorityIcon } from "@/components/icons";

export const STORY_STAGES = [
    {
        statement: "Your team files issues faster than anyone can pick them up.",
        tone: "#8b5cf6",
    },
    {
        statement: "So they sit in To do, waiting for someone with a free afternoon.",
        tone: "#64748b",
    },
    {
        statement:
            "When someone finally does, the fix still bounces between Claude, the terminal and a reviewer.",
        tone: "#f43f5e",
    },
    {
        statement:
            "Darwin picks each one up the moment it lands and hands it back as a tested pull request.",
        tone: "#f59e0b",
    },
];

export type StoryIssue = {
    id: string;
    title: string;
    label: string;
    labelTone: string;
    priority: ComponentType<{ className?: string }>;
    waitedDays: number;
};

export const STORY_ISSUES: StoryIssue[] = [
    {
        id: "NOC-142",
        title: "Checkout total rounds wrong",
        label: "Bug",
        labelTone: "bg-red-500",
        priority: HighPriorityIcon,
        waitedDays: 41,
    },
    {
        id: "NOC-139",
        title: "Avatar 404s on Safari",
        label: "Bug",
        labelTone: "bg-red-500",
        priority: MediumPriorityIcon,
        waitedDays: 33,
    },
    {
        id: "NOC-137",
        title: "CSV export drops the last row",
        label: "Data",
        labelTone: "bg-sky-500",
        priority: HighPriorityIcon,
        waitedDays: 27,
    },
    {
        id: "NOC-133",
        title: "Retry button double-submits",
        label: "UI",
        labelTone: "bg-violet-500",
        priority: MediumPriorityIcon,
        waitedDays: 19,
    },
    {
        id: "NOC-128",
        title: "Tooltip clips on mobile",
        label: "UI",
        labelTone: "bg-violet-500",
        priority: LowPriorityIcon,
        waitedDays: 12,
    },
    {
        id: "NOC-121",
        title: "Dates render in UTC",
        label: "Data",
        labelTone: "bg-sky-500",
        priority: LowPriorityIcon,
        waitedDays: 8,
    },
];
