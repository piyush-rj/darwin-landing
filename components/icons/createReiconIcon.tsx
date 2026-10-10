import type { IconComponent, IconProps } from "reicon-react";

export function createReiconIcon(Glyph: IconComponent) {
    function Icon(props: Omit<IconProps, "weight">) {
        return <Glyph weight="Outline" {...props} />;
    }
    Icon.displayName = `ReiconIcon(${Glyph.displayName})`;
    return Icon;
}
