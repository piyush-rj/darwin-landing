const ROLL_GLYPHS = "ABCDEFGHKLMNOPRSTUVXYZ";
const ROLL_STEPS = [1, 2, 3, 4];
const LETTER_DELAY_MS = 28;

export const ROLL_TRIGGER =
    "group relative inline-flex cursor-pointer items-center text-[13px] font-medium tracking-[0.06em] whitespace-nowrap uppercase outline-none [--roll:0] focus-visible:[--roll:1] motion-safe:hover:[--roll:1]";
const PILL =
    "inline-flex h-12 items-center rounded-[8px] px-5 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-sky-400";

const BRIDGE_HEIGHT = 26;
const BRIDGE_CURVE_DEPTH = 9;

function bridgeOutline(width: number) {
    const curve = `A ${width / 2} ${BRIDGE_CURVE_DEPTH} 0 0 0`;
    return `path("M 0 0 ${curve} ${width} 0 V ${BRIDGE_HEIGHT} ${curve} 0 ${BRIDGE_HEIGHT} Z")`;
}

function rollingGlyphs(letter: string, position: number) {
    return ROLL_STEPS.map(
        (step) =>
            ROLL_GLYPHS[(letter.charCodeAt(0) * 7 + position * 11 + step * 5) % ROLL_GLYPHS.length],
    );
}

export function RollingLabel({ text, delayOffset = 0 }: { text: string; delayOffset?: number }) {
    return (
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden className="flex items-center">
                {[...text].map((letter, index) => {
                    const position = delayOffset + index;
                    if (letter === " ") return <span key={index} className="w-[0.32em]" />;
                    return (
                        <span
                            key={index}
                            className="relative inline-block h-[1em] overflow-hidden leading-none"
                        >
                            <span className="invisible">{letter}</span>
                            <span
                                className="absolute inset-x-0 top-0 flex flex-col items-center motion-safe:transition-transform"
                                style={{
                                    transform: "translateY(calc(var(--roll) * -5em))",
                                    transitionDuration: "520ms",
                                    transitionDelay: `calc(var(--roll) * ${position * LETTER_DELAY_MS}ms)`,
                                    transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                                }}
                            >
                                {[letter, ...rollingGlyphs(letter, position), letter].map(
                                    (glyph, step) => (
                                        <span key={step} className="block h-[1em] leading-none">
                                            {glyph}
                                        </span>
                                    ),
                                )}
                            </span>
                        </span>
                    );
                })}
            </span>
        </>
    );
}

export function TicketBridge({
    fill = "bg-current",
    width = 6,
}: {
    fill?: string;
    width?: number;
}) {
    return (
        <span
            aria-hidden
            className={`-mx-px shrink-0 text-stone-900 transition-colors group-hover:text-stone-950 ${fill}`}
            style={{ width, height: BRIDGE_HEIGHT, clipPath: bridgeOutline(width) }}
        />
    );
}

export function PingDot() {
    return (
        <span aria-hidden className="absolute top-2 right-2 flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-500 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-orange-500" />
        </span>
    );
}

export function SolidTicketButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className={ROLL_TRIGGER}>
            <span className={`${PILL} bg-stone-900 text-snow group-hover:bg-stone-950`}>
                <RollingLabel text={label} />
            </span>
            <PingDot />
        </button>
    );
}

export function PlainTicketLink({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} className={ROLL_TRIGGER}>
            <span className={`${PILL} bg-stone-200 text-stone-900 group-hover:bg-stone-300`}>
                <RollingLabel text={label} />
            </span>
        </a>
    );
}
