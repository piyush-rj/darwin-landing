import { cn } from "@/lib/utils";

type Rect = [x: number, y: number, w: number, h: number];

export type PixelGlyph = (props: { className?: string }) => React.ReactElement;

function glyph(outline: string, blocks: Rect[] = []): PixelGlyph {
    return function Glyph({ className }) {
        return (
            <svg
                viewBox="0 0 24 24"
                aria-hidden
                fill="none"
                strokeWidth={2}
                strokeLinecap="square"
                strokeLinejoin="miter"
                className={cn("size-6 stroke-current", className)}
            >
                <path d={outline} />
                <g stroke="none" className="fill-current">
                    {blocks.map(([x, y, w, h]) => (
                        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
                    ))}
                </g>
            </svg>
        );
    };
}

export const BoardGlyph = glyph("M3 3H21V21H3Z", [
    [5, 5, 4, 4],
    [5, 10, 4, 4],
    [10, 5, 4, 4],
    [15, 5, 4, 4],
    [15, 10, 4, 4],
    [15, 15, 4, 4],
]);

export const TerminalGlyph = glyph("M3 4H21V20H3Z M7 9L10 12L7 15 M12 15H17");

export const PullRequestGlyph = glyph("M5 8V16 M19 16V7H12 M14 5L12 7L14 9", [
    [2, 2, 6, 6],
    [2, 16, 6, 6],
    [16, 16, 6, 6],
]);
