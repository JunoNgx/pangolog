import Image from "next/image";
import logoUrl from "@/assets/logo.svg";

type BrandMarkProps = {
    className?: string;
    size?: number;
};

const DEFAULT_LOGO_SIZE = 32;

export function BrandMark({
    className,
    size = DEFAULT_LOGO_SIZE,
}: BrandMarkProps) {
    return (
        <Image
            src={logoUrl}
            alt="Pangolog logo"
            className={className}
            width={size}
            height={size}
        />
    );
}
