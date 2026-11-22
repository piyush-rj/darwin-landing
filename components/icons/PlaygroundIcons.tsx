import {
    LuBell,
    LuBot,
    LuChartGantt,
    LuChevronDown,
    LuCircleUser,
    LuFlag,
    LuGitBranch,
    LuInbox,
    LuListFilter,
    LuLoaderCircle,
    LuMessagesSquare,
    LuMoon,
    LuPlus,
    LuSettings,
    LuSlidersHorizontal,
    LuSquareKanban,
    LuSquarePen,
    LuTag,
    LuTerminal,
} from "react-icons/lu";

import { createIcon } from "./createIcon";

export const AgentNavIcon = createIcon(LuBot);

export const InboxNavIcon = createIcon(LuInbox);

export const MyIssuesNavIcon = createIcon(LuCircleUser);

export const ChatsNavIcon = createIcon(LuMessagesSquare);

export const KanbanNavIcon = createIcon(LuSquareKanban);

export const MilestonesNavIcon = createIcon(LuFlag);

export const GanttNavIcon = createIcon(LuChartGantt);

export const LabelsNavIcon = createIcon(LuTag);

export const FilterIcon = createIcon(LuListFilter);

export const DisplayOptionsIcon = createIcon(LuSlidersHorizontal);

export const PlusIcon = createIcon(LuPlus);

export const ChevronDownIcon = createIcon(LuChevronDown);

export const BellIcon = createIcon(LuBell);

export const SettingsIcon = createIcon(LuSettings);

export const ComposeIcon = createIcon(LuSquarePen);

export const MoonIcon = createIcon(LuMoon);

export const SpinnerIcon = createIcon(LuLoaderCircle);

export const GitBranchIcon = createIcon(LuGitBranch);

export const TerminalIcon = createIcon(LuTerminal);
