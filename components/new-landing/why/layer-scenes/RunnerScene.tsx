"use client";

import * as m from "motion/react-m";
import Image from "next/image";

import { CheckIcon } from "@/components/icons";
import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { useLoopClock } from "@/components/new-landing/how-it-works-details/create-issue-demo/useLoopClock";
import { cn } from "@/lib/utils";

import { TerminalGlyph } from "../../PixelGlyphs";
import { EASE, isTyping, SceneCursor, SceneWindow, typed } from "./sceneKit";

const WIDTH = 560;
const LOOP = 13400;
const STILL = 7800;

const AT = {
    boot: 400,
    branch: 1000,
    test: 2300,
    failing: 3500,
    ask: 4400,
    pause: 5200,
    slack: 5600,
    pick: 7600,
    resume: 8700,
    passed: 10300,
    fade: 12800,
};

const BRANCH_CMD = "$ git switch -c darwin/noc-142";
const TEST_CMD = "$ bun run test checkout";

const CURSOR_PATH = [
    { at: 6700, x: 468, y: 64 },
    { at: AT.pick, x: 372, y: 136, click: true },
    { at: 8400, x: 372, y: 136 },
];

function TerminalLine({
    shown,
    className,
    children,
}: {
    shown: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <m.span
            initial={false}
            animate={{ opacity: shown ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className={cn("block h-[18px] truncate", className)}
        >
            {children}
        </m.span>
    );
}

export default function RunnerScene() {
    const { ref, time } = useLoopClock(LOOP, STILL);
    const live = time < AT.fade;
    const paused = time >= AT.pause && time < AT.resume;
    const picked = live && time >= AT.pick + 150;

    return (
        <div ref={ref}>
            <div>
                <SceneWindow
                    width={WIDTH}
                    title={
                        <>
                            <TerminalGlyph className="size-4 text-foreground/70" />
                            <span className="text-neutral-500">runner-04</span>
                            <span className="text-neutral-300">/</span>
                            darwin/noc-142
                        </>
                    }
                    status={
                        <span
                            className={cn(
                                "flex items-center gap-1.5 transition-colors duration-300",
                                paused ? "text-sky-600" : "text-green-600",
                            )}
                        >
                            <span
                                className={cn(
                                    "size-1.5 rounded-full",
                                    paused ? "bg-sky-500" : "animate-pulse bg-green-500",
                                )}
                            />
                            {paused ? "paused · costs nothing" : "running"}
                        </span>
                    }
                >
                    <div className="relative grid h-[300px] grid-cols-[1.3fr_1fr]">
                        <m.div
                            initial={false}
                            animate={{ opacity: paused ? 0.55 : 1 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col gap-1.5 bg-foreground p-3.5 font-mono text-[11.5px] leading-[18px]"
                        >
                            <TerminalLine shown={live && time >= AT.boot} className="text-white/45">
                                ▸ fresh sandbox — clone of acme/web
                            </TerminalLine>
                            <TerminalLine
                                shown={live && time >= AT.branch}
                                className="text-white/75"
                            >
                                {typed(BRANCH_CMD, time, AT.branch)}
                                {isTyping(BRANCH_CMD, time, AT.branch) && (
                                    <span className="animate-pulse text-white/60">▌</span>
                                )}
                            </TerminalLine>
                            <TerminalLine shown={live && time >= AT.test} className="text-white/75">
                                {typed(TEST_CMD, time, AT.test)}
                                {isTyping(TEST_CMD, time, AT.test) && (
                                    <span className="animate-pulse text-white/60">▌</span>
                                )}
                            </TerminalLine>
                            <TerminalLine
                                shown={live && time >= AT.failing}
                                className="text-red-400/90"
                            >
                                3 failing · totals mismatch
                            </TerminalLine>
                            <TerminalLine
                                shown={live && time >= AT.ask}
                                className="text-amber-400/90"
                            >
                                ? rounding unclear — asking in Slack…
                            </TerminalLine>
                            <TerminalLine
                                shown={live && time >= AT.resume}
                                className="text-white/75"
                            >
                                ▶ resumed — rounding: nearest cent
                            </TerminalLine>
                            <TerminalLine
                                shown={live && time >= AT.passed}
                                className="text-green-400"
                            >
                                ✓ 214 passed
                            </TerminalLine>
                        </m.div>

                        <div className="border-l border-edge">
                            <div className="flex h-9 items-center gap-2 border-b border-edge px-3">
                                <Image
                                    src="/images/integrations/slack.svg"
                                    alt=""
                                    width={14}
                                    height={14}
                                    className="scale-[1.6]"
                                />
                                <span className="text-[12px] text-foreground/80">#eng-bugs</span>
                            </div>
                            <m.div
                                initial={false}
                                animate={{
                                    opacity: live && time >= AT.slack ? 1 : 0,
                                    y: live && time >= AT.slack ? 0 : 10,
                                }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className="p-3"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="flex size-5 items-center justify-center rounded-sm bg-violet-100">
                                        <DarwinBlockLogo
                                            className={cn("size-4", DARWIN_LOGO_BRAND_COLOR)}
                                        />
                                    </span>
                                    <span className="text-[11.5px] font-medium text-foreground">
                                        Darwin
                                    </span>
                                    <span className="rounded-sm bg-mist px-1 text-[9px] text-neutral-500 uppercase">
                                        app
                                    </span>
                                </div>
                                <p className="mt-1.5 text-[12.5px] leading-snug text-foreground/85">
                                    Should totals round to the nearest cent?
                                </p>
                                <div className="mt-2 flex flex-col gap-1.5">
                                    <span
                                        className={cn(
                                            "flex h-7 items-center justify-center rounded-md border text-[11.5px] transition-colors duration-200",
                                            picked
                                                ? "border-foreground bg-foreground text-snow"
                                                : "border-edge text-foreground/80",
                                        )}
                                    >
                                        Nearest cent
                                    </span>
                                    <span className="flex h-7 items-center justify-center rounded-md border border-edge text-[11.5px] text-foreground/80">
                                        Banker&apos;s rounding
                                    </span>
                                </div>
                                <m.p
                                    initial={false}
                                    animate={{ opacity: picked ? 1 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-2 flex items-center gap-1 text-[10.5px] text-green-600"
                                >
                                    <CheckIcon className="size-3" aria-hidden />
                                    sent to the runner
                                </m.p>
                            </m.div>
                        </div>

                        <SceneCursor time={time} path={CURSOR_PATH} />
                    </div>
                </SceneWindow>
            </div>
        </div>
    );
}
