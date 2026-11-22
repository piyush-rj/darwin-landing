import { cn } from "@/lib/utils";

import { PAGE_CONTAINER } from "./pageContainer";
import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
    return (
        <section id="waitlist" className="py-32 md:py-44">
            <div className={cn(PAGE_CONTAINER, "flex flex-col items-center text-center")}>
                <h2 className="font-editorial text-[36px] leading-[1.15] font-medium tracking-[-0.03em] md:text-[56px]">
                    Get early access
                </h2>
                <p className="mt-4 max-w-[30rem] text-[17px] leading-[1.5] tracking-[-0.01em] text-stone-600">
                    Darwin is in private beta with TypeScript teams. Leave your email and we will
                    reach out when there is room.
                </p>
                <WaitlistForm className="mt-10 w-full max-w-[420px]" />
            </div>
        </section>
    );
}
