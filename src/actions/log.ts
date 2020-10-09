import { Message, TextChannel } from 'discord.js';
import config from '../config';

export async function logBadMessage(m: Message, points: number): Promise<void> {
  const discord = m.client;
  const guild = await discord.guilds.fetch(config.discord.guild);
  const channel = <TextChannel>guild.channels.cache.find((ch) => ch.id === config.discord.logChannel);

  const header = `[${points}] <@${m.author.id}> in <#${m.channel.id}>`;
  const content = m.content.split(/\n/g).map((line) => `> ${line}`).join(`\n`);
  const attachments = m.attachments.map((a) => a.proxyURL).join(`\n`);
  channel.send(`${header}\n${content}\n${attachments}`);
}
