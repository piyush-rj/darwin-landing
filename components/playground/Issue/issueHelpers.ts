import {
    HighPriorityIcon,
    type IconType,
    LowPriorityIcon,
    MediumPriorityIcon,
    NoPriorityIcon,
    UrgentPriorityIcon,
} from "@/components/icons";

export type Priority = "none" | "urgent" | "high" | "medium" | "low";

export type PriorityOption = {
    value: Priority;
    label: string;
    icon: IconType;
    rank: number;
    iconClassName?: string;
};

export const PRIORITY_OPTIONS: PriorityOption[] = [
    { value: "none", label: "No priority", icon: NoPriorityIcon, rank: 0 },
    {
        value: "urgent",
        label: "Urgent",
        icon: UrgentPriorityIcon,
        rank: 1,
        iconClassName: "size-3.25! text-orange-500",
    },
    { value: "high", label: "High", icon: HighPriorityIcon, rank: 2 },
    { value: "medium", label: "Medium", icon: MediumPriorityIcon, rank: 3 },
    { value: "low", label: "Low", icon: LowPriorityIcon, rank: 4 },
];
