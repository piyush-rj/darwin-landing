import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";

export default function TeamHero() {
    return (
        <section className="grid w-full grid-cols-1 border-b border-edge bg-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
            <div className="px-6 pt-16 pb-12 md:px-9 lg:pt-24 lg:pb-16">
                <p className={MONO_LABEL}>Team</p>
                <h1 className="mt-5 max-w-[15ch] text-[44px] leading-[0.98] font-medium tracking-[-0.04em] text-foreground sm:text-[56px] lg:text-[68px]">
                    <RollingText text="The humans behind the agent." />
                </h1>
            </div>
            <div className="flex items-end border-edge bg-mist px-6 py-10 max-lg:border-t md:px-9 lg:border-l">
                <FadeIn delay={0.15}>
                    <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                        We are building the teammate we always wanted: one that takes the issue and
                        comes back with a pull request.
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}
