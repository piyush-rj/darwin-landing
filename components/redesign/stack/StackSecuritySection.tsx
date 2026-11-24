import FadeIn from "@/components/new-landing/FadeIn";

import type { Drawing, Point } from "../sketch/sketch";
import Sketch from "../sketch/SketchLayer";
import {
    ARCADE_PLAQUES,
    drawArcade,
    drawChamber,
    drawDoor,
    FIGURE_HEIGHT,
    FIGURE_WIDTH,
    KEY_HOOK,
    PLAQUE_SIZE,
} from "./stackDrawings";

type Card = {
    title: string;
    body: string;
    drawing: Drawing[];
    marks: Point[];
    alt: string;
};

const INTEGRATIONS = [
    { name: "github", scale: 1 },
    { name: "slack", scale: 1.8 },
    { name: "figma", scale: 1 },
];

const CARDS: Card[] = [
    {
        title: "Fits your stack",
        body: "Darwin works where your team already works: GitHub for the code, Slack for its questions, Figma for the designs it is matching. Access is granted per repository and can be taken back at any time.",
        drawing: drawArcade(),
        marks: [
            [300, 374],
            [36, 626],
            [564, 226],
        ],
        alt: "A pencil drawing of a classical arcade with GitHub, Slack and Figma plaques hanging in its arches.",
    },
    {
        title: "Runs in a sandbox",
        body: "Every fix runs in its own runner: a clean clone of your repository, your dependencies, your test suite. Nothing touches your machines, and nothing ships on a guess.",
        drawing: drawChamber(),
        marks: [
            [196, 232],
            [404, 456],
            [300, 560],
        ],
        alt: "A pencil drawing of a bare chamber in one-point perspective with a single closed door and a workbench.",
    },
    {
        title: "You hold the keys",
        body: "Darwin never pushes to main. Each fix arrives as a pull request with its checks attached, and only a person on your team can merge it.",
        drawing: drawDoor(),
        marks: [
            [300, 160],
            [146, 342],
            [560, 668],
        ],
        alt: "A pencil drawing of a townhouse front door with a fanlight, a brass lock and a key hanging on a hook beside it.",
    },
];

function RegistrationMark({ x, y }: { x: number; y: number }) {
    return (
        <g className="text-amber-500">
            <path
                d={`M${x - 8} ${y}H${x + 8}M${x} ${y - 8}V${y + 8}`}
                stroke="currentColor"
                strokeWidth={1.3}
                strokeLinecap="round"
            />
            <circle cx={x} cy={y} r={1.8} fill="currentColor" />
        </g>
    );
}

function Figure({ card, index }: { card: Card; index: number }) {
    return (
        <svg
            viewBox={`0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`}
            role="img"
            aria-label={card.alt}
            className="block w-full bg-parchment text-stone-800"
        >
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <Sketch drawings={card.drawing} />
            </g>
            {index === 0 &&
                ARCADE_PLAQUES.map(([x, y], plaque) => {
                    const { name, scale } = INTEGRATIONS[plaque];
                    const size = (PLAQUE_SIZE - 26) * scale;
                    return (
                        <image
                            key={name}
                            href={`/images/integrations/${name}.svg`}
                            x={x - size / 2}
                            y={y - size / 2}
                            width={size}
                            height={size}
                        />
                    );
                })}
            {index === 1 && (
                <text
                    x={300}
                    y={268}
                    textAnchor="middle"
                    className="fill-stone-600 font-mono text-[9px] tracking-[0.2em]"
                >
                    RUNNER 07
                </text>
            )}
            {index === 2 && (
                <text
                    x={KEY_HOOK[0] + 6}
                    y={KEY_HOOK[1] + 128}
                    textAnchor="middle"
                    className="fill-stone-600 font-mono text-[9px] tracking-[0.2em]"
                >
                    MAIN
                </text>
            )}
            {card.marks.map(([x, y]) => (
                <RegistrationMark key={`${x}-${y}`} x={x} y={y} />
            ))}
        </svg>
    );
}

export default function StackSecuritySection() {
    return (
        <section
            id="stack"
            aria-labelledby="stack-title"
            className="w-full bg-cocoa px-4 py-24 text-parchment md:px-8 md:py-36"
        >
            <div className="mx-auto max-w-page">
                <div className="grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-end md:gap-16">
                    <FadeIn>
                        <p className="text-[13px] text-parchment/60">Your stack, your rules</p>
                        <h2
                            id="stack-title"
                            className="mt-6 text-[44px] leading-[1.02] font-normal tracking-[-0.05em] text-balance text-parchment md:text-[64px]"
                        >
                            Fits your stack. Keeps your code safe.
                        </h2>
                    </FadeIn>
                    <FadeIn delay={0.12} className="md:justify-self-end">
                        <p className="max-w-[38ch] text-[16px] leading-[1.6] text-parchment/70 md:pb-2 md:text-[17px]">
                            Darwin works inside the tools your team already uses, in a runner you
                            never have to think about, with access you grant and can take back.
                        </p>
                    </FadeIn>
                </div>

                <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-3 md:gap-8">
                    {CARDS.map((card, index) => (
                        <FadeIn key={card.title} delay={index * 0.1}>
                            <figure className="flex h-full flex-col bg-cocoa-card p-3 ring-1 ring-parchment/8">
                                <Figure card={card} index={index} />
                                <figcaption className="flex flex-1 flex-col px-2 pt-6 pb-3">
                                    <p className="text-[21px] leading-[1.2] font-medium tracking-[-0.025em] text-parchment">
                                        {card.title}
                                    </p>
                                    <p className="mt-2 text-[14px] leading-snug text-parchment/70">
                                        {card.body}
                                    </p>
                                </figcaption>
                            </figure>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
