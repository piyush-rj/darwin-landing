import type { ReactNode } from "react";

import { CtaArrowIcon } from "@/components/icons";
import SectionDivider from "@/components/new-landing/SectionDivider";
import RollingText from "@/components/utility/RollingText";

export default function CtaSection({ children }: { children: ReactNode }) {
    return (
        <div>
            <SectionDivider />

            <div className="overflow-clip">
                <div aria-hidden className="h-88" />

                <div className="sticky bottom-0">
                    <section
                        id="get-started"
                        className="absolute inset-x-0 bottom-full flex h-88 items-end justify-between border-b border-edge bg-primary text-center md:px-9 px-8 py-16"
                    >
                        <div className="grain-strong pointer-events-none absolute inset-0 opacity-12" />

                        <h2 className="relative text-[34px] max-w-3xl text-left text-balance leading-[1.05] font-medium tracking-[-0.04em] text-snow sm:text-[44px] lg:text-[50px]">
                            <RollingText
                                text={"Hand any issue to Darwin\nand wake up to a pull request."}
                            />
                        </h2>

                        <div className="relative">
                            <button
                                type="button"
                                className="flex h-full cursor-pointer items-center gap-2 bg-foreground pl-4 pr-3 py-2 text-[14px] scale-105 font-medium text-snow transition-opacity hover:opacity-90"
                            >
                                Get started
                                <CtaArrowIcon className="size-4" />
                            </button>
                        </div>
                    </section>

                    <SectionDivider />

                    {children}
                </div>
            </div>
        </div>
    );
}
