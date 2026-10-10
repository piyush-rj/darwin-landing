import type { Metadata } from "next";

import LandingPageShell from "@/components/new-landing/LandingPageShell";
import TeamSection from "@/components/new-landing/TeamSection";

export const metadata: Metadata = {
    title: "Team · Darwin",
    description: "The people building Darwin.",
};

export default function TeamPage() {
    return (
        <LandingPageShell>
            <TeamSection />
        </LandingPageShell>
    );
}
