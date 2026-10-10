import { cn } from "@/lib/utils";

import NetherPortalTile from "./NetherPortalTile";

export const RULER_TICKS =
    "bg-[repeating-linear-gradient(to_right,color-mix(in_oklab,var(--color-foreground)_22%,transparent)_0_1px,transparent_1px_8px)]";

export default function SectionDivider() {
    return (
        <div aria-hidden className="relative h-10 w-full border-b border-edge md:h-12">
            <NetherPortalTile className="left-3" />
            <span className={cn("absolute inset-x-9 top-1/2 h-2 -translate-y-1/2", RULER_TICKS)} />
            <NetherPortalTile className="right-3" />
        </div>
    );
}
