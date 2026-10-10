import type { IconBaseProps, IconType } from "react-icons";

export function createIcon(Glyph: IconType) {
    function Icon(props: IconBaseProps) {
        return <Glyph {...props} />;
    }
    Icon.displayName = `Icon(${Glyph.name})`;
    return Icon;
}
