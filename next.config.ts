import { execSync } from "child_process";
import { createRequire } from "module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);
const { version } = require("./package.json") as { version: string };

function getCommitHash(): string {
    try {
        return execSync("git rev-parse --short HEAD").toString().trim();
    } catch {
        return "unknown";
    }
}

const nextConfig: NextConfig = {
    reactCompiler: true,
    env: {
        NEXT_PUBLIC_VERSION: version,
        NEXT_PUBLIC_COMMIT_HASH: getCommitHash(),
    },
};

export default nextConfig;
