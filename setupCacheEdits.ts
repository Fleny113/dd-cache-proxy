import { Bot, DiscordGuildMemberAdd, DiscordGuildMemberRemove, type DesiredPropertiesBehavior, type TransformersDesiredProperties } from '@discordeno/bot';
import { BotWithProxyCache, ProxyCacheTypes } from './index.js';

export const setupCacheEdits = <
    T extends ProxyCacheTypes<Props, Behavior>,
    Props extends TransformersDesiredProperties,
    Behavior extends DesiredPropertiesBehavior,
    B extends Bot<Props, Behavior>
>(bot: BotWithProxyCache<T, Props, Behavior, B>) => {
    const { GUILD_MEMBER_ADD, GUILD_MEMBER_REMOVE } = bot.handlers;

    bot.handlers.GUILD_MEMBER_ADD = async (_, data, shardId) => {
        const payload = data.d as DiscordGuildMemberAdd;

        const guildID = bot.transformers.snowflake(payload.guild_id);
        const guild = bot.cache.guilds.memory.get(guildID);

        if (guild) {
            if (guild.memberCount) guild.memberCount++;

            await bot.cache.guilds.set(guild);
        }

        GUILD_MEMBER_ADD(bot, data, shardId);
    };

    bot.handlers.GUILD_MEMBER_REMOVE = async (_, data, shardId) => {
        const payload = data.d as DiscordGuildMemberRemove;

        const guildID = bot.transformers.snowflake(payload.guild_id);
        const guild = bot.cache.guilds.memory.get(guildID);

        if (guild) {
            if (guild.memberCount) guild.memberCount--;

            await bot.cache.guilds.set(guild);
        }

        GUILD_MEMBER_REMOVE(bot, data, shardId);
    };
};
