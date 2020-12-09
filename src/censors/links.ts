import { Message } from 'discord.js';
import getUrls from 'get-urls';
import Url from 'url-parse';
import LruCache from 'lru-cache';
import fetch from 'node-fetch';
import config from '../config';
import checkSafeBrowsing from '../lib/safeBrowsing';
import checkCategorization from '../lib/categorization';

const resolvedUrlsCache = new LruCache<string, string>({ max: 1000, maxAge: 1000 * 60 * 60 * 12 });
async function resolveRedirects(url: string): Promise<string> {
  if (!resolvedUrlsCache.has(url)) {
    const { url: newUrl } = await fetch(url, { method: 'HEAD', timeout: 2000 });
    resolvedUrlsCache.set(url, newUrl);
  }
  return resolvedUrlsCache.get(url) || url;
}

function checkIsDiscordLink(url: string): boolean {
  const parsed = new Url(url);
  return (
    parsed.host === 'discord.gg'
    || (parsed.host === 'discord.com' && parsed.pathname.startsWith('/invite'))
  );
}

export default async function censorText(m: Message): Promise<number | boolean> {
  const urls = Array.from(getUrls(m.content));
  const urlScores = await Promise.all(urls.map(async (url: string): Promise<number | boolean> => {
    let resolvedUrl: string = url;
    try {
      resolvedUrl = await resolveRedirects(url);
    } catch (ex) {}

    const [isUnsafe, isDiscord] = await Promise.all([
      checkSafeBrowsing(resolvedUrl),
      checkIsDiscordLink(resolvedUrl),
    ]);
    if (!isUnsafe && !isDiscord) return false;

    return Math.max(
      isUnsafe ? config.points.dangerousLink : 0,
      isDiscord ? config.points.inviteLink : 0,
    );
  }));

  const badUrlScores = <Array<number>>urlScores.filter((u) => u !== false);

  if (badUrlScores.length === 0) return false;
  return Math.max(0, ...badUrlScores);
}
