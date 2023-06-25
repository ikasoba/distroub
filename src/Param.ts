import {
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
} from "discord.js";
import { OptionTypeMapping, TypeNameToType } from "./OptionTypeMapping.js";

export class ParamTypeInfo<
  T extends keyof typeof OptionTypeMapping,
  R extends boolean
> {
  constructor(
    public name: T,
    public isRequired: R,
    public choiceItems?: T extends "string" | "number" | "integer"
      ? ApplicationCommandOptionChoiceData<TypeNameToType<T>>[]
      : undefined
  ) {}

  optional(): ParamTypeInfo<T, false> {
    return new ParamTypeInfo(this.name, false);
  }

  required<B extends boolean>(bool: B): ParamTypeInfo<T, B> {
    return new ParamTypeInfo(this.name, bool);
  }

  choices<T extends "string" | "number" | "integer">(
    this: ParamTypeInfo<T, R>,
    ...items: TypeNameToType<T>[]
  ): ParamTypeInfo<T, R> {
    return new ParamTypeInfo(
      this.name,
      this.isRequired,
      items.map(
        (value, i): ApplicationCommandOptionChoiceData<TypeNameToType<T>> => ({
          name: `${i}`,
          value,
        })
      ) as any
    );
  }
}

export const ParamType = <T extends keyof typeof OptionTypeMapping>(
  name: T
): ParamTypeInfo<T, true> => {
  return new ParamTypeInfo(name, true);
};

export const Param = <
  T extends ParamTypeInfo<keyof typeof OptionTypeMapping, boolean>
>(
  info: T,
  name: string,
  description: string
) => ({
  type: OptionTypeMapping[info.name as T["name"]],
  required: info.isRequired as T["isRequired"],
  choices: info.choiceItems as T["choiceItems"],
  name,
  description,
});
