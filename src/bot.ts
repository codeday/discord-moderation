import { Client as Discord, Message } from 'discord.js';
import config from './config';
import censors from './censors';

export default function Bot(): void {
  const discord = new Discord({ partials: ['MESSAGE'] });

  discord.on('message', async (message: Message) => {
    if (message.author.id === discord?.user?.id) {
      return;
    }
    const points = await censors(message);

    // Try to delete the message
    if (points !== false && message.deletable) {
      message.delete();
    }

    // Log the message
    const guild = await discord.guilds.fetch(config.discord.logGuild);
    const channel = guild.channels.cache.find((ch) => ch.id === config.discord.logChannel);
    (<any>channel).send(`[${points}] <@${message.author.id}> in <#${message.channel.id}>`);
    (<any>channel).send(message.content.split(/\n/g).map((line) => `> ${line}`).join(`\n`));

    // TODO(@tylermenezes): Check if the user should be banned
    const currentWarningPoints = 0;
    const doBanUser = currentWarningPoints > config.points.threshold.ban;

    // Contact the user
    const dmChannel = await message?.author?.createDM();
    dmChannel.send(
      `Your message in <#${message.channel.id}> was automatically moderated.${
        doBanUser ? ` You were banned from this server.` : ''
      } If you think this was a mistake, DM an admin or email ${config.supportEmail}`,
    );
  });

  // eslint-disable-next-line no-console
  discord.on('ready', () : void => console.log('listening on discord'));
  discord.login(config.discord.botToken);
}
