import type { Drawing, Tone } from "./sketch";

export const TONE_STYLE: Record<Tone, { width: number; opacity: number }> = {
    ink: { width: 1.7, opacity: 0.86 },
    line: { width: 1.15, opacity: 0.68 },
    soft: { width: 0.9, opacity: 0.42 },
    hatch: { width: 0.7, opacity: 0.3 },
    shade: { width: 0.8, opacity: 0.5 },
    dark: { width: 0.85, opacity: 0.72 },
    grain: { width: 0.65, opacity: 0.28 },
};

export default function Sketch({ drawings }: { drawings: Drawing[] }) {
    return drawings.map((drawing, index) => (
        <g key={index}>
            {drawing.fill && <path d={drawing.fill} className="fill-parchment stroke-none" />}
            {drawing.strokes.map((stroke, strokeIndex) =>
                stroke.d ? (
                    <path
                        key={strokeIndex}
                        d={stroke.d}
                        fill="none"
                        strokeWidth={TONE_STYLE[stroke.tone].width}
                        strokeOpacity={TONE_STYLE[stroke.tone].opacity}
                    />
                ) : null,
            )}
        </g>
    ));
}
