import { Message, TextChannel } from 'discord.js';
import syslog from 'syslog-client';
import config from '../config';

const logger = config.syslog.host && syslog.createClient(config.syslog.host, {
  port: config.syslog.port,
  syslogHostname: `guild-${config.discord.guild}`,
});

export async function logMessage(m: Message, action: string): Promise<void> {
  if (logger) {
    const message = [
      `a_${m.author.id}`,
      `ch_${m.channel.id}`,
      `m_${m.id}`,
      (<TextChannel>m.channel).name || '_',
      `"${m.author.username}"`,
      `"${m.member?.displayName}"`,
      action || 'CREATE',
      m.attachments.map((a) => a.proxyURL).join(',') || '_',
      m.content.split(`\n`).map((line) => `"${line}"`).join(' '),
    ].join(` `);
    logger.log(message);
  }
}

export async function logBadMessage(m: Message, points: number): Promise<void> {
  const discord = m.client;
  const guild = await discord.guilds.fetch(config.discord.guild);
  const channel = <TextChannel>guild.channels.cache.find((ch) => ch.id === config.discord.logChannel);

  const header = `[${points}] <@${m.author.id}> in <#${m.channel.id}>`;
  const content = m.content.split(/\n/g).map((line) => `> ${line}`).join(`\n`);
  const attachments = m.attachments.map((a) => a.proxyURL).join(`\n`);
  channel.send(`${header}\n${content}\n${attachments}`);
}
