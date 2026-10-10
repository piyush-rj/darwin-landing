import { cn } from "@/lib/utils";

const TILE_SIZE = 8;
const PORTAL_CENTER = (TILE_SIZE - 1) / 2;
const SWIRL_SECONDS = 2;
const SWIRL_TIGHTNESS = 0.14;

const OBSIDIAN_DARK = "#140c22";
const OBSIDIAN_MID = "#22163a";
const OBSIDIAN_LIGHT = "#3b2a59";

function obsidianColor(x: number, y: number) {
    const speckle = (x * 7 + y * 3) % 5;
    if (speckle === 0) return OBSIDIAN_LIGHT;
    if (speckle === 2) return OBSIDIAN_MID;
    return OBSIDIAN_DARK;
}

function swirlDelay(x: number, y: number) {
    const dx = x - PORTAL_CENTER;
    const dy = y - PORTAL_CENTER;
    const turn = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
    const phase = (turn + Math.hypot(dx, dy) * SWIRL_TIGHTNESS) % 1;
    return `${-phase * SWIRL_SECONDS}s`;
}

const TILE_PIXELS = Array.from({ length: TILE_SIZE * TILE_SIZE }, (_, index) => {
    const x = index % TILE_SIZE;
    const y = Math.floor(index / TILE_SIZE);
    const isFrame = x === 0 || y === 0 || x === TILE_SIZE - 1 || y === TILE_SIZE - 1;
    return { x, y, isFrame };
});

export default function NetherPortalTile({ className }: { className: string }) {
    return (
        <svg
            aria-hidden
            viewBox={`0 0 ${TILE_SIZE} ${TILE_SIZE}`}
            shapeRendering="crispEdges"
            className={cn("absolute top-1/2 size-4 -translate-y-1/2", className)}
        >
            {TILE_PIXELS.map(({ x, y, isFrame }) =>
                isFrame ? (
                    <rect
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        width={1}
                        height={1}
                        fill={obsidianColor(x, y)}
                    />
                ) : (
                    <rect
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        width={1}
                        height={1}
                        className="portal-swirl"
                        style={{ animationDelay: swirlDelay(x, y) }}
                    />
                ),
            )}
        </svg>
    );
}
