import type { ReactNode } from "react";

export default function HeroPanel({
    eyebrow,
    title,
    action,
    children,
}: {
    eyebrow: string;
    title: string;
    action: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col">
            <div className="flex items-end justify-between gap-6">
                <p className="text-[20px] leading-[1.2] tracking-[-0.02em] md:text-[24px]">
                    <span className="block text-stone-500">{eyebrow}</span>
                    <span className="block font-medium text-stone-950">{title}</span>
                </p>
                <div className="shrink-0">{action}</div>
            </div>
            <div className="relative mt-6 h-[380px] overflow-hidden rounded-[4px] bg-plate md:h-[432px]">
                <div className="absolute top-8 right-0 -bottom-6 left-6 sm:top-10 sm:left-14">
                    {children}
                </div>
            </div>
        </div>
    );
}
