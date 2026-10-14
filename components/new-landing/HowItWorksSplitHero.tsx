import { CtaArrowIcon } from "@/components/icons";
import FadeIn from "@/components/new-landing/FadeIn";
import HowItWorksCanvas from "@/components/new-landing/HowItWorksCanvas";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";

export default function HowItWorksSplitHero() {
    return (
        <section className="grid w-full grid-cols-1 border-b border-edge lg:h-[calc(100svh-2.75rem)] lg:grid-cols-2">
            <div className="flex flex-col bg-ink px-6 pt-10 pb-12 text-foreground md:px-9 lg:pt-[18svh]">
                <p className={MONO_LABEL}>How it works</p>
                <h1 className="mt-10 max-w-[16ch] text-[48px] leading-[0.95] font-normal tracking-[-0.04em] sm:text-[64px] lg:text-[80px]">
                    <RollingText text="From filed issue to tested pull request." />
                </h1>
                <FadeIn delay={0.4} className="mt-auto pt-16">
                    <p className="max-w-[32ch] text-[20px] leading-[1.35] tracking-[-0.01em]">
                        File the issue where your team already talks. Darwin ships the fix as a PR.
                    </p>
                </FadeIn>
                <button
                    type="button"
                    className="mt-8 flex w-fit cursor-pointer items-center gap-3 bg-foreground px-5 py-3 text-[16px] text-ink transition-opacity hover:opacity-85"
                >
                    Join the waitlist
                    <CtaArrowIcon className="size-4" />
                </button>
            </div>

            <HowItWorksCanvas className="aspect-square lg:aspect-auto lg:h-full" />
        </section>
    );
}
