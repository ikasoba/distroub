import {
  Channel,
  ChatInputCommandInteraction,
  Client,
  Message,
  ApplicationCommandOptionType as OptionType,
} from "discord.js";
import {
  ClientEvent,
  DiscordBot,
  Param,
  ParamType,
  SlashCommand,
} from "../src/index.js";

const client = new Client({
  intents: ["GuildMessages", "Guilds", "MessageContent"],
});

class Bot extends DiscordBot {
  @SlashCommand("hello", "send 'hello, {name}!'", [
    Param(ParamType("string"), "name", "some name"),
    {
      name: "channel",
      type: OptionType.Channel,
      description: "some channel",
      required: false,
    },
  ])
  hogeCommand(
    interaction: ChatInputCommandInteraction,
    name: string,
    channel?: Channel
  ) {
    interaction.reply(`hello, ${name ?? "world"}!`);
  }

  @ClientEvent("messageCreate")
  onMessage(message: Message) {
    console.log(message.content);
  }
}

const bot = new Bot(client);

await client
  .login(process.env.TOKEN)
  .then(() => console.log("logged in", client.user?.tag));
