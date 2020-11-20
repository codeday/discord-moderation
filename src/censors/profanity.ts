import { Message } from 'discord.js';
import { remove } from 'confusables';
import Filter from 'bad-words';
import config from '../config';
import { offensive, adult } from '../lib/swears';

const filterOffensive = new Filter({ emptyList: true });
const filterAdult = new Filter({ emptyList: true });
filterOffensive.addWords(...offensive);
filterAdult.addWords(...adult);

export default async function censorText(m: Message): Promise<number | boolean> {
  const effectiveContent = remove(m.content)
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

  if (config.debug) console.log(effectiveContent);

  const hasOffensive = filterOffensive.isProfane(effectiveContent);
  const hasAdult = filterAdult.isProfane(effectiveContent);

  if (hasOffensive) {
    console.log('cleaned offensive content:', filterOffensive.clean(effectiveContent));
  }

  if (hasAdult) {
    console.log('cleaned adult content:', filterAdult.clean(effectiveContent));
  }

  if (!hasOffensive && !hasAdult) return false;
  return Math.max(
    hasOffensive ? config.points.offensiveText : 0,
    hasAdult ? config.points.adultText : 0,
  );
}
