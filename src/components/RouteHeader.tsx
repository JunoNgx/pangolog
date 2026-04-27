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
        <div className="mb-4 flex min-h-8 items-center">
            <div className="flex flex-1 items-center gap-2">{leftContent}</div>
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
            <div className="flex flex-1 items-center justify-end gap-2">
                {rightContent}
            </div>
        </div>
    );
}
