"use client";

import { isMotionValue, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

import type { FigureHandle, FigureMount } from "@/lib/hairline/core/stage";
import { inject } from "@/lib/hairline/core/styles";
import { cn } from "@/lib/utils";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

type FigureValue = number | MotionValue<number>;

const currentValue = (value: FigureValue) => (isMotionValue(value) ? value.get() : value);

export default function HairlineFigure({
    figure,
    value,
    label,
    className,
}: {
    figure: FigureMount;
    value: FigureValue;
    label: string;
    className?: string;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<FigureHandle | null>(null);
    const valueRef = useRef(value);

    useEffect(() => {
        const host = hostRef.current!;
        inject(host.ownerDocument);
        host.setAttribute("data-hairline", "");
        const svg = host.ownerDocument.createElementNS(SVG_NAMESPACE, "svg");
        svg.setAttribute("aria-hidden", "true");
        host.appendChild(svg);
        const handle = figure(
            { stage: host, svg, read: { textContent: null } },
            currentValue(valueRef.current),
        );
        handleRef.current = handle;
        return () => {
            handle.destroy();
            handleRef.current = null;
            svg.remove();
        };
    }, [figure]);

    useEffect(() => {
        valueRef.current = value;
        handleRef.current?.set(currentValue(value));
        if (isMotionValue(value)) {
            return value.on("change", (latest) => handleRef.current?.set(latest));
        }
    }, [value]);

    return <div ref={hostRef} role="img" aria-label={label} className={cn("w-full", className)} />;
}
