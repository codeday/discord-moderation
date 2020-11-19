/* eslint-disable node/no-process-env */
import { config as loadEnv } from 'dotenv';

loadEnv();

const config = {
  debug: process.env.NODE_ENV !== 'production' || process.env.DEBUG_LOGS === 'true',
  supportEmail: process.env.SUPPORT_EMAIL,
  imageExtensions: ['gif', 'jpg', 'jpeg', 'png', 'webp'],
  discord: {
    botToken: <string>process.env.DISCORD_BOT_TOKEN,
    guild: <string>process.env.DISCORD_GUILD,
    logChannel: <string>process.env.DISCORD_LOG_CHANNEL,
    ignoreRoles: (<string>process.env.DISCORD_IGNORE_ROLES).split(','),
  },
  syslog: {
    host: process.env.SYSLOG_HOST,
    port: Number.parseInt(<string>process.env.SYSLOG_PORT, 10),
  },
  sightEngine: {
    user: <string>process.env.SIGHTENGINE_USER,
    secret: <string>process.env.SIGHTENGINE_SECRET,
  },
  categorization: {
    apiKey: <string>process.env.CATEGORIZATION_API_KEY,
  },
  safeBrowsing: {
    apiKey: <string>process.env.SAFE_BROWSING_API_KEY,
  },
  points: {
    threshold: {
      ban: <number>Number.parseInt(<string>process.env.POINTS_THRESHOLD_BAN, 10),
      lookbackHr: <number>Number.parseInt(<string>process.env.POINTS_THRESHOLD_LOOKBACK_HR, 10),
    },
    adultImage: <number>Number.parseInt(<string>process.env.POINTS_ADULT_IMAGE, 10),
    offensiveImage: <number>Number.parseInt(<string>process.env.POINTS_OFFENSIVE_IMAGE, 10),
    offensiveText: <number>Number.parseInt(<string>process.env.POINTS_OFFENSIVE_TEXT, 10),
    adultText: <number>Number.parseInt(<string>process.env.POINTS_ADULT_TEXT, 10),
    adultLink: <number>Number.parseInt(<string>process.env.POINTS_ADULT_LINK, 10),
    inviteLink: <number>Number.parseInt(<string>process.env.POINTS_INVITE_LINK, 10),
    dangerousLink: <number>Number.parseInt(<string>process.env.POINTS_DANGEROUS_LINK, 10),
  },
};

export default config;
