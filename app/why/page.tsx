import type { Metadata } from "next";

import LandingPageShell from "@/components/new-landing/LandingPageShell";
import CompareSection from "@/components/new-landing/why/CompareSection";
import LayersSection from "@/components/new-landing/why/LayersSection";
import StoryScroll from "@/components/new-landing/why/StoryScroll";
import WhyHero from "@/components/new-landing/why/WhyHero";

export const metadata: Metadata = {
    title: "Why Darwin · Darwin",
    description:
        "Every team carries a long tail of small issues that never make the sprint. Darwin works through them and hands each one back as a tested pull request.",
};

export default function WhyPage() {
    return (
        <LandingPageShell
            ctaTone="#F59E0B"
            ctaText={"The backlog won't clear itself.\nDarwin clears it."}
        >
            <WhyHero />
            <StoryScroll />
            <LayersSection />
            <CompareSection />
        </LandingPageShell>
    );
}
