import type { CSSProperties } from "react";

export type PixelSpriteArt = { rows: string[]; colors: Record<string, string> };

export default function PixelSprite({
    art,
    scale,
    className,
    style,
}: {
    art: PixelSpriteArt;
    scale: number;
    className?: string;
    style?: CSSProperties;
}) {
    const width = art.rows[0].length;
    const height = art.rows.length;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width={width * scale}
            height={height * scale}
            shapeRendering="crispEdges"
            aria-hidden
            className={className}
            style={style}
        >
            {art.rows.flatMap((row, y) =>
                [...row].map((key, x) =>
                    key === "." ? null : (
                        <rect
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            width={1}
                            height={1}
                            style={{ fill: art.colors[key] }}
                        />
                    ),
                ),
            )}
        </svg>
    );
}
