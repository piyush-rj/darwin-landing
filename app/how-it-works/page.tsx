import type { Metadata } from "next";

import BeachBreakSection from "@/components/new-landing/BeachBreakSection";
import HowItWorksDetailsSection from "@/components/new-landing/how-it-works-details/HowItWorksDetailsSection";
import HowItWorksPathSection from "@/components/new-landing/HowItWorksPathSection";
import HowItWorksSplitHero from "@/components/new-landing/HowItWorksSplitHero";
import LandingPageShell from "@/components/new-landing/LandingPageShell";

export const metadata: Metadata = {
    title: "How it works · Darwin",
    description: "Four steps from a filed issue to a tested pull request.",
};

export default function HowItWorksPage() {
    return (
        <LandingPageShell ctaTone="#3B82F6">
            <HowItWorksSplitHero />
            <HowItWorksPathSection />
            <HowItWorksDetailsSection />
            <BeachBreakSection />
        </LandingPageShell>
    );
}
