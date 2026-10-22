"use client";

import * as m from "motion/react-m";
import Image from "next/image";

import { CheckIcon, GithubLogoIcon, PullRequestOpenIcon } from "@/components/icons";
import { DARWIN_LOGO_BRAND_COLOR, DarwinBlockLogo } from "@/components/logo/DarwinBlockLogo";
import { useLoopClock } from "@/components/new-landing/how-it-works-details/create-issue-demo/useLoopClock";
import { cn } from "@/lib/utils";

import { EASE, SceneCursor, SceneWindow } from "./sceneKit";

const WIDTH = 560;
const LOOP = 13400;
const STILL = 7000;

const AT = {
    proof: 900,
    comment: 3100,
    approve: 4300,
    merge: 6400,
    footer: 7100,
    fade: 12800,
};

const DIFF_BLOCKS = ["bg-green-500", "bg-green-500", "bg-green-500", "bg-red-500", "bg-edge"];

const CURSOR_PATH = [
    { at: 5300, x: 430, y: 168 },
    { at: AT.merge, x: 284, y: 252, click: true },
    { at: 7300, x: 284, y: 252 },
];

function Avatar({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "shrink-0 overflow-hidden rounded-sm border border-edge bg-white",
                className,
            )}
        >
            <Image
                src="/images/team/piyush.png"
                alt=""
                width={48}
                height={48}
                className="size-full scale-[1.3] object-cover object-[50%_40%]"
            />
        </span>
    );
}

export default function ReviewScene() {
    const { ref, time } = useLoopClock(LOOP, STILL);
    const live = time < AT.fade;
    const proofed = live && time >= AT.proof;
    const commented = live && time >= AT.comment;
    const approved = live && time >= AT.approve;
    const merged = live && time >= AT.merge + 180;
    const footed = live && time >= AT.footer;

    return (
        <div ref={ref}>
            <div>
                <SceneWindow
                    width={WIDTH}
                    title={
                        <>
                            <GithubLogoIcon className="size-4 text-foreground/70" />
                            <span className="text-neutral-500">acme/web</span>
                            <span className="text-neutral-300">/</span>
                            Pull requests
                        </>
                    }
                    status={<span>#910</span>}
                >
                    <div className="relative h-[332px]">
                        <div className="border-b border-edge px-4 pt-3.5 pb-3">
                            <div className="flex items-center gap-2">
                                <m.span
                                    key={String(merged)}
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, ease: EASE }}
                                    className={cn(
                                        "flex size-5 shrink-0 items-center justify-center rounded-sm text-white transition-colors duration-300",
                                        merged ? "bg-violet-500" : "bg-green-500",
                                    )}
                                >
                                    <PullRequestOpenIcon className="size-3" aria-hidden />
                                </m.span>
                                <span className="truncate text-[13.5px] font-medium text-foreground">
                                    fix(checkout): round after conversion
                                </span>
                                <span
                                    className={cn(
                                        "ml-auto rounded-sm px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.06em] uppercase transition-colors duration-300",
                                        merged
                                            ? "bg-violet-500/10 text-violet-600"
                                            : "bg-green-500/10 text-green-700",
                                    )}
                                >
                                    {merged ? "merged" : "open"}
                                </span>
                            </div>
                            <p className="mt-1.5 font-mono text-[10.5px] text-neutral-400">
                                darwin/noc-142 → main · opened by Darwin
                            </p>
                            <div className="mt-2 flex items-center gap-2 font-mono text-[10.5px]">
                                <span className="text-green-600">+12</span>
                                <span className="text-red-500">−4</span>
                                <span aria-hidden className="flex gap-0.5">
                                    {DIFF_BLOCKS.map((block, index) => (
                                        <span key={index} className={cn("size-1.5", block)} />
                                    ))}
                                </span>
                                <span className="text-neutral-400">· closes NOC-142</span>
                            </div>
                        </div>

                        <div className="flex h-10 items-center gap-2.5 border-b border-dashed border-edge px-4">
                            <m.span
                                initial={false}
                                animate={{
                                    scale: proofed ? 1 : 0.6,
                                    opacity: proofed ? 1 : 0,
                                }}
                                transition={{ duration: 0.3, ease: EASE }}
                                className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-green-500 text-white"
                            >
                                <CheckIcon className="size-3.5" aria-hidden />
                            </m.span>
                            <span className="text-[13px] text-foreground/85">Bug proof</span>
                            <m.span
                                initial={false}
                                animate={{ opacity: proofed ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-auto font-mono text-[10.5px] text-green-600"
                            >
                                fail → pass attached
                            </m.span>
                        </div>

                        <div className="flex h-10 items-center gap-2.5 px-4">
                            <Avatar className="size-5" />
                            <span className="text-[13px] text-foreground/85">
                                Review from Piyush
                            </span>
                            <span
                                className={cn(
                                    "ml-auto flex items-center gap-1 font-mono text-[10.5px] tracking-[0.06em] uppercase transition-colors duration-300",
                                    approved ? "text-green-600" : "text-amber-600",
                                )}
                            >
                                {approved && <CheckIcon className="size-3" aria-hidden />}
                                {approved ? "approved" : "requested"}
                            </span>
                        </div>

                        <div className="flex h-[44px] items-center px-4">
                            <m.div
                                initial={false}
                                animate={{
                                    opacity: commented ? 1 : 0,
                                    y: commented ? 0 : 8,
                                }}
                                transition={{ duration: 0.3, ease: EASE }}
                                className="flex items-center gap-2"
                            >
                                <Avatar className="size-5" />
                                <span className="rounded-md border border-edge bg-mist/60 px-2.5 py-1 text-[12px] text-foreground/85">
                                    Looks right. Proof checks out.
                                </span>
                            </m.div>
                        </div>

                        <div className="px-4 pt-1.5">
                            <m.div
                                initial={false}
                                animate={{ scale: merged ? [1, 0.97, 1] : 1 }}
                                transition={{ duration: 0.35, ease: EASE }}
                                className={cn(
                                    "flex h-10 items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors duration-300",
                                    merged
                                        ? "bg-green-600 text-white"
                                        : approved
                                          ? "bg-foreground text-snow"
                                          : "bg-mist text-neutral-400",
                                )}
                            >
                                {merged && <CheckIcon className="size-3.5" aria-hidden />}
                                {merged ? "Merged" : "Merge as yourself"}
                            </m.div>
                            <m.p
                                initial={false}
                                animate={{ opacity: footed ? 1 : 0 }}
                                transition={{ duration: 0.35 }}
                                className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500"
                            >
                                <DarwinBlockLogo
                                    className={cn("size-3.5", DARWIN_LOGO_BRAND_COLOR)}
                                />
                                Opened by Darwin
                                <span className="text-neutral-300">·</span>
                                <Avatar className="size-3.5" />
                                merged by Piyush
                            </m.p>
                        </div>

                        <SceneCursor time={time} path={CURSOR_PATH} />
                    </div>
                </SceneWindow>
            </div>
        </div>
    );
}
