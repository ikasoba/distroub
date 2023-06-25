import {
  ApplicationCommandData,
  Channel,
  ClientEvents,
  CommandInteractionOption,
  User,
} from "discord.js";
import { Client } from "discord.js";
import {
  ApplicationCommandOptionData,
  ChatInputCommandInteraction,
  CommandInteraction,
  ApplicationCommandOptionType as OptionType,
} from "discord.js";
import { OptionTypeMapping } from "./OptionTypeMapping.js";

const discordBotSymbol = Symbol("discordBot");
const commandsSymbol = Symbol("commands");
const customSymbol = Symbol("customSymbol");

type ArgTypes<F extends (...a: any[]) => any> = F extends (...a: infer A) => any
  ? A
  : [];

type ExcludeTail<A extends any[]> = A extends [any, ...infer R] ? R : [];

type CreateOptionsFromFunc<F extends (...a: any[]) => any> = CreateOptions<
  [...ExcludeTail<ArgTypes<F>>]
>;

type CreateOptions<A extends any[]> = {
  [K in keyof A]: ApplicationCommandOptionData & CreateOption<A[K]>;
};

type CreateOption<T> = string | undefined extends T
  ? { type: OptionType.String; required?: false }
  : number | undefined extends T
  ? { type: OptionType.Integer | OptionType.Number; required?: false }
  : boolean | undefined extends T
  ? { type: OptionType.Boolean; required?: false }
  : Channel | undefined extends T
  ? { type: OptionType.Channel; required?: false }
  : User | undefined extends T
  ? { type: OptionType.User; required?: false }
  : T extends string
  ? { type: OptionType.String; required: true }
  : T extends number
  ? { type: OptionType.Integer | OptionType.Number; required: true }
  : T extends boolean
  ? { type: OptionType.Boolean; required: true }
  : T extends Channel
  ? { type: OptionType.Channel; required: true }
  : T extends User
  ? { type: OptionType.User; required: true }
  : never;

export function SlashCommand<F extends (...a: any) => any>(
  name: string,
  description: string,
  options: CreateOptionsFromFunc<F>,
  otherOptions: Partial<ApplicationCommandData> = {}
) {
  return (orig: F, ctx: ClassMethodDecoratorContext<DiscordBot>) => {
    const command: ApplicationCommandData = {
      ...otherOptions,
      name,
      description,
      options,
    };

    ctx.addInitializer(function () {
      if (!this[commandsSymbol]) {
        this[commandsSymbol] = new Map();
      }
      this[commandsSymbol].set(name, {
        type: "slashcommand",
        command,
        fn: function (this: any, interaction: ChatInputCommandInteraction) {
          const args: any[] = [];
          for (const v of options) {
            const option = interaction.options.get(v.name);
            if ((v as any).required == true && option == null) return;
            if (option == null) continue;
            if (
              v.type == OptionType.Boolean ||
              v.type == OptionType.Integer ||
              v.type == OptionType.Number ||
              v.type == OptionType.String
            ) {
              args.push(option.value);
            } else if (v.type == OptionType.Channel) {
              args.push(option.channel);
            } else {
              args.push(
                option[OptionType[v.type].toLowerCase() as keyof typeof option]
              );
            }
          }
          return orig.call(this, interaction, ...args);
        },
      });
    });

    return orig;
  };
}

export function ClientEvent<
  K extends keyof ClientEvents,
  F extends (...args: ClientEvents[K]) => void
>(name: K) {
  return (fn: F, ctx: ClassMethodDecoratorContext<DiscordBot>) => {
    ctx.addInitializer(function () {
      if (this[customSymbol] == null) {
        this[customSymbol] = [];
      }

      this[customSymbol].push(function () {
        this.client.on(name, (...args) => fn.call(this, ...args));
      });
    });

    return fn;
  };
}
export class DiscordBot {
  [commandsSymbol]!: Map<
    string,
    { type: "slashcommand"; command: ApplicationCommandData; fn: Function }
  >;

  [customSymbol]!: ((this: DiscordBot, bot: DiscordBot) => void)[];

  constructor(public client: Client) {
    client.on("ready", () => {
      if (this[commandsSymbol] == null) {
        this[commandsSymbol] = new Map();
      }

      if (this[customSymbol] == null) {
        this[customSymbol] = [];
      }

      const commands = [...this[commandsSymbol].entries()];
      client.application?.commands.set(commands.map((x) => x[1].command));

      for (const f of this[customSymbol]) {
        f.call(this, this);
      }

      client.on("interactionCreate", (interaction) => {
        if (interaction.isCommand()) {
          this.dispatchCommand(interaction);
        }
      });
    });
  }

  dispatchCommand(interaction: CommandInteraction) {
    const command = this[commandsSymbol].get(interaction.commandName);
    if (command?.type == "slashcommand") {
      if (!interaction.isChatInputCommand()) {
        return;
      }
      command.fn.call(this, interaction);
    }
  }
}

export * from "./Param.js";
