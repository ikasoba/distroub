import { ApplicationCommandData } from "discord.js";
import { Client } from "discord.js";
import {
  ApplicationCommandOptionData,
  ChatInputCommandInteraction,
  CommandInteraction,
  ApplicationCommandOptionType as OptionType,
} from "discord.js";
import "reflect-metadata";

const discordBotSymbol = Symbol("discordBot");
const commandsSymbol = Symbol("commands");

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

type a = CreateOptionsFromFunc<(...a: any) => any>;

type CreateOption<T> = string | undefined extends T
  ? { type: OptionType.String; required?: false }
  : number | undefined extends T
  ? { type: OptionType.Integer | OptionType.Number; required?: false }
  : boolean | undefined extends T
  ? { type: OptionType.Boolean; required?: false }
  : T extends string
  ? { type: OptionType.String; required: true }
  : T extends number
  ? { type: OptionType.Integer | OptionType.Number; required: true }
  : T extends boolean
  ? { type: OptionType.Boolean; required: true }
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
              args.push(option?.value);
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

export class DiscordBot {
  [commandsSymbol]!: Map<
    string,
    { type: "slashcommand"; command: ApplicationCommandData; fn: Function }
  >;

  constructor(public client: Client) {
    client.on("ready", () => {
      if (this[commandsSymbol] == null) {
        this[commandsSymbol] = new Map();
      }
      const commands = [...this[commandsSymbol].entries()];
      client.application?.commands.set(commands.map((x) => x[1].command));

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
      console.log(command);
      command.fn(interaction);
    }
  }
}
