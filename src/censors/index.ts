import { Message } from 'discord.js';
import links from './links';
import images from './images';
import profanity from './profanity';

interface CensorFunction {
  (m: Message): Promise<number | boolean>
}

const allCensorFunctions: Array<CensorFunction> = [
  links,
  images,
  profanity,
];

export default async function censor(m: Message): Promise<number | boolean> {
  const allScores = await Promise.all(
    allCensorFunctions
      .map((fn: CensorFunction) => fn(m)),
  );

  const rankingScores = <Array<number>>allScores.filter((e: number|boolean) => e !== false);

  if (rankingScores.length === 0) return false;
  return Math.max(0, ...rankingScores);
}
