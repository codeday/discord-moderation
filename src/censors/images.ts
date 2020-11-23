import path from 'path';
import { Message } from 'discord.js';
import Url from 'url-parse';
import config from '../config';
import { checkImage, SightEngineResponse } from '../lib/sightEngine';

export default async function censorText(m: Message): Promise<number | boolean> {
  const results = await Promise.all(m.attachments.map((a) => {
    const url = new Url(a.proxyURL);
    const ext = path.extname(url.pathname).slice(1).toLowerCase();
    if (!config.imageExtensions.includes(ext)) {
      return null;
    }
    return checkImage(`${a.proxyURL}?width=600&height=400`);
  }));

  const nonNullResults = <SightEngineResponse[]>results
    .filter((r) => r !== null);

  const scores = <number[]>nonNullResults
    .map((r: SightEngineResponse): number | boolean => {
      if (r.offensive.prob > config.imageDetectionThreshold) return config.points.offensiveImage;
      return false;
    })
    .filter((r) => r !== false);

  if (scores.length === 0) return false;
  return Math.max(0, ...scores);
}
