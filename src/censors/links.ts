import { Message } from 'discord.js';
import getUrls from 'get-urls';
import config from '../config';
import checkSafeBrowsing from '../lib/safeBrowsing';
import checkCategorization from '../lib/categorization';

export default async function censorText(m: Message): Promise<number | boolean> {
  const urls = Array.from(getUrls(m.content));
  const urlScores = await Promise.all(urls.map(async (url: string): Promise<number | boolean> => {
    const [isUnsafe, isAdult] = await Promise.all([checkSafeBrowsing(url), checkCategorization(url)]);
    if (!isUnsafe && !isAdult) return false;

    return Math.max(
      isUnsafe ? config.points.dangerousLink : 0,
      isAdult ? config.points.adultLink : 0,
    );
  }));

  const badUrlScores = <Array<number>>urlScores.filter((u) => u !== false);

  if (badUrlScores.length === 0) return false;
  return Math.max(0, ...badUrlScores);
}
