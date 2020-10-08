import { Message } from 'discord.js';
import unhomoglyph from 'unhomoglyph';
import Filter from 'bad-words';
import config from '../config';
import { offensive, adult } from '../lib/swears';

const filterOffensive = new Filter({ list: offensive });
const filterAdult = new Filter({ list: adult });

export default async function censorText(m: Message): Promise<number | boolean> {
  const effectiveContent = unhomoglyph(m.content)
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/!/g, 'i')
    .replace(/\+/g, 't');

  const hasOffensive = filterOffensive.isProfane(effectiveContent);
  const hasAdult = filterAdult.isProfane(effectiveContent);

  if (!hasOffensive && !hasAdult) return false;
  return Math.max(
    hasOffensive ? config.points.offensiveText : 0,
    hasAdult ? config.points.adultText : 0,
  );
}
