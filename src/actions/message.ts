import { Message } from 'discord.js';

export async function deleteMessage(m: Message): Promise<void> {
  if (m.deletable) {
    m.delete();
  }
}
