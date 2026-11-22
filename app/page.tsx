import ControlSection from "@/components/redesign/ControlSection";
import FloatingNavbar from "@/components/redesign/FloatingNavbar";
import HeroSection from "@/components/redesign/hero/HeroSection";
import HowItWorksSection from "@/components/redesign/HowItWorksSection";
import InsideDarwinSection from "@/components/redesign/InsideDarwinSection";
import ProblemGlobeSection from "@/components/redesign/problem-globe/ProblemGlobeSection";
import LenisProvider from "@/providers/LenisProvider";

export default function Home() {
    return (
        <LenisProvider>
            <div className="min-h-screen w-full bg-paper font-body text-stone-950">
                <FloatingNavbar />
                <main className="overflow-x-clip">
                    <HeroSection />
                    <ProblemGlobeSection />
                    <HowItWorksSection />
                    <InsideDarwinSection />
                    <ControlSection />
                </main>
            </div>
        </LenisProvider>
    );
}
