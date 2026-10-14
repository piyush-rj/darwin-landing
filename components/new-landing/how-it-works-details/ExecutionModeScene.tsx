import PixelSprite, { type PixelSpriteArt } from "@/components/new-landing/PixelSprite";

const SPRITE_SCALE = 6;

const AIRPLANE: PixelSpriteArt = {
    rows: [
        "oo..............",
        "odo.............",
        "oddo............",
        "odddoooooooooo..",
        "ohhhhhhhhhhhhhho",
        "obbwbwbwbwbwbbbo",
        "obbbbbbbbbbbbbbo",
        ".oddddggggddddo.",
        "......oggo......",
        ".....oggo.......",
        "....oooo........",
    ],
    colors: {
        o: "#1e3a8a",
        d: "#3b82f6",
        h: "#dbeafe",
        b: "#93c5fd",
        w: "#1e40af",
        g: "#2563eb",
    },
};

const EYE = [
    "..ooo..",
    ".owwwo.",
    "owwwwwo",
    "owwwhpo",
    "owwwppo",
    "owwwppo",
    "owwwppo",
    "osswwso",
    ".ossso.",
    "..ooo..",
];

const EYES: PixelSpriteArt = {
    rows: EYE.map((row) => `${row}.${row}`),
    colors: {
        o: "#3f3f46",
        w: "#ffffff",
        s: "#d4d4d8",
        p: "#18181b",
        h: "#ffffff",
    },
};

export default function ExecutionModeScene() {
    return (
        <div aria-hidden className="flex items-end justify-center gap-16 py-8">
            <PixelSprite art={AIRPLANE} scale={SPRITE_SCALE} />
            <PixelSprite art={EYES} scale={SPRITE_SCALE} />
        </div>
    );
}
