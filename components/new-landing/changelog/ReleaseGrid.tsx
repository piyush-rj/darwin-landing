import FadeIn from "@/components/new-landing/FadeIn";

import { RELEASES } from "./releases";

export default function ReleaseGrid() {
    return (
        <section className="grid w-full grid-cols-1 gap-px border-b border-edge bg-edge md:grid-cols-2 lg:grid-cols-3">
            {RELEASES.map((release, index) => (
                <FadeIn key={release.title} delay={(index % 3) * 0.08} className="bg-ink">
                    <article className="flex h-full min-h-[19rem] flex-col px-6 py-8 transition-colors duration-300 hover:bg-mist md:px-9 md:py-10">
                        <h2 className="max-w-[22ch] text-[22px] leading-[1.15] font-medium tracking-[-0.02em] text-foreground">
                            {release.title}
                        </h2>
                        <span className="mt-5 w-fit rounded-[4px] border border-foreground/25 px-1.5 py-0.5 text-[11px] text-foreground/80">
                            {release.tag}
                        </span>
                        <p className="mt-4 max-w-[36ch] text-[14px] leading-relaxed text-neutral-500">
                            {release.note}
                        </p>
                        <div className="mt-auto flex items-end justify-between pt-10 text-[12px] leading-tight">
                            <p className="text-neutral-500">
                                Shipped by
                                <span className="block text-foreground italic">{release.team}</span>
                            </p>
                            <p className="text-foreground">{release.date}</p>
                        </div>
                    </article>
                </FadeIn>
            ))}
        </section>
    );
}
