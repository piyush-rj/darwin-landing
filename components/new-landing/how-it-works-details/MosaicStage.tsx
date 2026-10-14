"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

import BlockMosaic, { COLUMNS as MOSAIC_COLUMNS } from "@/components/new-landing/BlockMosaic";

const MIN_VERTICAL_SPACE = 40;

export default function MosaicStage({ children }: { children: ReactNode }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [rows, setRows] = useState(0);

    useEffect(() => {
        const stage = stageRef.current;
        const content = contentRef.current;
        if (!stage || !content) return;
        const observer = new ResizeObserver(() => {
            const tileSize = stage.clientWidth / MOSAIC_COLUMNS;
            const neededHeight = content.offsetHeight + MIN_VERTICAL_SPACE * 2;
            setRows(Math.max(1, Math.ceil(neededHeight / tileSize)));
        });
        observer.observe(stage);
        observer.observe(content);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={stageRef}
            className="relative flex items-center overflow-hidden border-b border-edge px-6 md:px-12"
            style={{ aspectRatio: rows ? `${MOSAIC_COLUMNS} / ${rows}` : undefined }}
        >
            {rows > 0 && (
                <div
                    className="absolute inset-0 isolate bg-snow"
                    style={{ "--color-primary": "var(--color-snow)" } as CSSProperties}
                >
                    <BlockMosaic key={rows} rows={rows} className="opacity-20" />
                </div>
            )}
            <div ref={contentRef} className="relative w-full">
                {children}
            </div>
        </div>
    );
}
