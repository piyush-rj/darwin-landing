export type HeroTone = "indigo" | "purple";

export const HERO_TONES: Record<
    HeroTone,
    { shades: string[]; accent: string; button: string; glow: string }
> = {
    indigo: {
        shades: [
            "bg-[color-mix(in_oklab,var(--color-indigo-500),var(--color-indigo-400))]",
            "bg-[color-mix(in_oklab,var(--color-indigo-400),var(--color-indigo-300))]",
            "bg-[color-mix(in_oklab,var(--color-indigo-300),var(--color-indigo-200))]",
            "bg-[color-mix(in_oklab,var(--color-indigo-200),var(--color-indigo-100))]",
        ],
        accent: "text-[color-mix(in_oklab,var(--color-indigo-500),var(--color-indigo-600))]",
        button: "border-[color-mix(in_oklab,var(--color-indigo-500),var(--color-indigo-600))] bg-[color-mix(in_oklab,var(--color-indigo-500),var(--color-indigo-600))] hover:border-indigo-600 hover:bg-indigo-600",
        glow: "bg-[radial-gradient(ellipse_75%_55%_at_50%_100%,color-mix(in_oklab,var(--color-indigo-500)_12%,transparent),transparent)]",
    },
    purple: {
        shades: [
            "bg-primary",
            "bg-[color-mix(in_oklab,var(--color-primary)_88%,var(--color-black))]",
            "bg-[color-mix(in_oklab,var(--color-primary)_76%,var(--color-black))]",
            "bg-[color-mix(in_oklab,var(--color-primary)_55%,var(--color-snow))]",
        ],
        accent: "text-primary",
        button: "border-primary bg-primary hover:border-[color-mix(in_oklab,var(--color-primary)_88%,var(--color-black))] hover:bg-[color-mix(in_oklab,var(--color-primary)_88%,var(--color-black))]",
        glow: "bg-[radial-gradient(ellipse_75%_55%_at_50%_100%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent)]",
    },
};
