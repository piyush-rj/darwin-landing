export const PACE_STEP_SECONDS = 0.005;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
export const PARKED_GAP_EM = 0.35;
export const RESTING_Y = "calc(0% + 0em)";
const DESCENDER_LETTERS = new Set(["g", "j", "p", "q", "y"]);

export function parkedOffset(doubled: boolean, sign: 1 | -1 = 1) {
    const lines = doubled ? 200 : 100;
    const gap = doubled ? PARKED_GAP_EM * 2 : PARKED_GAP_EM;
    return `calc(${sign * lines}% + ${sign * gap}em)`;
}

export function rollsTwice(character: string, indexInLine: number) {
    return !DESCENDER_LETTERS.has(character) && (indexInLine % 5 === 0 || indexInLine % 8 === 0);
}
