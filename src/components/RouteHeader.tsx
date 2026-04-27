"use client";

interface RouteHeaderProps {
    label: string;
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    onHeadingTap?: () => void;
}

export function RouteHeader({
    label,
    leftContent,
    rightContent,
    onHeadingTap,
}: RouteHeaderProps) {
    const headerClasses = `
        text-xl font-bold
        ${onHeadingTap ? "cursor-pointer" : ""}
    `;

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0 shrink">
                {leftContent}
            </div>
            <h2
                className={`${headerClasses} text-center`}
                onClick={onHeadingTap}
                onKeyDown={
                    onHeadingTap
                        ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onHeadingTap();
                              }
                          }
                        : undefined
                }
                tabIndex={onHeadingTap ? 0 : undefined}
                role={onHeadingTap ? "button" : undefined}
            >
                {label}
            </h2>
            <div className="flex items-center gap-2 min-w-0 shrink justify-end">
                {rightContent}
            </div>
        </div>
    );
}
