"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { PILL, ROLL_TRIGGER, RollingLabel } from "./TicketButtons";

const VIDEO_SRC = "/videos/darwin-end-to-end.mp4";
const MORPH_ID = "watch-it-work";
const MORPH = { type: "spring", stiffness: 190, damping: 26, mass: 0.9 } as const;
const VIDEO_REVEAL_DELAY_S = 0.32;

const subscribeToNothing = () => () => {};
const useIsClient = () =>
    useSyncExternalStore(
        subscribeToNothing,
        () => true,
        () => false,
    );

function VideoOverlay({ onClose }: { onClose: () => void }) {
    const reduceMotion = useReducedMotion();
    const videoRef = useRef<HTMLVideoElement>(null);
    const revealDelay = reduceMotion ? 0 : VIDEO_REVEAL_DELAY_S;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
    }, []);

    return (
        <div
            role="dialog"
            aria-modal
            aria-label="Darwin, end to end"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10"
        >
            <m.button
                type="button"
                aria-label="Close video"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-stone-950/85 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            />
            <m.div
                layoutId={MORPH_ID}
                transition={MORPH}
                style={{ borderRadius: 18 }}
                className="relative aspect-video w-full max-w-[1200px] overflow-hidden bg-stone-950 shadow-[0_48px_120px_-32px] shadow-black/80 ring-1 ring-white/10"
            >
                <m.video
                    ref={videoRef}
                    src={VIDEO_SRC}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    controlsList="nodownload"
                    className="size-full bg-stone-950"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: revealDelay }}
                />
            </m.div>
            <m.button
                type="button"
                autoFocus
                aria-label="Close video"
                onClick={onClose}
                className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:top-6 md:right-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: revealDelay }}
            >
                <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
                    <path
                        d="M5 5l10 10M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            </m.button>
        </div>
    );
}

export default function WatchItWorkButton() {
    const [open, setOpen] = useState(false);
    const mounted = useIsClient();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const lenis = useLenis();

    useEffect(() => {
        if (!open) return;
        const trigger = triggerRef.current;
        lenis?.stop();
        document.documentElement.style.overflow = "hidden";
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            lenis?.start();
            document.documentElement.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
            trigger?.focus({ preventScroll: true });
        };
    }, [open, lenis]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className={ROLL_TRIGGER}
            >
                <m.span
                    layoutId={MORPH_ID}
                    transition={MORPH}
                    style={{ borderRadius: 8 }}
                    className={`${PILL} bg-stone-200 text-stone-900 group-hover:bg-stone-300`}
                >
                    <RollingLabel text="Watch it work" />
                </m.span>
            </button>
            {mounted &&
                createPortal(
                    <AnimatePresence>
                        {open && <VideoOverlay onClose={() => setOpen(false)} />}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
