import { type MotionValue } from "motion/react";
import * as m from "motion/react-m";

import StatusBlock from "./StatusBlock";
import { STATUS_BLOCK_ORDER } from "./statusSprites";

export default function StatusStrip({ reveal }: { reveal: MotionValue<number>[] }) {
    return (
        <div className="flex gap-2.5">
            {STATUS_BLOCK_ORDER.map((status, index) => (
                <m.span key={status} style={{ opacity: reveal[index] }}>
                    <StatusBlock status={status} scale={2} />
                </m.span>
            ))}
        </div>
    );
}
