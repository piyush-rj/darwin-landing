"use client";
import { LazyMotion } from "motion/react";

const loadMotionFeatures = () => import("@/lib/motionFeatures").then((module) => module.default);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={loadMotionFeatures} strict>
            {children}
        </LazyMotion>
    );
}
