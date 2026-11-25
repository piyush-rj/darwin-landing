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

export default function Footer() {
    return (
        <footer
            id="footer"
            className="sticky bottom-0 z-0 flex w-full flex-col overflow-hidden bg-paper text-stone-950 md:min-h-[500px]"
        >
            <div className="mx-auto w-full max-w-page px-4 pt-16 pb-16 md:px-8 md:pt-16 md:pb-24">
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
        </footer>
    );
}
