"use client";

import * as m from "motion/react-m";

import { CheckIcon, MobileNavCloseIcon } from "@/components/icons";
import { useLoopClock } from "@/components/new-landing/how-it-works-details/create-issue-demo/useLoopClock";
import { cn } from "@/lib/utils";

import { ProofGlyph } from "../../PixelGlyphs";
import { EASE, isTyping, SceneWindow, typed } from "./sceneKit";

const WIDTH = 560;
const LOOP = 12000;
const STILL = 7400;

const AT = {
    file: 500,
    line1: 900,
    line2: 2000,
    line3: 2950,
    oldRun: 3700,
    oldFail: 5100,
    fixRun: 5900,
    fixPass: 7300,
    stamp: 8500,
    fade: 11400,
};

const CODE_LINES = [
    { text: 'test("rounds to the nearest cent", () => {', start: AT.line1 },
    { text: "    expect(total(9.994)).toBe(9.99);", start: AT.line2 },
    { text: "});", start: AT.line3 },
];

type RunState = "idle" | "running" | "done";

function runState(time: number, runAt: number, doneAt: number): RunState {
    if (time >= doneAt) return "done";
    if (time >= runAt) return "running";
    return "idle";
}

function RunRow({
    label,
    sub,
    state,
    failed,
    verdict,
    className,
}: {
    label: string;
    sub: string;
    state: RunState;
    failed: boolean;
    verdict: string;
    className?: string;
}) {
    return (
        <div className={cn("flex h-[52px] items-center gap-3 px-3.5", className)}>
            {state === "done" ? (
                <m.span
                    key="done"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-sm text-white",
                        failed ? "bg-red-500" : "bg-green-500",
                    )}
                >
                    {failed ? (
                        <MobileNavCloseIcon className="size-3" aria-hidden />
                    ) : (
                        <CheckIcon className="size-3.5" aria-hidden />
                    )}
                </m.span>
            ) : (
                <span
                    className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-sm border border-edge",
                        state === "running" && "animate-pulse",
                    )}
                >
                    <span className="size-1.5 bg-neutral-300" />
                </span>
            )}
            <span className="flex min-w-0 flex-col">
                <span className="text-[13px] leading-tight text-foreground">{label}</span>
                <span className="truncate font-mono text-[10px] leading-tight text-neutral-400">
                    {sub}
                </span>
            </span>
            <span
                className={cn(
                    "ml-auto font-mono text-[11px] whitespace-nowrap transition-colors duration-300",
                    state === "done"
                        ? failed
                            ? "text-red-500"
                            : "text-green-600"
                        : "text-neutral-400",
                )}
            >
                {state === "done" ? verdict : state === "running" ? "running…" : "queued"}
            </span>
        </div>
    );
}

export default function ProofScene() {
    const { ref, time } = useLoopClock(LOOP, STILL);
    const live = time < AT.fade;
    const oldState = live ? runState(time, AT.oldRun, AT.oldFail) : "idle";
    const fixState = live ? runState(time, AT.fixRun, AT.fixPass) : "idle";

    return (
        <div ref={ref}>
            <div>
                <SceneWindow
                    width={WIDTH}
                    title={
                        <>
                            <ProofGlyph className="size-4 text-foreground/70" />
                            <span className="text-neutral-500">bug proof</span>
                            <span className="text-neutral-300">/</span>
                            NOC-142
                        </>
                    }
                    status={
                        <span
                            className={cn(
                                "transition-colors duration-300",
                                live && time >= AT.stamp ? "text-green-600" : "text-neutral-500",
                            )}
                        >
                            {!live
                                ? "step 1 / 3"
                                : time >= AT.stamp
                                  ? "proof complete"
                                  : time >= AT.fixRun
                                    ? "step 3 / 3"
                                    : time >= AT.oldRun
                                      ? "step 2 / 3"
                                      : "step 1 / 3"}
                        </span>
                    }
                >
                    <div className="relative flex h-[316px] flex-col gap-3 p-4">
                        <m.div
                            initial={false}
                            animate={{
                                opacity: live && time >= AT.file ? 1 : 0,
                                y: live && time >= AT.file ? 0 : 10,
                            }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="overflow-hidden rounded-md border border-edge"
                        >
                            <div className="flex h-7 items-center border-b border-edge bg-mist/60 px-3">
                                <span className="font-mono text-[10.5px] text-neutral-500">
                                    checkout.proof.test.ts
                                </span>
                                <span className="ml-auto rounded-sm bg-green-500/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.06em] text-green-700 uppercase">
                                    new test
                                </span>
                            </div>
                            <div className="border-l-2 border-green-500/60 bg-green-500/6 py-1.5">
                                {CODE_LINES.map((line) => (
                                    <div
                                        key={line.text}
                                        className="flex h-[19px] items-center gap-2 px-3 font-mono text-[11.5px] text-foreground/80"
                                    >
                                        <span className="text-green-600">+</span>
                                        <span className="truncate">
                                            {live ? typed(line.text, time, line.start, 16) : ""}
                                            {live && isTyping(line.text, time, line.start, 16) && (
                                                <span className="animate-pulse text-neutral-400">
                                                    ▌
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </m.div>

                        <div className="overflow-hidden rounded-md border border-edge">
                            <RunRow
                                label="On the old code"
                                sub="main — before the fix"
                                state={oldState}
                                failed
                                verdict="fail · got 10.00"
                                className="border-b border-dashed border-edge"
                            />
                            <RunRow
                                label="On Darwin's fix"
                                sub="darwin/noc-142"
                                state={fixState}
                                failed={false}
                                verdict="pass · 214 tests"
                            />
                        </div>

                        <m.div
                            initial={false}
                            animate={{
                                opacity: live && time >= AT.stamp ? 1 : 0,
                                scale: live && time >= AT.stamp ? 1 : 1.35,
                                rotate: -6,
                            }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="absolute right-6 bottom-5 rounded-md border-[2.5px] border-green-600/70 px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.08em] text-green-700 uppercase"
                        >
                            Proof attached · PR #910
                        </m.div>
                    </div>
                </SceneWindow>
            </div>
        </div>
    );
}
