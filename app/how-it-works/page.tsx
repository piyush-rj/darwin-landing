import type { Metadata } from "next";

import HowItWorksPageHero from "@/components/new-landing/HowItWorksPageHero";
import LandingPageShell from "@/components/new-landing/LandingPageShell";

export const metadata: Metadata = {
    title: "How it works · Darwin",
    description: "Four steps from a filed issue to a tested pull request.",
};

export default function HowItWorksPage() {
    return (
        <LandingPageShell>
            <HowItWorksPageHero />
        </LandingPageShell>
    );
}
