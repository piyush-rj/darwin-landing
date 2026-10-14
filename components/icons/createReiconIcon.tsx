import type { IconComponent, IconProps, IconWeight } from "reicon-react";

function createWeightedIcon(Glyph: IconComponent, weight: IconWeight) {
    function Icon(props: Omit<IconProps, "weight">) {
        return <Glyph weight={weight} {...props} />;
    }
    Icon.displayName = `ReiconIcon(${Glyph.displayName})`;
    return Icon;
}

export function createReiconIcon(Glyph: IconComponent) {
    return createWeightedIcon(Glyph, "Outline");
}

export function createFilledReiconIcon(Glyph: IconComponent) {
    return createWeightedIcon(Glyph, "Filled");
}
