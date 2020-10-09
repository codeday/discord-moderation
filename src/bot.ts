import { Client as Discord, Message, PartialMessage } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import config from './config';
import censors from './censors';
import {
  logBadMessage, warnUser, banUser, deleteMessage, logMessage,
} from './actions';

const prisma = new PrismaClient();

async function processMessage(m: Message, isEdit: boolean): Promise<void> {
  logMessage(m, isEdit ? 'EDIT' : 'CREATE');

  // Don't process our own messages
  if (m.author.id === m.client.user?.id) {
    return;
  }

  // Don't process messages from those on the allow-list
  if (m?.member?.roles.cache.find((r) => config.discord.ignoreRoles.includes(r.id))) {
    return;
  }

  // Check the message
  const points = await censors(m);

  // Nothing wrong with the message!
  if (points === false) {
    return;
  }

  // Log the message
  logBadMessage(m, <number>points);
  deleteMessage(m);

  // Add the points
  if (points > 0) {
    await prisma.userWarning.create({
      data: {
        userId: m.author.id,
        createdAt: new Date(),
        points: <number>points,
      },
    });
  }

  // Check whether to ban the user, or just send a warning
  const lookbackPeriod = new Date();
  lookbackPeriod.setHours(lookbackPeriod.getHours() - config.points.threshold.lookbackHr);
  const warningPoints = await prisma.userWarning.aggregate({
    sum: {
      points: true,
    },
    where: {
      userId: m.author.id,
      createdAt: {
        gte: lookbackPeriod,
      },
    },
  });
  const currentWarningPoints = warningPoints.sum.points || 0;

  if (currentWarningPoints > config.points.threshold.ban) {
    banUser(m);
  } else {
    warnUser(m);
  }
}

export default function Bot(): void {
  const discord = new Discord({ partials: ['MESSAGE'] });

  discord.on('message', async (m: Message) => processMessage(m, false));
  discord.on('messageUpdate',
    async (_: Message | PartialMessage, m: Message | PartialMessage) => processMessage(<Message>m, true));
  discord.on('messageDelete', (m: Message | PartialMessage) => logMessage(<Message>m, 'DELETE'));

  // eslint-disable-next-line no-console
  discord.on('ready', () : void => console.log('listening on discord'));
  discord.login(config.discord.botToken);
}
