import fetch from 'node-fetch';
import LruCache from 'lru-cache';
import Url from 'url-parse';
import config from '../config';

const API_BASE = 'https://website-categorization.whoisxmlapi.com/api/v1';
interface CategorizationApiResponse {
  categories: Array<string>
  domainName: string
  websiteResponded: boolean
}

const cache = new LruCache<string, boolean>({ max: 2000 });

export default async function checkIsAdult(url: string): Promise<boolean> {
  const { hostname } = new Url(url);
  if (!cache.has(hostname)) {
    try {
      const request = `${API_BASE}?apiKey=${config.categorization.apiKey}&domainName=${encodeURIComponent(hostname)}`;
      const result = await fetch(request, { timeout: 2500 });
      const { categories } = await result.json();
      const isAdult = categories?.includes('Adult');

      cache.set(hostname, isAdult);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  return cache.get(hostname) || false;
}
