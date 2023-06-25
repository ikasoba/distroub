<h1>
  <p align="center">
    @ikasoba000/distroub
  </p>
</h1>

<p align="center">
  Utilities for creating bots in discord.js
</p>

<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/%40ikasoba000%2Fdistroub">
  <img alt="npm type definitions" src="https://img.shields.io/npm/types/%40ikasoba000%2Fdistroub">
</p>

# example

```ts
import { Client, ChatInputCommandInteraction as Interaction } from "discord.js";
import {
  DiscordBot,
  SlashCommand,
  Param,
  ParamType,
} from "@ikasoba000/distroub";

const client = new Client( ... );

class MyBot extends DiscordBot {
  constructor(client: Client) {
    super(client);
  }

  @ClientEvent("ready")
  onReady(){
    console.info("Bot activated, bot user: ", this.client.user?.tag);
  }

  // Create /random command
  @SlashCommand("random", "take a random number", [
    Param(ParamType("number").optional(), "max", "Upper limit of random number"),
  ])
  async getRandomNumber(interaction: Interaction, max?: number) {
    max ??= 10;

    await interaction.deferReply();
    await interaction.editReply("" + Math.floor(Math.random() * max));
  }
}

const _ = new MyBot(client);

await client.login( ... );
```
