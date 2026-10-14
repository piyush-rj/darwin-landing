import { useId } from "react";

type Point = [x: number, y: number];

const DEPTH: Point = [14, 12];

const LETTER: Point[] = [
    [54, 48],
    [110, 48],
    [110, 60],
    [126, 60],
    [126, 72],
    [140, 72],
    [140, 128],
    [126, 128],
    [126, 140],
    [110, 140],
    [110, 152],
    [54, 152],
];

const COUNTER: Point[] = [
    [80, 74],
    [102, 74],
    [102, 86],
    [114, 86],
    [114, 114],
    [102, 114],
    [102, 126],
    [80, 126],
];

type Face = { points: Point[]; facing: "side" | "under" };

function extrudedFaces(outline: Point[], isCounter: boolean): Face[] {
    return outline.flatMap((start, index) => {
        const end = outline[(index + 1) % outline.length];
        const direction = isCounter ? -1 : 1;
        const normalX = (end[1] - start[1]) * direction;
        const normalY = (start[0] - end[0]) * direction;
        const facing = normalX > 0 ? "side" : normalY > 0 ? "under" : null;
        if (!facing) return [];
        const face: Face = {
            facing,
            points: [
                start,
                end,
                [end[0] + DEPTH[0], end[1] + DEPTH[1]],
                [start[0] + DEPTH[0], start[1] + DEPTH[1]],
            ],
        };
        return [face];
    });
}

const FACES = [...extrudedFaces(LETTER, false), ...extrudedFaces(COUNTER, true)].sort(
    (a, b) => a.points[0][0] + a.points[0][1] - (b.points[0][0] + b.points[0][1]),
);

const ring = (outline: Point[]) => `M${outline.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
const LETTER_PATH = ring(LETTER) + ring(COUNTER);
const toPoints = (points: Point[]) => points.map(([x, y]) => `${x},${y}`).join(" ");

export const DARWIN_LOGO_BRAND_COLOR = "[--color-primary:#7c5ce6]";

const TOP = "fill-[color-mix(in_oklab,var(--color-primary)_88%,var(--color-white))]";
const DIRT = "fill-[color-mix(in_oklab,var(--color-primary)_68%,var(--color-black))]";
const SIDE = "fill-[color-mix(in_oklab,var(--color-primary)_45%,var(--color-black))]";

export function DarwinBlockLogo({ className }: { className?: string }) {
    const clipId = useId();

    return (
        <svg
            viewBox="38 34 128 136"
            role="img"
            aria-label="Darwin"
            className={className}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeLinecap="round"
        >
            <g className="stroke-stone-800">
                <g transform="rotate(-8 100 100) translate(4 -2)">
                    {FACES.map((face) => (
                        <polygon
                            key={toPoints(face.points)}
                            points={toPoints(face.points)}
                            className={face.facing === "side" ? SIDE : DIRT}
                        />
                    ))}
                    <path d={LETTER_PATH} fillRule="evenodd" className={TOP} />
                    <clipPath id={clipId}>
                        <path d={LETTER_PATH} clipRule="evenodd" />
                    </clipPath>
                    <path
                        clipPath={`url(#${clipId})`}
                        className={DIRT}
                        stroke="none"
                        d="M40 122H64V129H90V122H114V129H126V122H150V170H40Z"
                    />
                    <path fill="none" d="M54 122H64V129H80M102 122H114V129H126V122H140" />
                    <path
                        fill="none"
                        strokeWidth={3.5}
                        d="M64 60h10M86 58h12M128 92v12M64 96h8M66 140h10M92 138h8"
                    />
                    <path d={LETTER_PATH} fillRule="evenodd" fill="none" />
                </g>
            </g>
        </svg>
    );
}
