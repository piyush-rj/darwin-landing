import type { IconType } from "react-icons";
import { FaAutoprefixer } from "react-icons/fa";
import { LuFileText, LuSquareTerminal } from "react-icons/lu";
import { PiCursorFill } from "react-icons/pi";

import { createIcon } from "./createIcon";

export const CommandIcon = createIcon(LuSquareTerminal);

export const FileIcon = createIcon(LuFileText);

export const AutonomousModeIcon = createIcon(FaAutoprefixer);

const CalendarGlyph: IconType = ({ size = "1em", title, ...props }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
        {title && <title>{title}</title>}
        <path
            d="M3 10.25V8.5A4.5 4.5 0 0 1 7.5 4h9A4.5 4.5 0 0 1 21 8.5v1.75z"
            fill="currentColor"
        />
        <rect
            x="3.75"
            y="4.75"
            width="16.5"
            height="15.5"
            rx="3.75"
            stroke="currentColor"
            strokeWidth="1.5"
        />
        <path
            d="M8 2.25v3M16 2.25v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <circle cx="8.5" cy="14.25" r="1.05" fill="currentColor" />
        <circle cx="12" cy="14.25" r="1.05" fill="currentColor" />
        <circle cx="8.5" cy="17.25" r="1.05" fill="currentColor" />
    </svg>
);

export const CalendarIcon = createIcon(CalendarGlyph);

export const PointerCursorIcon = createIcon(PiCursorFill);
