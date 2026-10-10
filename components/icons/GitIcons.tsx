import { FaGithub } from "react-icons/fa6";
import { GoGitCommit, GoGitMerge, GoGitPullRequest } from "react-icons/go";

import { createIcon } from "./createIcon";

export const CommitsIcon = createIcon(GoGitCommit);

export const GithubLogoIcon = createIcon(FaGithub);

export const MergeIcon = createIcon(GoGitMerge);

export const PullRequestOpenIcon = createIcon(GoGitPullRequest);
