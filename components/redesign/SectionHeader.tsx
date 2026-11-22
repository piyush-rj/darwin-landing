import FadeIn from "@/components/new-landing/FadeIn";

export default function SectionHeader({
    label,
    title,
    titleId,
    description,
}: {
    label: string;
    title: string;
    titleId: string;
    description: string;
}) {
    return (
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <FadeIn>
                <p className="text-[13px] text-stone-500">{label}</p>
                <h2
                    id={titleId}
                    className="mt-6 text-[44px] leading-[1.02] font-normal tracking-[-0.05em] text-balance text-stone-950 md:text-[64px]"
                >
                    {title}
                </h2>
            </FadeIn>
            <FadeIn delay={0.12} className="md:justify-self-end">
                <p className="max-w-[38ch] text-[16px] leading-[1.6] text-stone-500 md:pb-2 md:text-[17px]">
                    {description}
                </p>
            </FadeIn>
        </div>
    );
}
