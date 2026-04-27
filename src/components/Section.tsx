interface SectionProps {
    title: string;
    children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
    return (
        <section className="mb-8">
            <h2 className="text-default-700 mb-3 text-base font-semibold">
                {title}
            </h2>
            {children}
        </section>
    );
}
