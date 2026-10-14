import WaitlistNavForm from "@/components/new-landing/WaitlistNavForm";

const RING_GAP = 7;
const RING_COUNT = 7;
const DOT_SPACING = 6.4;

const RINGS = Array.from({ length: RING_COUNT }, (_, index) => {
    const radius = RING_GAP * (index + 1);
    const count = Math.round((2 * Math.PI * radius) / DOT_SPACING);
    return Array.from({ length: count }, (_, dot) => {
        const angle = (dot / count) * Math.PI * 2;
        return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
    });
});

function DotRing() {
    return (
        <svg viewBox="-56 -56 112 112" aria-hidden className="size-56 shrink-0 md:size-64">
            {RINGS.flat().map((dot) => (
                <circle
                    key={`${dot.x}-${dot.y}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={1.55}
                    className="fill-foreground"
                />
            ))}
            <circle r={1.9} className="fill-snow" />
        </svg>
    );
}

export default function SubscribeBanner() {
    return (
        <section className="w-full border-b border-edge bg-ink px-6 py-10 md:px-9 md:py-14">
            <div className="relative overflow-hidden rounded-lg bg-primary px-8 py-10 md:px-12 md:py-14">
                <div className="grain-strong pointer-events-none absolute inset-0 opacity-12" />
                <span aria-hidden className="absolute top-4 left-4 size-2 rounded-full bg-snow" />
                <span aria-hidden className="absolute top-4 right-4 size-2 rounded-full bg-snow" />

                <div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col">
                        <h2 className="max-w-[18ch] text-[34px] leading-[1.05] font-medium tracking-[-0.04em] text-foreground sm:text-[44px]">
                            Get every release before it reaches the changelog.
                        </h2>
                        <div className="mt-12 flex flex-col gap-5 md:ml-[22%]">
                            <p className="max-w-sm text-[14px] leading-relaxed text-foreground/80">
                                Join the waitlist for early access. We send one short note when
                                something worth trying ships, and nothing else.
                            </p>
                            <div className="flex h-11 w-full max-w-md bg-ink">
                                <WaitlistNavForm />
                            </div>
                        </div>
                    </div>
                    <DotRing />
                </div>
            </div>
        </section>
    );
}
