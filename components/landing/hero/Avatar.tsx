import { cn } from "@/lib/utils";

const PERSON_TONES = {
    amber: "bg-amber-100 text-amber-800",
    sky: "bg-sky-100 text-sky-800",
    rose: "bg-rose-100 text-rose-800",
};

export function DarwinAvatar({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "inline-grid shrink-0 place-items-center rounded-full bg-stone-950 font-editorial text-paper",
                className,
            )}
        >
            D
        </span>
    );
}

export function PersonAvatar({
    initials,
    tone,
    className,
}: {
    initials: string;
    tone: keyof typeof PERSON_TONES;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-grid shrink-0 place-items-center rounded-full font-medium",
                PERSON_TONES[tone],
                className,
            )}
        >
            {initials}
        </span>
    );
}
