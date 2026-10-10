import RollingText from "@/components/utility/RollingText";

import LiveBoardPanel from "./problem/LiveBoardPanel";
import StaleBacklogPanel from "./problem/StaleBacklogPanel";

const MONO_LABEL = "font-mono text-[11px] tracking-[0.12em] text-neutral-500 uppercase";

export default function ProblemSection() {
    return (
        <section id="problem" className="w-full border-b border-edge bg-ink">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="border-edge px-6 pt-20 pb-12 md:px-9 lg:border-r lg:pt-28">
                    <p className={MONO_LABEL}>The problem</p>
                    <h2 className="mt-5 max-w-[18ch] text-[40px] leading-[1] font-medium tracking-[-0.04em] text-foreground sm:text-[52px] lg:text-[60px]">
                        <RollingText text="Your backlog grows faster than you can ship." />
                    </h2>
                </div>
                <div className="flex items-end bg-mist px-6 py-10 max-lg:border-t max-lg:border-edge md:px-9">
                    <p className="max-w-[30ch] text-[19px] leading-[1.35] tracking-[-0.01em] text-foreground">
                        Most of what sits in an issue tracker is small, well-understood work. It
                        still waits for an engineer, a context switch and a review cycle.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 border-t border-edge md:grid-cols-2">
                <div className="border-edge max-md:border-b md:border-r">
                    <StaleBacklogPanel />
                </div>
                <LiveBoardPanel />
            </div>
        </section>
    );
}
