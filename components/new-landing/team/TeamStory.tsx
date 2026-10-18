import Image from "next/image";
import type { CSSProperties } from "react";

import { HARD_SHADOW } from "@/components/new-landing/boxStyles";
import FadeIn from "@/components/new-landing/FadeIn";
import { seededRandom } from "@/lib/seededRandom";
import { cn } from "@/lib/utils";

import { TEAM_CHAPTERS, type TeamChapter } from "./teamChapters";

const MOSAIC_COLUMNS = 8;
const MOSAIC_ROWS = 5;
const TILE_SHADES = [
    [0.78, 0.17],
    [0.86, 0.14],
    [0.72, 0.19],
    [0.75, 0.18],
    [0.82, 0.16],
].map(([lightness, chroma]) => `oklch(from var(--tone) ${lightness} ${chroma} h)`);
const INSET_SHADOW = [
    "0 -1px 0 oklch(from var(--tone) 0.34 0.13 h / 0.85)",
    "-1px 0 0 oklch(from var(--tone) 0.34 0.13 h / 0.45)",
    "0 1px 0 oklch(from var(--tone) 0.95 0.04 h / 0.7)",
].join(", ");

function mosaicShades(seed: number) {
    const random = seededRandom(seed);
    return Array.from(
        { length: MOSAIC_COLUMNS * MOSAIC_ROWS },
        () => TILE_SHADES[Math.floor(random() * TILE_SHADES.length)],
    );
}

function FounderHead({ chapter }: { chapter: TeamChapter }) {
    return <Image src={chapter.head} alt="" sizes="112px" className="size-14 shrink-0" />;
}

function FounderCard({ chapter, index }: { chapter: TeamChapter; index: number }) {
    return (
        <div
            style={{ "--tone": chapter.tone } as CSSProperties}
            className={cn("relative aspect-[8/5] w-full overflow-hidden", HARD_SHADOW)}
        >
            <div
                aria-hidden
                className="absolute inset-0 grid"
                style={{ gridTemplateColumns: `repeat(${MOSAIC_COLUMNS}, 1fr)` }}
            >
                {mosaicShades(index + 1).map((shade, tile) => (
                    <span key={tile} style={{ background: shade }} />
                ))}
            </div>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-[4%] border border-snow/35"
            />
            <div
                className="absolute top-[10%] left-[7%] font-pixel leading-none text-snow uppercase"
                style={{ textShadow: INSET_SHADOW }}
            >
                <p className="text-[7px] tracking-[0.12em]">The founding team of</p>
                <p className="mt-1 text-[22px] tracking-[0.06em]">Darwin</p>
            </div>
            <div
                className="absolute right-[7%] bottom-[10%] text-right font-pixel leading-none text-snow uppercase"
                style={{ textShadow: INSET_SHADOW }}
            >
                <p className="text-[8px] tracking-[0.1em]">{chapter.role}</p>
                <p className="mt-1.5 text-[24px] tracking-[0.06em]">{chapter.name.split(" ")[0]}</p>
            </div>
        </div>
    );
}

export default function TeamStory() {
    return (
        <div className="bg-ink">
            {TEAM_CHAPTERS.map((chapter, index) => (
                <section
                    key={chapter.key}
                    aria-label={`${chapter.name}, ${chapter.role}`}
                    className="grid grid-cols-1 border-b border-edge lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]"
                >
                    <div className="px-6 py-14 md:px-9 lg:py-20">
                        <FadeIn y={8} className="flex items-center gap-4">
                            <FounderHead chapter={chapter} />
                            <h2 className="text-[30px] leading-none font-medium tracking-[-0.03em] text-foreground">
                                {chapter.name}
                            </h2>
                        </FadeIn>
                        <FadeIn delay={0.1} y={8} className="mt-6">
                            <p className="max-w-[44ch] text-[22px] leading-[1.4] tracking-[-0.015em] text-foreground lg:text-[26px]">
                                {chapter.about}
                            </p>
                        </FadeIn>
                    </div>
                    <div className="flex items-center border-edge bg-mist px-6 py-10 max-lg:border-t md:px-9 lg:border-l lg:py-20">
                        <FadeIn delay={0.15} y={12} className="w-full">
                            <FounderCard chapter={chapter} index={index} />
                        </FadeIn>
                    </div>
                </section>
            ))}
        </div>
    );
}
