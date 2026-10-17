"use client";

import type { MotionValue } from "motion/react";
import type { CSSProperties } from "react";

import { MONO_LABEL } from "@/components/new-landing/landingType";
import HairlineFigure from "@/components/utility/HairlineFigure";
import RollingSwap from "@/components/utility/RollingSwap";
import { cn } from "@/lib/utils";

import type { TeamChapter } from "./teamChapters";

export default function ChapterFigure({
    chapter,
    index,
    beat,
    sceneProgress,
    className,
}: {
    chapter: TeamChapter;
    index: number;
    beat: number;
    sceneProgress: MotionValue<number>;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative flex items-center justify-center [container-type:size]",
                className,
            )}
            style={{ "--chapter-tone": chapter.tone } as CSSProperties}
        >
            <p className={cn(MONO_LABEL, "absolute top-5 left-5 md:top-6 md:left-6")}>
                Fig. 0{index + 1}
            </p>
            <p className={cn(MONO_LABEL, "absolute top-5 right-5 md:top-6 md:right-6")}>
                {chapter.figureTitle}
            </p>
            <HairlineFigure
                figure={chapter.figure}
                value={sceneProgress}
                label={chapter.figureLabel}
                className="w-[min(100cqw-3rem,(100cqh-7rem)*1.25)] [--color-primary:var(--chapter-tone)]"
            />
            <p
                aria-live="polite"
                className="absolute bottom-5 left-5 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.12em] text-foreground uppercase md:bottom-6 md:left-6"
            >
                <span aria-hidden className="size-1.5 bg-(--chapter-tone)" />
                <RollingSwap text={chapter.beats[beat].readout} />
            </p>
            <p className={cn(MONO_LABEL, "absolute right-5 bottom-5 md:right-6 md:bottom-6")}>
                {beat + 1} / {chapter.beats.length}
            </p>
        </div>
    );
}
