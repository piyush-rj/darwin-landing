import { useId } from "react";

import type { PixelSpriteArt } from "@/components/new-landing/PixelSprite";

export default function PixelStrip({
    art,
    scale,
    className,
}: {
    art: PixelSpriteArt;
    scale: number;
    className?: string;
}) {
    const patternId = useId();
    const tileWidth = art.rows[0].length * scale;
    const tileHeight = art.rows.length * scale;

    return (
        <svg shapeRendering="crispEdges" aria-hidden className={className}>
            <defs>
                <pattern
                    id={patternId}
                    width={tileWidth}
                    height={tileHeight}
                    patternUnits="userSpaceOnUse"
                >
                    {art.rows.flatMap((row, y) =>
                        [...row].map((key, x) =>
                            key === "." ? null : (
                                <rect
                                    key={`${x}-${y}`}
                                    x={x * scale}
                                    y={y * scale}
                                    width={scale}
                                    height={scale}
                                    style={{ fill: art.colors[key] }}
                                />
                            ),
                        ),
                    )}
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
    );
}
