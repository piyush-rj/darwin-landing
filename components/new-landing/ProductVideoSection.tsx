"use client";

import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    VideoExitFullscreenIcon,
    VideoFullscreenIcon,
    VideoMutedIcon,
    VideoPauseIcon,
    VideoPlayIcon,
    VideoSoundIcon,
} from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import { cn } from "@/lib/utils";

import { HARD_SHADOW } from "./boxStyles";
import VideoBackdrop from "./VideoBackdrop";

const VIDEO_SECONDS = 56;
const SEEK_STEP_SECONDS = 5;
const PREVIEW_WIDTH_PX = 224;
const CONTROLS_IDLE_MS = 2200;

const CHAPTERS = [
    { title: "The backlog", start: 0, preview: "/video/chapters/01.jpg" },
    { title: "Issue filed", start: 5, preview: "/video/chapters/02.jpg" },
    { title: "Fixed in a runner", start: 14, preview: "/video/chapters/03.jpg" },
    { title: "Pull request", start: 24, preview: "/video/chapters/04.jpg" },
    { title: "Visual check", start: 32, preview: "/video/chapters/05.jpg" },
    { title: "Merged", start: 42, preview: "/video/chapters/06.jpg" },
];

type HoverPreview = { seconds: number; left: number };

function clock(seconds: number) {
    const whole = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function chapterAt(seconds: number) {
    return CHAPTERS.reduce(
        (current, chapter, index) => (seconds >= chapter.start ? index : current),
        0,
    );
}

const chapterNumber = (index: number) => String(index + 1).padStart(2, "0");

function ControlButton({
    label,
    onClick,
    className,
    children,
}: {
    label: string;
    onClick: () => void;
    className?: string;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cn(
                "flex size-12 shrink-0 cursor-pointer items-center justify-center border-edge text-foreground transition-colors hover:bg-mist focus-visible:bg-mist focus-visible:outline-none",
                className,
            )}
        >
            {children}
        </button>
    );
}

export default function ProductVideoSection() {
    const frameRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const userPausedRef = useRef(false);
    const inView = useInView(frameRef, { amount: 0.5 });
    const reduceMotion = useReducedMotion();
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(VIDEO_SECONDS);
    const [hover, setHover] = useState<HoverPreview | null>(null);
    const [idle, setIdle] = useState(false);
    const idleTimerRef = useRef(0);
    const trackRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || reduceMotion) return;
        if (inView && !userPausedRef.current) video.play().catch(() => {});
        if (!inView) video.pause();
    }, [inView, reduceMotion]);

    useEffect(() => {
        const sync = () => {
            window.clearTimeout(idleTimerRef.current);
            setIdle(false);
            const entered = document.fullscreenElement === frameRef.current;
            setFullscreen(entered);
            if (entered) {
                idleTimerRef.current = window.setTimeout(() => {
                    if (!videoRef.current?.paused) setIdle(true);
                }, CONTROLS_IDLE_MS);
            }
        };
        document.addEventListener("fullscreenchange", sync);
        return () => {
            window.clearTimeout(idleTimerRef.current);
            document.removeEventListener("fullscreenchange", sync);
        };
    }, []);

    function wakeControls() {
        window.clearTimeout(idleTimerRef.current);
        setIdle(false);
        if (!document.fullscreenElement) return;
        idleTimerRef.current = window.setTimeout(() => {
            if (!videoRef.current?.paused) setIdle(true);
        }, CONTROLS_IDLE_MS);
    }

    function togglePlay() {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            userPausedRef.current = false;
            video.play().catch(() => {});
        } else {
            userPausedRef.current = true;
            video.pause();
        }
        wakeControls();
    }

    function toggleMute() {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    }

    function toggleFullscreen() {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else frameRef.current?.requestFullscreen().catch(() => {});
    }

    function seek(seconds: number) {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.min(Math.max(seconds, 0), duration);
        setCurrentTime(video.currentTime);
        if (video.paused) {
            userPausedRef.current = false;
            video.play().catch(() => {});
        }
    }

    function pointerOnTrack(event: PointerEvent<HTMLDivElement>) {
        const area = event.currentTarget.getBoundingClientRect();
        const track = (trackRef.current ?? event.currentTarget).getBoundingClientRect();
        const share = Math.min(Math.max((event.clientX - track.left) / track.width, 0), 1);
        return { seconds: share * duration, left: event.clientX - area.left, width: area.width };
    }

    function previewAtPointer(event: PointerEvent<HTMLDivElement>) {
        if (event.pointerType === "touch") return;
        const { seconds, left, width } = pointerOnTrack(event);
        const half = PREVIEW_WIDTH_PX / 2;
        setHover({ seconds, left: Math.min(Math.max(left, half), width - half) });
    }

    function seekFromKeys(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "ArrowRight") seek(currentTime + SEEK_STEP_SECONDS);
        else if (event.key === "ArrowLeft") seek(currentTime - SEEK_STEP_SECONDS);
        else return;
        event.preventDefault();
    }

    const started = playing || currentTime > 0;
    const hoverChapter = hover ? chapterAt(hover.seconds) : 0;

    return (
        <section id="see-it-run" className="w-full border-b border-edge bg-ink">
            <div className="relative isolate px-4 py-10 md:px-9 md:py-20">
                <VideoBackdrop className="-z-10" />
                <FadeIn y={24} className="mx-auto max-w-[1120px]">
                    <div className="bg-white/50 p-1.5 shadow-[0_28px_70px_-28px_rgba(24,18,48,0.35)]">
                        <div
                            ref={frameRef}
                            onPointerMove={wakeControls}
                            onPointerDown={wakeControls}
                            className={cn(
                                "flex flex-col border border-edge bg-snow shadow-[0_5px_0_rgba(10,10,12,0.22)]",
                                fullscreen && "relative border-0 bg-black",
                                fullscreen && idle && "cursor-none",
                            )}
                        >
                            <div className={cn("relative bg-ink", fullscreen && "h-full bg-black")}>
                                <video
                                    ref={videoRef}
                                    className={cn(
                                        "block aspect-video w-full",
                                        fullscreen && "aspect-auto h-full object-contain",
                                    )}
                                    poster="/video/darwin-e2e-poster.jpg"
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-label="Darwin picking up an issue, fixing it in a runner and opening a pull request that gets reviewed and merged"
                                    onPlay={() => setPlaying(true)}
                                    onPause={() => setPlaying(false)}
                                    onTimeUpdate={(event) =>
                                        setCurrentTime(event.currentTarget.currentTime)
                                    }
                                    onLoadedMetadata={(event) =>
                                        setDuration(event.currentTarget.duration || VIDEO_SECONDS)
                                    }
                                    onClick={togglePlay}
                                >
                                    <source src="/video/darwin-e2e.mp4" type="video/mp4" />
                                </video>
                                {!started && (
                                    <button
                                        type="button"
                                        onClick={togglePlay}
                                        aria-label="Play video"
                                        className="group absolute inset-0 flex cursor-pointer items-center justify-center"
                                    >
                                        <span
                                            className={cn(
                                                "flex items-center gap-3 bg-foreground py-3.5 pr-5 pl-4 text-[15px] font-medium text-snow transition-transform group-hover:-translate-y-0.5",
                                                HARD_SHADOW,
                                            )}
                                        >
                                            <VideoPlayIcon className="size-5" />
                                            Watch the run · {clock(duration)}
                                        </span>
                                    </button>
                                )}
                            </div>

                            <div
                                className={cn(
                                    "flex items-stretch border-t border-edge bg-snow",
                                    fullscreen &&
                                        "absolute inset-x-0 bottom-0 transition-[opacity,translate] duration-300",
                                    fullscreen &&
                                        idle &&
                                        "pointer-events-none translate-y-full opacity-0",
                                )}
                            >
                                <ControlButton
                                    label={playing ? "Pause" : "Play"}
                                    onClick={togglePlay}
                                    className="border-r"
                                >
                                    {playing ? (
                                        <VideoPauseIcon className="size-5" />
                                    ) : (
                                        <VideoPlayIcon className="size-5" />
                                    )}
                                </ControlButton>

                                <div
                                    role="slider"
                                    tabIndex={0}
                                    aria-label="Seek"
                                    aria-valuemin={0}
                                    aria-valuemax={Math.round(duration)}
                                    aria-valuenow={Math.round(currentTime)}
                                    aria-valuetext={`${clock(currentTime)} of ${clock(duration)}`}
                                    onPointerDown={(event) => seek(pointerOnTrack(event).seconds)}
                                    onPointerMove={previewAtPointer}
                                    onPointerLeave={() => setHover(null)}
                                    onKeyDown={seekFromKeys}
                                    className="relative flex min-w-0 flex-1 cursor-pointer items-center px-4 focus-visible:bg-mist focus-visible:outline-none"
                                >
                                    <span
                                        ref={trackRef}
                                        className="relative block h-2.5 w-full border border-edge bg-mist"
                                    >
                                        <span
                                            className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-300 ease-linear"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        />
                                        {CHAPTERS.slice(1).map((chapter) => (
                                            <span
                                                key={chapter.start}
                                                aria-hidden
                                                className="absolute -inset-y-1 w-0.5 bg-snow"
                                                style={{
                                                    left: `${(chapter.start / duration) * 100}%`,
                                                }}
                                            />
                                        ))}
                                        {hover && (
                                            <span
                                                aria-hidden
                                                className="absolute -inset-y-1 w-0.5 bg-foreground"
                                                style={{
                                                    left: `${(hover.seconds / duration) * 100}%`,
                                                }}
                                            />
                                        )}
                                    </span>

                                    {hover && (
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "pointer-events-none absolute bottom-full z-10 mb-3 flex -translate-x-1/2 flex-col border border-edge bg-snow",
                                                HARD_SHADOW,
                                            )}
                                            style={{ left: hover.left, width: PREVIEW_WIDTH_PX }}
                                        >
                                            <Image
                                                src={CHAPTERS[hoverChapter].preview}
                                                alt=""
                                                width={480}
                                                height={270}
                                                className="aspect-video w-full border-b border-edge object-cover"
                                            />
                                            <span className="flex flex-col gap-1 px-3 py-2.5">
                                                <span className="text-[13px] leading-tight text-foreground">
                                                    {CHAPTERS[hoverChapter].title}
                                                </span>
                                                <span className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] text-neutral-500 uppercase tabular-nums">
                                                    <span className="size-1.5 bg-primary" />
                                                    {chapterNumber(hoverChapter)} ·{" "}
                                                    {clock(hover.seconds)}
                                                </span>
                                            </span>
                                        </span>
                                    )}
                                </div>

                                <span className="flex shrink-0 items-center border-l border-edge px-4 font-mono text-[12px] text-neutral-500 tabular-nums">
                                    <span className="text-foreground">{clock(currentTime)}</span>
                                    <span className="mx-1.5">/</span>
                                    {clock(duration)}
                                </span>
                                <ControlButton
                                    label={muted ? "Turn sound on" : "Mute"}
                                    onClick={toggleMute}
                                    className="border-l"
                                >
                                    {muted ? (
                                        <VideoMutedIcon className="size-5" />
                                    ) : (
                                        <VideoSoundIcon className="size-5" />
                                    )}
                                </ControlButton>
                                <ControlButton
                                    label={fullscreen ? "Exit full screen" : "Full screen"}
                                    onClick={toggleFullscreen}
                                    className="border-l max-sm:hidden"
                                >
                                    {fullscreen ? (
                                        <VideoExitFullscreenIcon className="size-5" />
                                    ) : (
                                        <VideoFullscreenIcon className="size-5" />
                                    )}
                                </ControlButton>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
