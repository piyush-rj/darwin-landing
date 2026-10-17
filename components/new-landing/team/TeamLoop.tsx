import FadeIn from "@/components/new-landing/FadeIn";
import { MONO_LABEL } from "@/components/new-landing/landingType";
import RollingText from "@/components/utility/RollingText";

const LOOP_LINES = ["Rishi files it.", "Anjan runs it.", "Piyush shapes it."];

export default function TeamLoop() {
    return (
        <section className="flex w-full flex-col items-center border-b border-edge bg-ink px-6 py-20 text-center md:py-28">
            <FadeIn y={8}>
                <p className={MONO_LABEL}>The loop</p>
            </FadeIn>
            <h2 className="mt-6 text-[34px] leading-[1.05] font-medium tracking-[-0.035em] text-foreground sm:text-[44px] lg:text-[52px]">
                {LOOP_LINES.map((line) => (
                    <span key={line} className="block">
                        <RollingText text={line} />
                    </span>
                ))}
            </h2>
        </section>
    );
}
