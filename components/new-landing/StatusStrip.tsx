import { motion, type MotionValue } from "motion/react";

import StatusBlock, { STATUS_BLOCK_ORDER } from "./StatusBlock";

export default function StatusStrip({ reveal }: { reveal: MotionValue<number>[] }) {
    return (
        <div className="flex gap-2.5 pb-1">
            {STATUS_BLOCK_ORDER.map((status, index) => (
                <motion.span key={status} style={{ opacity: reveal[index] }}>
                    <StatusBlock status={status} className="size-7" iconClassName="size-[14px]" />
                </motion.span>
            ))}
        </div>
    );
}
