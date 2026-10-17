import type { Metadata } from "next";

import LandingPageShell from "@/components/new-landing/LandingPageShell";
import TeamHero from "@/components/new-landing/team/TeamHero";
import TeamLoop from "@/components/new-landing/team/TeamLoop";
import TeamRoster from "@/components/new-landing/team/TeamRoster";
import TeamStory from "@/components/new-landing/team/TeamStory";

export const metadata: Metadata = {
    title: "Team · Darwin",
    description: "The three people building Darwin, and what each of them owns.",
};

export default function TeamPage() {
    return (
        <LandingPageShell ctaTone="var(--color-emerald-600)">
            <TeamHero />
            <TeamRoster />
            <TeamStory />
            <TeamLoop />
        </LandingPageShell>
    );
}
