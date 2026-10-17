import type { CSSProperties } from "react";

import { CtaArrowIcon } from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import PixelReveal from "@/components/new-landing/PixelReveal";
import { cn } from "@/lib/utils";

import HoverRevealPortrait from "./HoverRevealPortrait";
import { TEAM_CHAPTERS, type TeamChapter } from "./teamChapters";

const CHAT_LEAD_MS = 350;
const CHAR_MS = 26;
const LINE_PAUSE_MS = 480;
const PAUSE_AFTER: Record<string, number> = { ",": 260, ".": 420, "?": 460, "!": 420 };

type ChatSegment = { text: string; startMs: number; typeMs: number };
type ChatLine = { text: string; segments: ChatSegment[]; endMs: number };

function splitAtPauses(line: string) {
    const segments: string[] = [];
    let depth = 0;
    let current = "";
    [...line].forEach((character, index) => {
        current += character;
        if (character === "(") depth++;
        if (character === ")") depth--;
        if (depth === 0 && PAUSE_AFTER[character] && line[index + 1] === " ") {
            segments.push(current + " ");
            current = "";
        } else if (character === " " && segments.length && current === " ") {
            current = "";
        }
    });
    if (current) segments.push(current);
    return segments;
}

function scheduleChat(lines: string[]): ChatLine[] {
    let cursor = CHAT_LEAD_MS;
    return lines.map((text) => {
        const segments = splitAtPauses(text).map((segment) => {
            const typed = { text: segment, startMs: cursor, typeMs: segment.length * CHAR_MS };
            const mark = segment.trimEnd().slice(-1);
            cursor += typed.typeMs + (segment.endsWith(" ") ? (PAUSE_AFTER[mark] ?? 0) : 0);
            return typed;
        });
        const endMs = cursor;
        cursor += LINE_PAUSE_MS;
        return { text, segments, endMs };
    });
}

function PortraitChat({ chapter }: { chapter: TeamChapter }) {
    const speaker = `<${chapter.name.split(" ")[0]}>`;
    const lines = scheduleChat([speaker, ...chapter.hoverLines]);
    const last = lines[lines.length - 1];

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-end">
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 backdrop-blur-[2px] transition-opacity duration-500 mask-t-from-45% mask-t-to-100% group-hover/portrait:opacity-100" />
            <ol className="relative flex flex-col items-start gap-1 p-4 font-pixel text-[13px] leading-snug text-white">
                {lines.map((line, index) => (
                    <li
                        key={line.text}
                        style={
                            {
                                "--line-delay": `${line.segments[0].startMs}ms`,
                                "--caret-delay": `${last.endMs}ms`,
                                color:
                                    index === 0
                                        ? `color-mix(in oklab, ${chapter.tone} 70%, var(--color-white))`
                                        : undefined,
                            } as CSSProperties
                        }
                        className="flex items-center bg-black/55 px-2 py-1 opacity-0 transition-opacity duration-0 group-hover/portrait:opacity-100 group-hover/portrait:delay-(--line-delay)"
                    >
                        {line.segments.map((segment) => (
                            <span
                                key={segment.startMs}
                                style={
                                    {
                                        "--type-chars": segment.text.length,
                                        "--type-ms": `${segment.typeMs}ms`,
                                        "--type-delay": `${segment.startMs}ms`,
                                    } as CSSProperties
                                }
                                className="block max-w-0 overflow-hidden whitespace-pre group-hover/portrait:max-w-[calc(var(--type-chars)*1ch)] group-hover/portrait:[transition:max-width_var(--type-ms)_steps(var(--type-chars),end)_var(--type-delay)]"
                            >
                                {segment.text}
                            </span>
                        ))}
                        {line === last && (
                            <span className="ml-px inline-block h-[0.15em] w-[1ch] self-end bg-current opacity-0 group-hover/portrait:animate-[caret-blink_1s_steps(1)_infinite] group-hover/portrait:[animation-delay:var(--caret-delay)]" />
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

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
                        className="aspect-[4/5]"
                    >
                        <PixelReveal
                            cover="var(--color-ink)"
                            tileSize={64}
                            startMs={40 + index * 80}
                            spreadMs={300}
                            className="z-20"
                        />
                        <PortraitChat chapter={chapter} />
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
