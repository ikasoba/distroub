import { ChatInputCommandInteraction, Client } from "discord.js";
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

class GreetBot extends DiscordBot {
  @SlashCommand("hello", "Hello, {name}!", [
    Param(ParamType("string").optional(), "name", "some name"),
  ])
  async hello(interaction: ChatInputCommandInteraction, name?: string) {
    name ??= "world";

    await interaction.deferReply();
    await interaction.editReply(`Hello, ${name}!`);
  }
}

class MyBot extends DiscordBot {
  constructor(client: Client) {
    super(client);

    this.use(new GreetBot(this.client));
  }

  @ClientEvent("ready")
  onReady() {
    console.info("Bot activated, bot user: ", this.client.user?.tag);
  }

  // Create /random command
  @SlashCommand("random", "take a random number", [
    Param(
      ParamType("number").optional(),
      "max",
      "Upper limit of random number"
    ),
  ])
  async getRandomNumber(
    interaction: ChatInputCommandInteraction,
    max?: number
  ) {
    max ??= 10;

    await interaction.deferReply();
    await interaction.editReply("" + Math.floor(Math.random() * max));
  }
}

const bot = new MyBot(client);

await bot.login(process.env.TOKEN!);
