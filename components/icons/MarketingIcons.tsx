import Image from "next/image";
import type { IconType } from "react-icons";
import { RiTelegram2Fill } from "react-icons/ri";

import { createIcon } from "./createIcon";

export const TelegramLogoIcon = createIcon(RiTelegram2Fill);

const FigmaLogoGlyph: IconType = ({ className }) => (
    <Image src="/images/figma-logo.webp" alt="" width={512} height={512} className={className} />
);

export const FigmaLogoIcon = createIcon(FigmaLogoGlyph);
