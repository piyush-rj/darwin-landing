"use client";

import { motion, MotionConfig } from "motion/react";
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
            <motion.div
                className={className}
                initial={{ opacity: 0, y }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </MotionConfig>
    );
}
