import Image from "next/image";

import { GithubLogoIcon, TelegramLogoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { BoardGlyph } from "../PixelGlyphs";
import type { IssueSource } from "./backlogTimeline";

export function SourceIcon({ source, className }: { source: IssueSource; className?: string }) {
    if (source === "Slack") {
        return (
            <Image
                src="/images/integrations/slack.svg"
                alt=""
                width={16}
                height={16}
                className={cn("scale-[2.2]", className)}
            />
        );
    }
    if (source === "Telegram") return <TelegramLogoIcon className={className} />;
    if (source === "GitHub") return <GithubLogoIcon className={className} />;
    return <BoardGlyph className={className} />;
}
