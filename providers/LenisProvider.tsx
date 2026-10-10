"use client";
import { ReactLenis } from "lenis/react";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
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
