import { seededRandom } from "@/lib/seededRandom";
import { cn } from "@/lib/utils";

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.2 1.35'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;
const TILE_PX = 96;
const COLUMNS = 24;
const ROWS = 12;
const NEUTRAL_STRENGTHS = [2, 2.75, 3.5];
const WHITE_SHARE = 0.5;

const tileRandom = seededRandom(23);
const TILE_STRENGTHS = Array.from({ length: COLUMNS * ROWS }, () =>
    tileRandom() < WHITE_SHARE
        ? 0
        : NEUTRAL_STRENGTHS[Math.floor(tileRandom() * NEUTRAL_STRENGTHS.length)],
);

export default function VideoBackdrop({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden bg-snow",
                className,
            )}
        >
            <div
                className="absolute top-0 left-1/2 grid -translate-x-1/2"
                style={{
                    gridTemplateColumns: `repeat(${COLUMNS}, ${TILE_PX}px)`,
                    gridAutoRows: `${TILE_PX}px`,
                }}
            >
                {TILE_STRENGTHS.map((strength, cell) =>
                    strength === 0 ? (
                        <span key={cell} className="bg-snow" />
                    ) : (
                        <span
                            key={cell}
                            className="relative"
                            style={{
                                background: `color-mix(in oklab, var(--color-foreground) ${strength}%, var(--color-snow))`,
                            }}
                        >
                            <span
                                className="absolute inset-0 opacity-[0.05]"
                                style={{ backgroundImage: GRAIN }}
                            />
                        </span>
                    ),
                )}
            </div>
        </div>
    );
}
