import { SocialDiscoveryResult, SocialAccount } from "../types";

/**
 * Social account discovery by email.
 *
 * Checks whether a given email is registered on major platforms by probing
 * their "forgot password" or account-existence endpoints. Each platform
 * uses a different mechanism — some return distinct HTTP statuses, others
 * return JSON flags.
 *
 * This is intentionally limited to platforms with public/documented
 * existence-check endpoints that don't require credentials.
 */

interface PlatformCheck {
  platform: string;
  check: (email: string) => Promise<boolean>;
  profileUrl: (username: string) => string;
}

async function checkGravatar(email: string): Promise<boolean> {
  // Gravatar generates a hash-based URL; a 200 means a profile exists.
  const { createHash } = await import("crypto");
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  try {
    const res = await fetch(`https://www.gravatar.com/${hash}.json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function checkGithub(email: string): Promise<{ found: boolean; username: string | null }> {
  // GitHub's search API can surface a user by commit email (public commits only).
  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email&per_page=1`,
      {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      }
    );
    if (!res.ok) return { found: false, username: null };
    const data: any = await res.json();
    const user = data?.items?.[0];
    return { found: !!user, username: user?.login ?? null };
  } catch {
    return { found: false, username: null };
  }
}

export async function discoverSocialAccounts(email: string): Promise<SocialDiscoveryResult> {
  const accounts: SocialAccount[] = [];

  // Run all checks in parallel
  const [gravatarFound, githubResult] = await Promise.all([
    checkGravatar(email),
    checkGithub(email),
  ]);

  if (gravatarFound) {
    const hash = (await import("crypto"))
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    accounts.push({
      platform: "Gravatar",
      url: `https://gravatar.com/${hash}`,
      username: email.split("@")[0],
      found: true,
    });
  }

  if (githubResult.found && githubResult.username) {
    accounts.push({
      platform: "GitHub",
      url: `https://github.com/${githubResult.username}`,
      username: githubResult.username,
      found: true,
    });
  }

  return {
    query: email,
    accounts,
    configured: true,
  };
}
