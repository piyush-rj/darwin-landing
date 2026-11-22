"use client";

import * as m from "motion/react-m";
import { useRef } from "react";

import { DoneStatusIcon, FailedStatusIcon, PullRequestOpenIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { DarwinAvatar } from "./Avatar";
import { useLoopClock } from "./useLoopClock";

const CHECKS = [
    { name: "Typecheck", detail: "tsc --noEmit" },
    { name: "Lint", detail: "eslint ." },
    { name: "Unit tests", detail: "214 passed" },
    { name: "Build", detail: "next build" },
];

const ATTEMPTS = [false, false, true, false, false];

const CHECK_START = 900;
const CHECK_GAP = 750;
const CHECKS_PASSED = CHECK_START + CHECKS.length * CHECK_GAP;
const LOOP = 8000;
const MOMENTS = [0, ...CHECKS.map((_, index) => CHECK_START + (index + 1) * CHECK_GAP)];
const EASE = [0.22, 1, 0.36, 1] as const;

function CheckRow({ name, detail, passed }: { name: string; detail: string; passed: boolean }) {
    return (
        <div className="flex h-9 items-center gap-2.5 border-t border-stone-900/[0.05] px-3.5 text-[12px]">
            {passed ? (
                <DoneStatusIcon className="size-3.5 shrink-0 text-emerald-600" />
            ) : (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-amber-200 border-t-amber-500" />
            )}
            <span className="text-stone-800">{name}</span>
            <span className="truncate font-mono text-[10.5px] text-stone-400">{detail}</span>
            <span
                className={cn(
                    "ml-auto text-[11px] transition-colors",
                    passed ? "text-stone-400" : "text-amber-600",
                )}
            >
                {passed ? "Passed" : "Running"}
            </span>
        </div>
    );
}

export default function PullRequestWindow() {
    const windowRef = useRef<HTMLDivElement>(null);
    const time = useLoopClock(windowRef, MOMENTS, LOOP, CHECKS_PASSED);
    const passedCount = Math.max(0, Math.floor((time - CHECK_START) / CHECK_GAP));
    const allPassed = passedCount >= CHECKS.length;

    return (
        <div
            ref={windowRef}
            className="flex h-full flex-col overflow-hidden rounded-[8px] bg-snow p-5 shadow-sm ring-1 ring-stone-900/[0.06]"
        >
            <p className="text-[15px] font-medium tracking-[-0.015em] text-stone-900">
                Return early if the cart is empty
                <span className="ml-1.5 font-normal text-stone-400">#318</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11.5px] text-stone-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 font-medium text-snow">
                    <PullRequestOpenIcon className="size-3" />
                    Open
                </span>
                <span className="truncate">
                    <span className="font-medium text-stone-700">darwin</span> wants to merge 1
                    commit into <span className="font-mono text-[10.5px]">main</span>
                </span>
            </div>

            <div className="mt-4 flex gap-3">
                <DarwinAvatar className="size-6 text-[12px]" />
                <div className="min-w-0 flex-1 rounded-[8px] border border-stone-900/[0.07]">
                    <p className="border-b border-stone-900/[0.05] bg-stone-50/70 px-3.5 py-2 text-[11.5px] text-stone-500">
                        <span className="font-medium text-stone-800">darwin</span> fixed WEB-142
                    </p>
                    <div className="px-3.5 py-3 text-[12.5px] leading-[1.5] text-stone-700">
                        I tried five fixes. Four broke existing tests, so I dropped them. This one
                        passes everything.
                        <div className="mt-2.5 flex items-center gap-1.5">
                            {ATTEMPTS.map((survived, index) =>
                                survived ? (
                                    <DoneStatusIcon
                                        key={index}
                                        className="size-4 text-emerald-600"
                                    />
                                ) : (
                                    <FailedStatusIcon
                                        key={index}
                                        className="size-4 text-stone-300"
                                    />
                                ),
                            )}
                            <span className="ml-1 text-[11px] text-stone-400">
                                1 of 5 survived your tests
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 ml-9 overflow-hidden rounded-[8px] border border-stone-900/[0.07]">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px]">
                    <span
                        className={cn(
                            "grid size-5 place-items-center rounded-full transition-colors duration-500",
                            allPassed ? "bg-emerald-600 text-snow" : "bg-amber-100 text-amber-600",
                        )}
                    >
                        <DoneStatusIcon className="size-3" />
                    </span>
                    <span className="font-medium text-stone-900">
                        {allPassed ? "All checks have passed" : "Checks are running"}
                    </span>
                    <span className="ml-auto text-[11px] text-stone-400">
                        {Math.min(passedCount, CHECKS.length)} of {CHECKS.length}
                    </span>
                </div>
                {CHECKS.map((check, index) => (
                    <CheckRow key={check.name} {...check} passed={index < passedCount} />
                ))}
                <div className="flex items-center gap-3 border-t border-stone-900/[0.05] bg-stone-50/70 px-3.5 py-2.5">
                    <m.span
                        initial={false}
                        animate={{ opacity: allPassed ? 1 : 0.45 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="rounded-[6px] bg-emerald-600 px-3 py-1.5 text-[11.5px] font-medium text-snow"
                    >
                        Merge pull request
                    </m.span>
                    <span className="text-[11px] text-stone-400">Closes WEB-142</span>
                </div>
            </div>
        </div>
    );
}
