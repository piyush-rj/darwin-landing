import { CtaArrowIcon } from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import PixelReveal from "@/components/new-landing/PixelReveal";
import { cn } from "@/lib/utils";

import HoverRevealPortrait from "./HoverRevealPortrait";
import { TEAM_CHAPTERS } from "./teamChapters";

export default function TeamRoster() {
    return (
        <ul className="grid w-full grid-cols-1 border-b border-edge bg-ink md:grid-cols-3">
            {TEAM_CHAPTERS.map((chapter, index) => (
                <li
                    key={chapter.key}
                    className="group flex flex-col border-edge not-last:max-md:border-b"
                >
                    <HoverRevealPortrait
                        reveal={chapter.portrait}
                        name={chapter.name}
                        image={chapter.boxedPortrait}
                        sizes="(min-width: 768px) 33vw, 100vw"
                        framing={chapter.rosterFraming}
                        captionLines={[`<${chapter.name.split(" ")[0]}>`, ...chapter.hoverLines]}
                        captionTone={chapter.tone}
                        className="aspect-[4/5]"
                    >
                        <PixelReveal
                            cover="var(--color-ink)"
                            tileSize={64}
                            startMs={40 + index * 80}
                            spreadMs={300}
                            className="z-20"
                        />
                        <a
                            href={`https://x.com/${chapter.xHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Connect with ${chapter.name} on X`}
                            className="group/connect absolute right-4 bottom-4 flex h-7 translate-y-1 items-center gap-1 bg-snow pr-1.5 pl-2.5 text-[12px] font-medium text-foreground opacity-0 transition-[opacity,translate] duration-300 group-hover/portrait:translate-y-0 group-hover/portrait:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
                        >
                            Connect
                            <CtaArrowIcon className="size-3 transition-transform group-hover/connect:translate-x-0.5" />
                        </a>
                    </HoverRevealPortrait>
                    <div className="border-t border-edge md:group-not-last:border-r">
                        <FadeIn
                            delay={0.2 + index * 0.12}
                            y={8}
                            className="flex items-baseline justify-between gap-4 px-5 py-5"
                        >
                            <span className="text-[17px] tracking-[-0.01em] text-foreground">
                                {chapter.name}
                            </span>
                            <span className={cn(MONO_LABEL, "text-right")}>{chapter.title}</span>
                        </FadeIn>
                    </div>
                </li>
            ))}
        </ul>
    );
}
