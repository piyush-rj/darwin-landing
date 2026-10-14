import FadeIn from "@/components/new-landing/FadeIn";
import RollingText from "@/components/utility/RollingText";

import { RELEASES } from "./releases";

const MONO_LABEL = "font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase";

export default function ChangelogHero() {
    const latest = RELEASES[0];

    return (
        <section className="grid w-full border-b border-edge bg-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="border-edge px-6 pt-20 pb-12 md:px-9 lg:border-r lg:pt-28">
                <p className={MONO_LABEL}>Changelog</p>
                <h1 className="mt-5 max-w-[16ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                    <RollingText text="Everything we shipped, week by week." />
                </h1>
            </div>
            <div className="flex flex-col justify-end gap-6 bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                <FadeIn delay={0.15}>
                    <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                        New features, fixes and improvements to Darwin, in the order they reached
                        your board.
                    </p>
                </FadeIn>
                <FadeIn delay={0.25}>
                    <p className={MONO_LABEL}>
                        Latest · <span className="text-foreground">{latest.date}</span>
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}
