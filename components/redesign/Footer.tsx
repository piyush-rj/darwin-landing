import Link from "next/link";

import WaitlistPill from "./WaitlistPill";

const CONTACT_EMAIL = "hello@heydarwin.app";

const COLUMNS = [
    {
        heading: "Darwin",
        links: [
            { label: "How it works", href: "/how-it-works" },
            { label: "Why Darwin", href: "/why" },
            { label: "Team", href: "/team" },
            { label: "Changelog", href: "/changelog" },
            { label: "Blog", href: "/blog" },
        ],
    },
    {
        heading: "Connect on",
        links: [
            { label: "X", href: "https://x.com/heydarwin_app" },
            { label: "GitHub", href: "https://github.com/bottle-nex" },
        ],
    },
];

const WORDMARK_WIDTH = 1844;
const WORDMARK_HEIGHT = 330;

function Wordmark() {
    return (
        <svg
            viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}
            className="block h-auto w-full fill-stone-950"
            role="img"
            aria-label="Darwin"
        >
            <text
                x={0}
                y={WORDMARK_HEIGHT}
                textLength={WORDMARK_WIDTH}
                lengthAdjust="spacingAndGlyphs"
                className="font-headline text-[440px] font-bold uppercase"
            >
                Darwin
            </text>
        </svg>
    );
}

export default function Footer() {
    return (
        <footer
            id="footer"
            className="sticky bottom-0 z-0 flex w-full flex-col overflow-hidden bg-paper text-stone-950 md:h-svh"
        >
            <div className="mx-auto w-full max-w-page px-4 pt-20 md:px-8 md:pt-[clamp(88px,12svh,112px)]">
                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                    <div>
                        <p className="text-[24px] leading-none font-semibold tracking-[-0.05em] text-stone-950/20 md:text-[40px]">
                            Let’s build together
                        </p>
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="mt-1 block text-[24px] leading-none font-semibold tracking-[-0.05em] text-stone-950 transition-opacity hover:opacity-80 md:text-[40px]"
                        >
                            {CONTACT_EMAIL}
                        </a>
                        <div className="mt-8 flex">
                            <WaitlistPill />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 md:flex md:items-start md:gap-24">
                        {COLUMNS.map((column) => (
                            <nav key={column.heading} aria-label={column.heading}>
                                <p className="text-[14px] leading-[1.2] tracking-[-0.01em] text-stone-500">
                                    {column.heading}
                                </p>
                                <ul className="mt-6 space-y-1.5">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                {...(link.href.startsWith("http") && {
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                })}
                                                className="text-[14px] leading-[1.2] tracking-[-0.01em] text-stone-950 transition-opacity hover:opacity-60"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-24 px-4 pb-5 md:mt-auto">
                <Wordmark />
            </div>
        </footer>
    );
}
