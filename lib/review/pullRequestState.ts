import {
    type IconType,
    MergeIcon,
    PullRequestClosedIcon,
    PullRequestOpenIcon,
} from "@/components/icons";

export const ReviewState = {
    Open: "open",
    Closed: "closed",
    Merged: "merged",
} as const;
export type ReviewState = (typeof ReviewState)[keyof typeof ReviewState];

export const PULL_REQUEST_STATE: Record<
    ReviewState,
    { icon: IconType; label: string; text: string; surface: string }
> = {
    open: {
        icon: PullRequestOpenIcon,
        label: "Open",
        text: "text-success",
        surface: "bg-success-surface",
    },
    merged: {
        icon: MergeIcon,
        label: "Merged",
        text: "text-[#9A9CF8]",
        surface: "bg-[#9A9CF8]/12",
    },
    closed: {
        icon: PullRequestClosedIcon,
        label: "Closed",
        text: "text-danger",
        surface: "bg-danger-surface",
    },
};
