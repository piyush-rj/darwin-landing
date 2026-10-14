export type Release = {
    title: string;
    tag: string;
    note: string;
    team: string;
    date: string;
};

export const RELEASES: Release[] = [
    {
        title: "Bug-proof fixes: a failing test before every change",
        tag: "Agent",
        note: "Darwin reproduces the bug with a test that fails, then proves the fix by making it pass.",
        team: "Agent Core",
        date: "Oct 2026",
    },
    {
        title: "Point at the broken pixel with visual diff comments",
        tag: "Review",
        note: "Leave a comment on a screenshot of the change. Darwin reads it and pushes another commit.",
        team: "Web",
        date: "Oct 2026",
    },
    {
        title: "Ask Darwin, redesigned with chat history and voice",
        tag: "Ask Darwin",
        note: "Searchable chat history that survives a refresh, and dictation that types where your cursor is.",
        team: "Web",
        date: "Sep 2026",
    },
    {
        title: "One sandboxed runner per fix, gone when the run ends",
        tag: "Runners",
        note: "Every change is built and tested in a fresh runner cloned from your repo, then destroyed.",
        team: "Runners",
        date: "Sep 2026",
    },
    {
        title: "File issues from Slack, Telegram, Figma and GitHub",
        tag: "Integrations",
        note: "Report a bug wherever your team already talks. It lands on the same board as everything else.",
        team: "Ingest",
        date: "Sep 2026",
    },
    {
        title: "Choose the agent, model and effort for each issue",
        tag: "Agent",
        note: "Pick Claude or Codex, the model and how hard it should think. Turn autonomous mode on or off per issue.",
        team: "Agent Core",
        date: "Aug 2026",
    },
    {
        title: "Agent logs streamed live into every issue",
        tag: "Agent",
        note: "Follow each attempt as it happens: what Darwin read, ran and changed, right under the activity feed.",
        team: "Agent Core",
        date: "Aug 2026",
    },
    {
        title: "Review and merge pull requests without leaving Darwin",
        tag: "Review",
        note: "Read the summary, the diff and the checks, then squash and merge from the issue itself.",
        team: "Web",
        date: "Aug 2026",
    },
    {
        title: "Two-step onboarding: your organization, then a project",
        tag: "Onboarding",
        note: "Create a workspace and connect a GitHub repository in under a minute.",
        team: "Platform",
        date: "Jul 2026",
    },
];
