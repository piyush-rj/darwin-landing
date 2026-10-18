"use client";

import { useEffect, useRef } from "react";

import type { FigureHandle, FigureMount } from "@/lib/hairline/core/stage";
import { inject } from "@/lib/hairline/core/styles";
import { cn } from "@/lib/utils";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export default function HairlineFigure({
    figure,
    value,
    label,
    className,
}: {
    figure: FigureMount;
    value: number;
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
        const handle = figure({ stage: host, svg, read: { textContent: null } }, valueRef.current);
        handleRef.current = handle;
        return () => {
            handle.destroy();
            handleRef.current = null;
            svg.remove();
        };
    }, [figure]);

    useEffect(() => {
        valueRef.current = value;
        handleRef.current?.set(value);
    }, [value]);

    return <div ref={hostRef} role="img" aria-label={label} className={cn("w-full", className)} />;
}
