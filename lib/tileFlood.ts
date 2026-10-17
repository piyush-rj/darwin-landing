import { seededRandom } from "@/lib/seededRandom";

export function planTileFlood(
    columns: number,
    rows: number,
    seed: number,
    { origins = 3, stepMs, jitterMs }: { origins?: number; stepMs: number; jitterMs: number },
) {
    const random = seededRandom(seed);
    const starts = Array.from({ length: origins }, () => Math.floor(random() * columns * rows));
    return Array.from({ length: columns * rows }, (_, cell) => {
        const steps = Math.min(
            ...starts.map(
                (start) =>
                    Math.abs((start % columns) - (cell % columns)) +
                    Math.abs(Math.floor(start / columns) - Math.floor(cell / columns)),
            ),
        );
        return steps * stepMs + random() * jitterMs;
    });
}

export const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);
