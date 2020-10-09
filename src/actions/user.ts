import { Message } from 'discord.js';
import config from '../config';

function previewMessage(m: Message): string {
  const content = m.content.split(/\n/g).map((line) => `> ${line}`).join(`\n`);
  const attachments = m.attachments.map((a) => a.proxyURL).join(`\n`);
  return `${content}\n${attachments}`;
}

export async function warnUser(m: Message): Promise<void> {
  const dmChannel = await m?.author?.createDM();
  if (dmChannel) {
    await dmChannel.send(
      `Your message in <#${m.channel.id}> was automatically moderated. If you believe this was a mistake, send a DM`
      + ` to an administrator.\n\n**Don't attempt to re-post your message,** or to post a screenshot of your message:`
      + ` these will also be automatically moderated.\n\nYou posted:\n\n${previewMessage(m)}`,
    );
  }
}

export async function banUser(m: Message): Promise<void> {
  const guild = await m.client.guilds.fetch(config.discord.guild);
  const dmChannel = await m?.author?.createDM();

  if (dmChannel) {
    await dmChannel.send(
      `Your message in <#${m.channel.id}> was automatically moderated, and you were banned from the server. If you`
      + ` believe this was a mistake, email: ${config.supportEmail}\n\nYou posted:\n\n${previewMessage(m)}`,
    );
  }

  // Don't ban anyone in debug mode
  if (!config.debug) {
    await guild.members.ban(m.author, { days: 0, reason: `Automatic ban.` });
  }
}
