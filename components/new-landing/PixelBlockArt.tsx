export type Pixel = [x: number, y: number, w: number, h: number, fill: string];

export type PixelArt = {
    base: string;
    light: string;
    outline: string;
    pixels: Pixel[];
};

export default function PixelBlockArt({ art }: { art: PixelArt }) {
    return (
        <svg
            viewBox="0 0 16 16"
            shapeRendering="crispEdges"
            className="absolute inset-0 size-full"
            aria-hidden
        >
            <rect width={16} height={16} style={{ fill: art.base }} />
            {art.pixels.map(([x, y, w, h, fill]) => (
                <rect
                    key={`${x}-${y}-${w}-${h}`}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    style={{ fill }}
                />
            ))}
            <rect width={16} height={1} style={{ fill: art.light, opacity: 0.7 }} />
            <rect width={1} height={16} style={{ fill: art.light, opacity: 0.7 }} />
            <rect y={15} width={16} height={1} style={{ fill: art.outline, opacity: 0.55 }} />
            <rect x={15} width={1} height={16} style={{ fill: art.outline, opacity: 0.55 }} />
        </svg>
    );
}
