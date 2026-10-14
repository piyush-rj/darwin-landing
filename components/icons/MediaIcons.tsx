import {
    MdFullscreen,
    MdFullscreenExit,
    MdPause,
    MdPlayArrow,
    MdVolumeOff,
    MdVolumeUp,
} from "react-icons/md";

import { createIcon } from "./createIcon";

export const VideoPlayIcon = createIcon(MdPlayArrow);

export const VideoPauseIcon = createIcon(MdPause);

export const VideoMutedIcon = createIcon(MdVolumeOff);

export const VideoSoundIcon = createIcon(MdVolumeUp);

export const VideoFullscreenIcon = createIcon(MdFullscreen);

export const VideoExitFullscreenIcon = createIcon(MdFullscreenExit);
