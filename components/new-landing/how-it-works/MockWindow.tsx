import type { ReactNode } from "react";

export default function MockWindow({
    title,
    status,
    children,
}: {
    title: ReactNode;
    status?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="absolute top-[12%] -right-2.5 -bottom-8 left-[7%] bg-snow/40 p-2.5">
            <div className="flex h-full flex-col overflow-hidden border border-foreground/10 bg-snow">
                <div className="flex h-11 shrink-0 items-center gap-2 border-b border-foreground/10 px-4 text-[12px] text-foreground">
                    {title}
                    {status && (
                        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                            {status}
                        </span>
                    )}
                </div>
                <div className="min-h-0 flex-1">{children}</div>
            </div>
        </div>
    );
}
