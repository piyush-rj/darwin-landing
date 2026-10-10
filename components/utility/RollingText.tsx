"use client";

import { useAnimate, useInView, useReducedMotion } from "motion/react";
import { Fragment, useEffect } from "react";

const RISE_SECONDS = 1;
const ROW_GAP_SECONDS = 0.8;
const PUSH_SECONDS = 0.8;
const PACE_STEP_SECONDS = 0.005;
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const DESCENDER_LETTERS = new Set(["g", "j", "p", "q", "y"]);

function seededRandom(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let mixed = Math.imul(state ^ (state >>> 15), state | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
}

function rollsTwice(character: string, indexInLine: number) {
    return !DESCENDER_LETTERS.has(character) && (indexInLine % 5 === 0 || indexInLine % 8 === 0);
}

function groupWordsIntoRows(words: HTMLElement[]) {
    const rowsByTop = new Map<number, HTMLElement[]>();
    for (const word of words) {
        const rowWords = rowsByTop.get(word.offsetTop) ?? [];
        rowWords.push(word);
        rowsByTop.set(word.offsetTop, rowWords);
    }
    return [...rowsByTop.entries()]
        .sort(([topA], [topB]) => topA - topB)
        .map(([top, rowWords]) => ({ top, words: rowWords }));
}

function RisingCharacter({
    character,
    indexInLine,
    lineIndex,
}: {
    character: string;
    indexInLine: number;
    lineIndex: number;
}) {
    const doubled = rollsTwice(character, indexInLine);
    const pace = 1 + Math.floor(seededRandom(lineIndex * 7919 + indexInLine * 104729)() * 5);
    const hiddenOffset = doubled ? "200%" : "100%";

    return (
        <span
            data-rising-character
            data-pace={pace}
            data-hidden-offset={hiddenOffset}
            className="relative inline-block"
            style={{ transform: `translateY(${hiddenOffset})` }}
        >
            {doubled && <span className="absolute inset-x-0 bottom-full">{character}</span>}
            {character}
        </span>
    );
}

export default function RollingText({ text }: { text: string }) {
    const [scope, animate] = useAnimate<HTMLSpanElement>();
    const isInView = useInView(scope, { once: true, amount: 0.5 });
    const reduceMotion = useReducedMotion();
    const lines = text.split("\n");

    useEffect(() => {
        if (!isInView || !scope.current) return;

        const block = scope.current;
        const rows = groupWordsIntoRows([
            ...block.querySelectorAll<HTMLElement>("[data-rolling-word]"),
        ]);
        const blockHeight = block.offsetHeight;
        const offsetWhileRowIsLast = (rowIndex: number) =>
            rowIndex < rows.length - 1 ? blockHeight - rows[rowIndex + 1].top : 0;

        const pushOffsets = [offsetWhileRowIsLast(0)];
        const pushTimes = [0];
        rows.slice(1).forEach((_, index) => {
            const rowIndex = index + 1;
            const rowStart = rowIndex * ROW_GAP_SECONDS;
            if (rowStart > pushTimes[pushTimes.length - 1]) {
                pushOffsets.push(offsetWhileRowIsLast(rowIndex - 1));
                pushTimes.push(rowStart);
            }
            pushOffsets.push(offsetWhileRowIsLast(rowIndex));
            pushTimes.push(rowStart + PUSH_SECONDS);
        });

        const pushDuration = pushTimes[pushTimes.length - 1];
        if (pushDuration > 0) {
            animate(
                block,
                { y: pushOffsets },
                {
                    duration: pushDuration,
                    times: pushTimes.map((time) => time / pushDuration),
                    ease: EASE_IN_OUT,
                },
            );
        }

        rows.forEach((row, rowIndex) => {
            const rowStart = rowIndex * ROW_GAP_SECONDS;
            row.words
                .flatMap((word) => [
                    ...word.querySelectorAll<HTMLElement>("[data-rising-character]"),
                ])
                .forEach((character, indexInRow) => {
                    animate(
                        character,
                        { y: [character.dataset.hiddenOffset ?? "100%", "0%"] },
                        {
                            duration: RISE_SECONDS,
                            delay:
                                rowStart +
                                indexInRow * Number(character.dataset.pace) * PACE_STEP_SECONDS,
                            ease: EASE_IN_OUT,
                        },
                    );
                });
        });
    }, [isInView, animate, scope]);

    if (reduceMotion) {
        return lines.map((line, lineIndex) => (
            <span key={lineIndex} className="block">
                {line}
            </span>
        ));
    }

    return (
        <span ref={scope} className="relative block">
            <span className="sr-only">{lines.join(" ")}</span>
            <span aria-hidden>
                {lines.map((line, lineIndex) => {
                    let indexInLine = 0;
                    return (
                        <span key={lineIndex} className="block">
                            {line.split(" ").map((word, wordIndex) => (
                                <Fragment key={wordIndex}>
                                    {wordIndex > 0 && " "}
                                    <span
                                        data-rolling-word
                                        className="my-[-0.12em] inline-block overflow-y-clip py-[0.12em] align-top whitespace-nowrap"
                                    >
                                        {[...word].map((character) => {
                                            const index = indexInLine++;
                                            return (
                                                <RisingCharacter
                                                    key={index}
                                                    character={character}
                                                    indexInLine={index}
                                                    lineIndex={lineIndex}
                                                />
                                            );
                                        })}
                                    </span>
                                </Fragment>
                            ))}
                        </span>
                    );
                })}
            </span>
        </span>
    );
}
