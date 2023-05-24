import {
  ChatInputCommandInteraction,
  Client,
  ApplicationCommandOptionType as OptionType,
} from "discord.js";
import { DiscordBot, SlashCommand } from "../src/index.js";

const client = new Client({
  intents: ["GuildMessages", "GuildPresences"],
});

class Bot extends DiscordBot {
  @SlashCommand("hello", "send 'hello, {name}!'", [
    {
      name: "name",
      type: OptionType.String,
      description: "some name",
      required: true,
    },
  ])
  hogeCommand(interaction: ChatInputCommandInteraction, name: string) {
    interaction.reply(`hello, ${name ?? "world"}!`);
  }
}

const bot = new Bot(client);

client
  .login(process.env.TOKEN)
  .then(() => console.log("logged in", client.user?.tag));
