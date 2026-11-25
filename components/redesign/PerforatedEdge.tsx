"use client";

import type { ReactNode } from "react";

import { type EdgeSide, usePerforatedEdge } from "./usePerforatedEdge";

export default function PerforatedEdge({
    sides,
    children,
}: {
    sides: EdgeSide[];
    children: ReactNode;
}) {
    const [edgeRef, edgeStyle] = usePerforatedEdge<HTMLDivElement>(sides);
    return (
        <div ref={edgeRef} style={edgeStyle}>
            {children}
        </div>
    );
}
