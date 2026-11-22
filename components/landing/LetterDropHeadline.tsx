import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const MAGIC_COLORS = [
    "var(--color-amber-500)",
    "var(--color-rose-500)",
    "var(--color-violet-500)",
    "var(--color-sky-500)",
    "var(--color-emerald-500)",
];

type HeadlineLine = { text: string; magic?: boolean };

export default function LetterDropHeadline({
    lines,
    className,
}: {
    lines: HeadlineLine[];
    className?: string;
}) {
    let letterIndex = 0;

    return (
        <h1 aria-label={lines.map((line) => line.text).join(" ")} className={className}>
            {lines.map((line) => (
                <span key={line.text} aria-hidden className="block">
                    {line.text.split(" ").map((word, wordIndex) => (
                        <span key={wordIndex} className="whitespace-nowrap">
                            {wordIndex > 0 && " "}
                            {Array.from(word).map((letter, index) => {
                                const order = letterIndex++;
                                const style = {
                                    animationDelay: `${90 + order * 16}ms`,
                                    "--letter-magic": MAGIC_COLORS[order % MAGIC_COLORS.length],
                                } as CSSProperties;
                                return (
                                    <span
                                        key={index}
                                        style={style}
                                        className={cn(
                                            "inline-block motion-reduce:animate-none",
                                            line.magic
                                                ? "animate-letter-drop-magic"
                                                : "animate-letter-drop",
                                        )}
                                    >
                                        {letter}
                                    </span>
                                );
                            })}
                        </span>
                    ))}
                </span>
            ))}
        </h1>
    );
}
