const FONT_PX = 13;
const LINE_HEIGHT = 1.375;
const PADDING_X = 8;
const PADDING_Y = 4;
const LINE_GAP = 4;
const INSET = 16;
const SHADE_SHARE = 0.6;

export type CaptionColors = {
    shadeBottom: string;
    shadeMiddle: string;
    shadeTop: string;
    box: string;
    text: string;
    accent: string;
};

export function captionFont(fontFamily: string, ratio: number) {
    return `${FONT_PX * ratio}px ${fontFamily}`;
}

export function paintCaption(
    picture: HTMLCanvasElement,
    lines: string[],
    font: string,
    colors: CaptionColors,
    ratio: number,
) {
    const context = picture.getContext("2d")!;
    const { width, height } = picture;
    const shadeTop = height * (1 - SHADE_SHARE);
    const shade = context.createLinearGradient(0, height, 0, shadeTop);
    shade.addColorStop(0, colors.shadeBottom);
    shade.addColorStop(0.5, colors.shadeMiddle);
    shade.addColorStop(1, colors.shadeTop);
    context.fillStyle = shade;
    context.fillRect(0, shadeTop, width, height - shadeTop);

    context.font = font;
    context.textBaseline = "middle";
    const boxHeight = (FONT_PX * LINE_HEIGHT + PADDING_Y * 2) * ratio;
    const gap = LINE_GAP * ratio;
    let top = height - INSET * ratio - lines.length * (boxHeight + gap) + gap;
    lines.forEach((line, index) => {
        context.fillStyle = colors.box;
        context.fillRect(
            INSET * ratio,
            top,
            context.measureText(line).width + PADDING_X * 2 * ratio,
            boxHeight,
        );
        context.fillStyle = index === 0 ? colors.accent : colors.text;
        context.fillText(line, (INSET + PADDING_X) * ratio, top + boxHeight / 2);
        top += boxHeight + gap;
    });
}
