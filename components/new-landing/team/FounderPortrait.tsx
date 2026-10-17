import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function FounderPortrait({
    name,
    image,
    sizes,
    className,
    children,
}: {
    name: string;
    image: StaticImageData;
    sizes: string;
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
            />
            {children}
        </div>
    );
}
