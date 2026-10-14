"use client";
import { type KeyboardEvent, useRef, useState } from "react";

import { CheckIcon } from "@/components/icons";
import QuestionCardHeader from "@/components/playground/Issue/QuestionCardHeader";
import { cn } from "@/lib/utils";

const MAX_NUMBERED_OPTIONS = 9;

export default function AgentQuestionCard({
    label,
    prompt,
    options,
    busy,
    onAnswer,
}: {
    label: string;
    prompt: string;
    options: string[];
    busy: boolean;
    onAnswer: (value: string) => void;
}) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [ownAnswer, setOwnAnswer] = useState("");
    const ownAnswerField = useRef<HTMLTextAreaElement>(null);

    const answer = selectedIndex !== null ? options[selectedIndex] : ownAnswer.trim();
    const canSend = Boolean(answer) && !busy;
    const ownAnswerActive = selectedIndex === null && ownAnswer.trim().length > 0;

    function send() {
        if (canSend && answer) onAnswer(answer);
    }

    function typeOwnAnswer(value: string) {
        setOwnAnswer(value);
        setSelectedIndex(null);
    }

    function chooseOwnAnswer() {
        setSelectedIndex(null);
        ownAnswerField.current?.focus();
    }

    function handleCardKeys(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
            return;
        }

        if (event.target instanceof HTMLTextAreaElement) return;
        const number = Number(event.key);
        if (!Number.isInteger(number) || number < 1) return;
        if (number <= options.length) {
            event.preventDefault();
            setSelectedIndex(number - 1);
        } else if (number === options.length + 1) {
            event.preventDefault();
            chooseOwnAnswer();
        }
    }

    return (
        <div onKeyDown={handleCardKeys} className="surface-card overflow-hidden rounded-[8px]">
            <div className="px-4 pt-3.5 pb-3">
                <QuestionCardHeader label={label} />
                <p className="text-[14px] leading-[1.6] font-medium whitespace-pre-wrap text-neutral-100">
                    {prompt}
                </p>
            </div>

            <div
                role={options.length > 0 ? "radiogroup" : undefined}
                aria-label={options.length > 0 ? label : undefined}
                className="flex flex-col border-t border-overlay/6"
            >
                {options.map((option, index) => {
                    const selected = selectedIndex === index;
                    return (
                        <button
                            key={`${index}-${option}`}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={busy}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                "group/option flex w-full cursor-pointer items-start gap-3 border-b border-overlay/6 px-4 py-2.5 text-left transition-colors duration-150 outline-none focus-visible:bg-overlay/5",
                                selected ? "bg-overlay/6" : "hover:bg-overlay/3",
                            )}
                        >
                            <OptionBadge
                                text={index < MAX_NUMBERED_OPTIONS ? String(index + 1) : "·"}
                                selected={selected}
                            />
                            <span
                                className={cn(
                                    "min-w-0 flex-1 text-[13px] leading-5 transition-colors",
                                    selected
                                        ? "text-neutral-100"
                                        : "text-neutral-300 group-hover/option:text-neutral-200",
                                )}
                            >
                                {option}
                            </span>
                            <span aria-hidden className="flex h-5 shrink-0 items-center">
                                <CheckIcon
                                    className={cn(
                                        "size-3.5 text-neutral-100 transition-opacity",
                                        selected ? "opacity-100" : "opacity-0",
                                    )}
                                />
                            </span>
                        </button>
                    );
                })}

                <div
                    onClick={chooseOwnAnswer}
                    className={cn(
                        "flex cursor-text items-start gap-3 px-4 py-2.5 transition-colors duration-150",
                        ownAnswerActive ? "bg-overlay/6" : "hover:bg-overlay/3",
                    )}
                >
                    {options.length > 0 && (
                        <OptionBadge
                            text={
                                options.length < MAX_NUMBERED_OPTIONS
                                    ? String(options.length + 1)
                                    : "·"
                            }
                            selected={ownAnswerActive}
                        />
                    )}
                    <textarea
                        ref={ownAnswerField}
                        rows={1}
                        value={ownAnswer}
                        disabled={busy}
                        aria-label="Your own answer"
                        placeholder={
                            options.length > 0 ? "Type your own answer…" : "Type your answer…"
                        }
                        onChange={(event) => typeOwnAnswer(event.target.value)}
                        className="field-sizing-content max-h-40 min-w-0 flex-1 resize-none bg-transparent text-[13px] leading-5 text-neutral-100 outline-none placeholder:text-neutral-500 disabled:opacity-60"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end border-t border-overlay/6 px-4 py-2.5">
                <button
                    type="button"
                    disabled={!canSend}
                    onClick={send}
                    className="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[8px] bg-overlay/8 px-3 text-[0.8rem] font-medium whitespace-nowrap text-overlay transition-all outline-none select-none hover:bg-overlay/12 focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                    {busy ? "Sending…" : "Send"}
                </button>
            </div>
        </div>
    );
}

function OptionBadge({ text, selected }: { text: string; selected: boolean }) {
    return (
        <span aria-hidden className="flex h-5 shrink-0 items-center">
            <span
                className={cn(
                    "flex size-[18px] items-center justify-center rounded-[5px] text-[11px] leading-none font-medium tabular-nums transition-colors",
                    selected ? "bg-overlay/15 text-neutral-100" : "bg-overlay/6 text-neutral-500",
                )}
            >
                {text}
            </span>
        </span>
    );
}
