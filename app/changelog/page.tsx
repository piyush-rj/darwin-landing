import type { Metadata } from "next";

import ChangelogHero from "@/components/new-landing/changelog/ChangelogHero";
import ReleaseGrid from "@/components/new-landing/changelog/ReleaseGrid";
import SubscribeBanner from "@/components/new-landing/changelog/SubscribeBanner";
import LandingPageShell from "@/components/new-landing/LandingPageShell";

export const metadata: Metadata = {
    title: "Changelog · Darwin",
    description: "New features, fixes and improvements to Darwin, week by week.",
};

export default function ChangelogPage() {
    return (
        <LandingPageShell>
            <ChangelogHero />
            <ReleaseGrid />
            <SubscribeBanner />
        </LandingPageShell>
    );
}
