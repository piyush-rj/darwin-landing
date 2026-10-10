"use client";
import { ReactLenis } from "lenis/react";
import { useLayoutEffect } from "react";

function startAtTop() {
    window.history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    useLayoutEffect(startAtTop, []);

    return (
        <ReactLenis
            root
            options={{
                lerp: 0.08,
                wheelMultiplier: 0.9,
                smoothWheel: true,
                anchors: true,
            }}
        >
            {children}
        </ReactLenis>
    );
}
