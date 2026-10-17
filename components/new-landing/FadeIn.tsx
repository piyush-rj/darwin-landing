"use client";

import { MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

export default function FadeIn({
    children,
    delay = 0,
    y = 18,
    className,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
}) {
    return (
        <MotionConfig reducedMotion="user">
            <m.div
                className={className}
                initial={{ opacity: 0, y }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </m.div>
        </MotionConfig>
    );
}
