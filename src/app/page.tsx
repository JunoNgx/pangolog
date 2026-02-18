import Link from "next/link";

export default function LandingPage() {
    return (
        <div>
            <h1>Pangolog</h1>
            <p>Personal expense tracker</p>
            <p><Link href={"/log"}>Try now</Link></p>
        </div>
    );
}
