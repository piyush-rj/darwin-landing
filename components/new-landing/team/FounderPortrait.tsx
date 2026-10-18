import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { PortraitFraming } from "./teamChapters";

export default function FounderPortrait({
    name,
    image,
    sizes,
    framing,
    className,
    children,
}: {
    name: string;
    image: StaticImageData;
    sizes: string;
    framing?: PortraitFraming;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div className={cn("relative overflow-hidden", className)}>
            <Image
                src={image}
                alt={name}
                sizes={sizes}
                placeholder="blur"
                fill
                className="object-cover"
                style={
                    framing && {
                        scale: framing.zoom,
                        transformOrigin: `50% ${framing.anchorY * 100}%`,
                    }
                }
            />
            {children}
        </div>
    );
}
