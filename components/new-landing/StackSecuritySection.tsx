import Image from "next/image";
import type { ReactNode } from "react";

import { TelegramLogoIcon } from "@/components/icons";
import RollingText from "@/components/utility/RollingText";
import { cn } from "@/lib/utils";

const MONO_LABEL = "font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase";

function LogoImage({ name, className }: { name: string; className?: string }) {
    return (
        <Image
            src={`/images/integrations/${name}.svg`}
            alt=""
            width={22}
            height={22}
            className={cn("size-[22px]", className)}
        />
    );
}

const TOOLS: { name: string; role: string; logo: ReactNode }[] = [
    {
        name: "GitHub",
        role: "Pull requests",
        logo: <LogoImage name="github" className="[.landing-dark_&]:invert" />,
    },
    {
        name: "Telegram",
        role: "Messages",
        logo: <TelegramLogoIcon className="size-[26px] text-sky-500" />,
    },
    { name: "Slack", role: "Threads", logo: <LogoImage name="slack" className="scale-[2.4]" /> },
    { name: "Figma", role: "Designs", logo: <LogoImage name="figma" /> },
];

const SAFEGUARDS = [
    {
        title: "Isolated runners",
        body: "Every fix runs in its own sandbox, which is destroyed when the run ends.",
    },
    {
        title: "Scoped access",
        body: "Darwin only sees the repositories you connect, through an app you control.",
    },
    {
        title: "Humans merge",
        body: "Changes arrive as pull requests. Nothing is pushed to your default branch.",
    },
    {
        title: "Your code stays yours",
        body: "Source code and secrets are never used to train models.",
    },
];

function ColumnHeader({ label, title, body }: { label: string; title: string; body: string }) {
    return (
        <div className="border-b border-edge px-6 py-10 md:px-9">
            <p className={MONO_LABEL}>{label}</p>
            <h3 className="mt-4 text-[26px] leading-[1.15] font-semibold tracking-[-0.03em] text-foreground sm:text-[30px]">
                {title}
            </h3>
            <p className="mt-3 max-w-[44ch] text-[16px] leading-[1.5] text-neutral-500">{body}</p>
        </div>
    );
}

export default function StackSecuritySection() {
    return (
        <section id="security" className="w-full border-b border-edge bg-ink">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="border-edge px-6 pt-20 pb-12 md:px-9 lg:border-r lg:pt-28">
                    <p className={MONO_LABEL}>Stack and security</p>
                    <h2 className="mt-5 max-w-[18ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                        <RollingText text="Fits your stack. Keeps your code safe." />
                    </h2>
                </div>
                <div className="flex items-end bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                        Darwin works inside the tools your team already uses, with access you grant
                        and can take back at any time.
                    </p>
                </div>
            </div>

            <div className="grid border-t border-edge lg:grid-cols-2">
                <div className="flex flex-col border-edge max-lg:border-b lg:border-r">
                    <ColumnHeader
                        label="Fits your stack"
                        title="Plugs into the tools you already use."
                        body="Issues come in from where your team files them. Fixes go back as pull requests."
                    />
                    <ul className="grid flex-1 auto-rows-fr grid-cols-2 gap-px bg-edge">
                        {TOOLS.map((tool) => (
                            <li
                                key={tool.name}
                                className="flex flex-col justify-between gap-6 bg-ink px-6 py-6 md:px-9"
                            >
                                {tool.logo}
                                <span className="flex flex-col">
                                    <span className="text-[15px] text-foreground">{tool.name}</span>
                                    <span className="font-mono text-[11px] tracking-[0.08em] text-neutral-500 uppercase">
                                        {tool.role}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col">
                    <ColumnHeader
                        label="Security"
                        title="Your code never leaves your control."
                        body="Every run is contained, scoped and reviewed by a person before it ships."
                    />
                    <ul className="grid flex-1 auto-rows-fr">
                        {SAFEGUARDS.map((safeguard) => (
                            <li
                                key={safeguard.title}
                                className="flex items-start gap-4 border-b border-edge px-6 py-6 last:border-b-0 md:px-9"
                            >
                                <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-primary" />
                                <span className="flex flex-col gap-1">
                                    <span className="text-[16px] text-foreground">
                                        {safeguard.title}
                                    </span>
                                    <span className="text-[15px] leading-[1.5] text-neutral-500">
                                        {safeguard.body}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
