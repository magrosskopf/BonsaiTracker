const { execSync } = require("node:child_process");

function readCommitSha() {
  try {
    return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return process.env.APP_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "unknown";
  }
}

module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_COMMIT_SHA: readCommitSha(),
  },
  images: {
    domains: [], // Füge hier externe Domains hinzu, falls nötig
  },
};
