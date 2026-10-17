"use client";

import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import PixelReveal from "@/components/new-landing/PixelReveal";
import { cn } from "@/lib/utils";

import ChapterFigure from "./ChapterFigure";
import FounderPortrait from "./FounderPortrait";
import { beatAt, TEAM_CHAPTERS, type TeamChapter } from "./teamChapters";

const CHAPTER_SCROLL_SVH = 320;
const STAGE_TOP_PX = 44;
const STAGE_TOP = `${STAGE_TOP_PX}px`;
const LAST_CHAPTER = TEAM_CHAPTERS.length - 1;
const SCENE_SHARE = 0.92;

const chapterNumber = (index: number) => String(index + 1).padStart(2, "0");

function PinnedChapter({ chapter, index }: { chapter: TeamChapter; index: number }) {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: [`start ${STAGE_TOP_PX}px`, "end end"],
    });
    const sceneProgress = useTransform(scrollYProgress, (share) =>
        Math.min(1, share / SCENE_SHARE),
    );
    const [beat, setBeat] = useState(0);
    const portraitOnRight = index % 2 === 1;

    useMotionValueEvent(sceneProgress, "change", (progress) => setBeat(beatAt(progress)));

    return (
        <section
            ref={sectionRef}
            aria-label={`${chapter.name}, ${chapter.role}`}
            className="relative border-b border-edge"
            style={{ height: `${CHAPTER_SCROLL_SVH}svh` }}
        >
            <div
                className={cn(
                    "sticky grid",
                    portraitOnRight
                        ? "grid-cols-[minmax(0,8fr)_minmax(0,4fr)]"
                        : "grid-cols-[minmax(0,4fr)_minmax(0,8fr)]",
                )}
                style={{ top: STAGE_TOP, height: `calc(100svh - ${STAGE_TOP})` }}
            >
                <div
                    className={cn(
                        "flex min-h-0 flex-col border-edge",
                        portraitOnRight ? "order-last border-l" : "border-r",
                    )}
                >
                    <FounderPortrait
                        name={chapter.name}
                        image={chapter.portrait}
                        sizes="(min-width: 1024px) 34vw, 100vw"
                        className="min-h-0 flex-1"
                    >
                        {" "}
                        <PixelReveal
                            cover="var(--color-ink)"
                            tileSize={64}
                            startMs={0}
                            spreadMs={300}
                            className="z-20"
                        />{" "}
                    </FounderPortrait>
                    <div className="border-t border-edge px-9 pt-7 pb-9">
                        <FadeIn className="flex items-center justify-between gap-4">
                            <h2 className="text-[30px] leading-none font-medium tracking-[-0.03em] text-foreground">
                                {chapter.name}
                            </h2>
                        </FadeIn>
                        <FadeIn delay={0.1} className="mt-4">
                            <p className="max-w-[46ch] text-[16px] leading-[1.6] tracking-[-0.005em] text-neutral-500">
                                {chapter.about}
                            </p>
                        </FadeIn>
                    </div>
                </div>

                <FadeIn delay={0.15} className="grid min-h-0">
                    <ChapterFigure
                        chapter={chapter}
                        index={index}
                        beat={beat}
                        sceneProgress={sceneProgress}
                        className="min-h-0"
                    />
                </FadeIn>
            </div>
        </section>
    );
}

function PinnedStory() {
    return (
        <div className="hidden bg-ink lg:block">
            {TEAM_CHAPTERS.map((chapter, index) => (
                <PinnedChapter key={chapter.key} chapter={chapter} index={index} />
            ))}
        </div>
    );
}

function StackedChapter({ chapter, index }: { chapter: TeamChapter; index: number }) {
    const figureRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: figureRef,
        offset: ["start 0.9", "end 0.45"],
    });
    const [beat, setBeat] = useState(0);

    useMotionValueEvent(scrollYProgress, "change", (progress) => setBeat(beatAt(progress)));

    return (
        <article className="border-b border-edge">
            <div className="flex items-center justify-between border-b border-edge px-6 py-5">
                <p className={MONO_LABEL}>
                    {chapterNumber(index)} / {chapterNumber(LAST_CHAPTER)}
                </p>
                <p className={MONO_LABEL}>{chapter.role}</p>
            </div>
            <FounderPortrait
                name={chapter.name}
                image={chapter.portrait}
                sizes="100vw"
                className="aspect-[4/5]"
            >
                {" "}
                <PixelReveal
                    cover="var(--color-ink)"
                    tileSize={64}
                    startMs={0}
                    spreadMs={300}
                    className="z-20"
                />{" "}
            </FounderPortrait>
            <div className="border-t border-edge px-6 pt-7 pb-10">
                <FadeIn className="flex items-center justify-between gap-4">
                    <h2 className="text-[28px] leading-none font-medium tracking-[-0.03em] text-foreground">
                        {chapter.name}
                    </h2>
                </FadeIn>
                <FadeIn delay={0.1} className="mt-4">
                    <p className="max-w-[46ch] text-[16px] leading-[1.6] tracking-[-0.005em] text-neutral-500">
                        {chapter.about}
                    </p>
                </FadeIn>
            </div>
            <div ref={figureRef} className="border-t border-edge">
                <ChapterFigure
                    chapter={chapter}
                    index={index}
                    beat={beat}
                    sceneProgress={scrollYProgress}
                    className="aspect-square"
                />
            </div>
        </article>
    );
}

export default function TeamStory() {
    return (
        <>
            <PinnedStory />
            <div className="bg-ink lg:hidden">
                {TEAM_CHAPTERS.map((chapter, index) => (
                    <StackedChapter key={chapter.key} chapter={chapter} index={index} />
                ))}
            </div>
        </>
    );
}
