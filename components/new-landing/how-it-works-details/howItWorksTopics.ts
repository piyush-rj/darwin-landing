export type HowItWorksTopic = {
    id: string;
    nav: string;
    headline: string;
    paragraphs: string[];
    credits: string;
};

export const HOW_IT_WORKS_TOPICS: HowItWorksTopic[] = [
    {
        id: "file-an-issue",
        nav: "File an issue",
        headline: "File the issue the way your team already works.",
        paragraphs: [
            "Write an issue on your board, ask Darwin chat to make one, or bring your issues in from GitHub. When you connect GitHub, your open issues come in once and new ones keep arriving on their own. You choose where they land: on the agent board, where Darwin starts right away, or in a team column, where a person picks them up.",
            "Start from a bug, feature or refactor template, or make your own. Add a priority, dates, tags and images. For UI work, paste a Figma link so Darwin builds to match the design.",
        ],
        credits:
            "A clear issue finishes faster. A vague one means more reading and more questions, so it uses more credits.",
    },
    {
        id: "auto-pilot-or-supervised",
        nav: "Auto Pilot or Supervised",
        headline: "Decide how much Darwin does on its own.",
        paragraphs: [
            "In Auto Pilot, Darwin fixes the issue and opens the pull request on its own. Use it for clear work you would hand to anyone on the team.",
            "In Supervised, Darwin writes a plan first and waits. Approve the plan, or reject it with notes on what to change. Use it for work where the approach matters.",
            "In both modes, Darwin asks instead of guessing when something is unclear. The question reaches you in the app, Slack or Telegram. Pick one of its options or type your own answer. Darwin pauses while it waits, so waiting costs nothing.",
        ],
        credits:
            "Supervised runs once to plan and once to build, and every change you ask for in the plan is another run.",
    },
    {
        id: "how-a-fix-is-made",
        nav: "How a fix is made",
        headline: "Every fix is built and checked in a fresh copy of your code.",
        paragraphs: [
            "Each run gets its own fresh copy of your code, so one fix never mixes with another. The copy is deleted when the run ends.",
            "Darwin runs your lint and typecheck before it opens a pull request. For bugs, bug proof writes a test that fails before the fix and passes after, and puts the result in the pull request. Bug proof is on by default and can be turned off for a project.",
            "You can watch every step in the live logs: files read and edited, commands, commits. Secrets are hidden from the logs.",
        ],
        credits: "Bug proof writes and runs an extra test, so bug fixes use more credits.",
    },
    {
        id: "review-and-merge",
        nav: "Review and merge",
        headline: "Review it like a teammate's pull request.",
        paragraphs: [
            "Read the diff in split or unified view. Comments sync with GitHub both ways, and you can merge or close the pull request without leaving Darwin.",
            "If it is not right yet, ask for another commit, or reopen the issue with notes on what is still wrong. Darwin reads what earlier tries did before it starts again. Nothing ships until you merge.",
        ],
        credits: "Every extra commit or reopen is a new run.",
    },
    {
        id: "ui-changes-and-figma",
        nav: "UI changes and Figma",
        headline: "See UI changes before you merge.",
        paragraphs: [
            "Product Diff shows each changed screen before and after, side by side, at different screen sizes. Pin a comment right on the screen and send it back to Darwin, up to 30 comments a round. Each comment shows where it is: waiting, working, done or couldn't do.",
            "Product Diff works on frontend changes. Some components can't be shown on their own and are skipped. Figma links need Figma connected, and your Figma token stays on our server. The agent never sees it.",
        ],
        credits:
            "Product Diff builds a preview of every changed screen, and every round of comments is another run.",
    },
    {
        id: "what-uses-credits",
        nav: "What uses credits",
        headline: "Know what uses more credits before you see the bill.",
        paragraphs: [
            "These use more credits: a bigger model or higher effort, Supervised mode and each plan change, bug proof, Figma links, Product Diff and each round of comments, extra commits and reopens, and vague issues that need more reading and more questions.",
            "To keep it low, write clear issues, use a smaller model or lower effort for easy work, and answer Darwin's questions quickly.",
        ],
        credits: "Waiting for your answer is free. Darwin pauses until you reply.",
    },
    {
        id: "team-and-safety",
        nav: "Team and safety",
        headline: "You stay in control of your code.",
        paragraphs: [
            "You choose which repos Darwin can reach, and you can take that access back at any time.",
            "Roles decide who does what. Org roles are owner, admin, member and billing. Project roles decide who can file issues, change settings and merge. Invite up to 50 people at once.",
        ],
        credits: "Roles don't change credits. Only runs do.",
    },
];
