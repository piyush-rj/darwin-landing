import { cn } from "@/lib/utils";

import PixelSprite, { type PixelSpriteArt } from "../PixelSprite";

const HEAD_ROWS = [
    "..........dddddddddd..........",
    ".......dddhhhhhhhhhhddd.......",
    ".....ddhhhbbbbbbbbbbhhhdd.....",
    "...ddhhbbbbbbbbbbbbbbbbhhdd...",
    "..dhhbbbbbssssssssssbbbbbhhd..",
    ".dhbbsssdddddccccdddddsssbbhd.",
    "dhbbsdd.....dccccd.....ddsbbhd",
    "dbbsd.......dccccd.......dsbbd",
    "dbsd........dccccd........dsbd",
    "dsd.........dccccd.........dsd",
    "dd..........dccccd..........dd",
];

const DIAMOND: PixelSpriteArt = {
    rows: HEAD_ROWS,
    colors: { h: "#cffafe", b: "#67e8f9", s: "#22d3ee", d: "#155e75", c: "#3f2410" },
};

const GLINT: PixelSpriteArt = {
    rows: HEAD_ROWS,
    colors: { h: "#ede9fe", b: "#c4b5fd", s: "#a78bfa", d: "#7c5ce6", c: "#7c5ce6" },
};

const HEAD_CELLS = HEAD_ROWS[0].length;
const HANDLE_CELLS = 4;
const HANDLE_TOP_CELLS = 5;

const SPARKLES = [
    { left: "-6%", top: "8%", delay: "0s" },
    { left: "104%", top: "34%", delay: "0.5s" },
    { left: "22%", top: "-14%", delay: "1.1s" },
];

export default function PixelPickaxe({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn("relative h-full w-(--head)", className)}>
            <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                    top: `calc(var(--head) * ${HANDLE_TOP_CELLS / HEAD_CELLS})`,
                    width: `calc(var(--head) * ${HANDLE_CELLS / HEAD_CELLS})`,
                    background: "linear-gradient(to right, #a0652e 0 50%, #7c4a1e 50% 100%)",
                }}
            />
            <div className="absolute inset-x-0 top-0">
                <PixelSprite art={DIAMOND} scale={1} className="block h-auto w-full" />
                <PixelSprite
                    art={GLINT}
                    scale={1}
                    className="pickaxe-glint absolute inset-0 block h-auto w-full"
                />
                {SPARKLES.map((sparkle) => (
                    <span
                        key={sparkle.left}
                        className="beach-sparkle absolute bg-white"
                        style={{
                            left: sparkle.left,
                            top: sparkle.top,
                            width: `calc(var(--head) / ${HEAD_CELLS})`,
                            height: `calc(var(--head) / ${HEAD_CELLS})`,
                            animationDelay: sparkle.delay,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
