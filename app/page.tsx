import HowItWorksSection from "@/components/new-landing/HowItWorksSection";
import LandingHeroSection from "@/components/new-landing/LandingHeroSection";
import LandingPageShell from "@/components/new-landing/LandingPageShell";
import ProblemSection from "@/components/new-landing/ProblemSection";
import ProductVideoSection from "@/components/new-landing/ProductVideoSection";
import SectionDivider from "@/components/new-landing/SectionDivider";
import StackSecuritySection from "@/components/new-landing/StackSecuritySection";

export default function Home() {
    return (
        <LandingPageShell>
            <LandingHeroSection />
            <SectionDivider />
            <ProductVideoSection />
            <SectionDivider />
            <ProblemSection />
            <SectionDivider />
            <HowItWorksSection />
            <SectionDivider />
            <StackSecuritySection />
        </LandingPageShell>
    );
}
