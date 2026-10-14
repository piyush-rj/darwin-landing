"use client";

import AgentQuestionCard from "@/components/playground/Issue/AgentQuestionCard";

const EXAMPLE_QUESTION = {
    label: "The agent is asking",
    prompt: "Should the Pay button stay disabled while the card is being checked?",
    options: ["Yes, show a spinner on the button", "No, enable it as soon as the card is valid"],
};

export default function AgentQuestionExample() {
    return (
        <div data-theme-pinned inert className="theme-playground light text-foreground">
            <AgentQuestionCard {...EXAMPLE_QUESTION} busy={false} onAnswer={() => {}} />
        </div>
    );
}
