import { Message } from 'discord.js';
import config from '../config';
import { checkImage } from '../lib/sightEngine';

export default async function censorText(m: Message): Promise<number | boolean> {
  const results = await Promise.all(m.attachments.map((a) => checkImage(a.url)));
  const scores = <Array<number>>results
    .map((r): number | boolean => {
      if (r.offensive.prob > 0.5) return config.points.offensiveImage;
      return false;
    })
    .filter((r) => r !== false);

  if (scores.length === 0) return false;
  return Math.max(0, ...scores);
}
