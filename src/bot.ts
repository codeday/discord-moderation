import { Client as Discord, Message } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import config from './config';
import censors from './censors';
import {
  logBadMessage, warnUser, banUser, deleteMessage,
} from './actions';

const prisma = new PrismaClient();

export default function Bot(): void {
  const discord = new Discord({ partials: ['MESSAGE'] });

  discord.on('message', async (message: Message): Promise<void> => {
    // Don't process our own messages
    if (message.author.id === discord?.user?.id) {
      return;
    }

    // Don't process messages from those on the allow-list
    if (message?.member?.roles.cache.find((r) => config.discord.ignoreRoles.includes(r.id))) {
      return;
    }

    // Check the message
    const points = await censors(message);

    // Nothing wrong with the message!
    if (points === false) {
      return;
    }

    // Log the message
    logBadMessage(message, <number>points);
    deleteMessage(message);

    // Add the points
    if (points > 0) {
      await prisma.userWarning.create({
        data: {
          userId: message.author.id,
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
        userId: message.author.id,
        createdAt: {
          gte: lookbackPeriod,
        },
      },
    });
    const currentWarningPoints = warningPoints.sum.points || 0;

    if (currentWarningPoints > config.points.threshold.ban) {
      banUser(message);
    } else {
      warnUser(message);
    }
  });

  // eslint-disable-next-line no-console
  discord.on('ready', () : void => console.log('listening on discord'));
  discord.login(config.discord.botToken);
}
