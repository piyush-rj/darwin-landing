const easeInOutQuad = (progress: number) =>
    progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;

export const pixelEase = (steps: number) => (progress: number) =>
    Math.round(easeInOutQuad(progress) * steps) / steps;
