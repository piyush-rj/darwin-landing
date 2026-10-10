import CtaSection from "@/components/new-landing/CtaSection";
import HowItWorksSection from "@/components/new-landing/HowItWorksSection";
import LandingHeroSection from "@/components/new-landing/LandingHeroSection";
import LandingThemeGuard from "@/components/new-landing/LandingThemeGuard";
import NewLandingFooter from "@/components/new-landing/NewLandingFooter";
import NewLandingNavbar from "@/components/new-landing/NewLandingNavbar";
import ProblemSection from "@/components/new-landing/ProblemSection";
import SectionDivider from "@/components/new-landing/SectionDivider";
import StackSecuritySection from "@/components/new-landing/StackSecuritySection";
import LenisProvider from "@/providers/LenisProvider";

export default function Home() {
    return (
        <LenisProvider>
            <main
                data-landing-root
                suppressHydrationWarning
                className="theme-light min-h-screen w-full bg-ink text-foreground"
            >
                <LandingThemeGuard />
                <div className="[--color-edge:color-mix(in_oklab,var(--color-foreground)_12%,var(--color-snow))]">
                    <NewLandingNavbar />
                    <LandingHeroSection />
                    <SectionDivider />
                    <ProblemSection />
                    <SectionDivider />
                    <HowItWorksSection />
                    <SectionDivider />
                    <StackSecuritySection />
                    <CtaSection>
                        <NewLandingFooter />
                    </CtaSection>
                </div>
            </main>
        </LenisProvider>
    );
}
