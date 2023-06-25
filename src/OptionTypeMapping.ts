import {
  APIChannel,
  ApplicationCommandOptionType,
  Attachment,
  Channel,
  GuildChannel,
  Role,
  ThreadChannel,
  User,
} from "discord.js";

export const OptionTypeMapping = Object.fromEntries(
  Object.entries(ApplicationCommandOptionType).map(([k, v]) => [
    k.toLowerCase(),
    v,
  ])
) as any as KeyLower<typeof ApplicationCommandOptionType>;

type FindKeyFromValue<O, V> = {
  [K in keyof O]: O[K] extends V ? K : never;
}[keyof O];

type ToObject<O> = {
  [K in keyof O]: O[K];
};

export type KeyLower<O extends { [k: string | number]: any }> = ToObject<
  {
    [K in Lowercase<Extract<keyof O, string>>]: O[FindKeyFromValue<
      { [K in Extract<keyof O, string>]: Lowercase<K> },
      K
    >];
  } & { [K in Exclude<keyof O, string>]: O[K] }
>;

export type TypeNameToType<TypeName extends keyof typeof OptionTypeMapping> =
  TypeName extends "string"
    ? string
    : TypeName extends "number" | "integer"
    ? number
    : TypeName extends "boolean"
    ? boolean
    : TypeName extends "user"
    ? User
    : TypeName extends "channel"
    ? GuildChannel | ThreadChannel
    : TypeName extends "role"
    ? Role
    : TypeName extends "mentionable"
    ? User | Role
    : TypeName extends "attachment"
    ? Attachment
    : never;
