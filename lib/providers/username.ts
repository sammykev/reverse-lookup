import { UsernameResult, SocialAccount } from "../types";

/**
 * Username search across major platforms.
 * Checks profile URLs directly — a 200 response means the account exists.
 * Each check uses a short timeout to keep overall response time manageable.
 */

interface Platform {
  name: string;
  url: (u: string) => string;
  // Some platforms always return 200 (even for non-existent users); skip those.
  skip?: boolean;
}

const PLATFORMS: Platform[] = [
  { name: "GitHub", url: (u) => `https://github.com/${u}` },
  { name: "Twitter / X", url: (u) => `https://twitter.com/${u}` },
  { name: "Instagram", url: (u) => `https://www.instagram.com/${u}/` },
  { name: "TikTok", url: (u) => `https://www.tiktok.com/@${u}` },
  { name: "Reddit", url: (u) => `https://www.reddit.com/user/${u}` },
  { name: "Pinterest", url: (u) => `https://www.pinterest.com/${u}/` },
  { name: "Tumblr", url: (u) => `https://${u}.tumblr.com` },
  { name: "Twitch", url: (u) => `https://www.twitch.tv/${u}` },
  { name: "YouTube", url: (u) => `https://www.youtube.com/@${u}` },
  { name: "SoundCloud", url: (u) => `https://soundcloud.com/${u}` },
  { name: "Spotify", url: (u) => `https://open.spotify.com/user/${u}` },
  { name: "Dev.to", url: (u) => `https://dev.to/${u}` },
  { name: "Hashnode", url: (u) => `https://hashnode.com/@${u}` },
  { name: "Medium", url: (u) => `https://medium.com/@${u}` },
  { name: "Keybase", url: (u) => `https://keybase.io/${u}` },
];

async function checkPlatform(platform: Platform, username: string): Promise<SocialAccount | null> {
  const url = platform.url(username);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(6_000),
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReverseLookup/1.0)" },
    });
    if (res.status === 200) {
      return { platform: platform.name, url, username, found: true };
    }
    return null;
  } catch {
    return null;
  }
}

export async function lookupUsername(username: string): Promise<UsernameResult> {
  const results = await Promise.all(
    PLATFORMS.filter((p) => !p.skip).map((p) => checkPlatform(p, username))
  );

  const accounts: SocialAccount[] = results.filter((r): r is SocialAccount => r !== null);

  return { query: username, accounts };
}
