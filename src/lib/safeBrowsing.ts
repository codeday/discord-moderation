import fetch from 'node-fetch';
import LruCache from 'lru-cache';
import config from '../config';

const API_BASE = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

const cache = new LruCache<string, boolean>({ max: 2000 });

export default async function checkIsUnsafe(url: string): Promise<boolean> {
  if (!cache.has(url)) {
    try {
      const request = `${API_BASE}?key=${config.safeBrowsing.apiKey}`;
      const requestBody = {
        client: {
          clientId: 'codeday/discord-moderation-bot',
          clientVersion: '1.0',
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [
            { url },
          ],
        },
      };

      const result = await fetch(request, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      const matches = await result.json();

      cache.set(url, matches?.matches?.length > 0 || false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  return cache.get(url) || false;
}
