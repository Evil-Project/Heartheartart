import logging

import discord
from heartheartart.bot.client import HeartheartClient

logger = logging.getLogger(__name__)


def is_bot_assigned_role(role: discord.Role, bot_user_id: int) -> bool:
    """Return True only for the managed role Discord created for this bot."""
    return (
        role.managed
        and role.tags is not None
        and role.tags.bot_id == bot_user_id
    )


class BotRoleSync:
    """Keep Discord-assigned bot roles named after the bot across all servers."""

    def __init__(self, client: HeartheartClient):
        self.client = client

    def bind(self) -> None:
        """Attach lifecycle and role/user update listeners to the client."""
        self.client.add_ready_listener(self.sync_all_guilds)
        self.client.event(self.on_guild_join)
        self.client.event(self.on_guild_role_update)
        self.client.event(self.on_user_update)

    async def sync_all_guilds(self) -> None:
        """Sync the bot-assigned role name in every guild the bot belongs to."""
        for guild in self.client.guilds:
            await self.sync_guild(guild)

    async def sync_guild(self, guild: discord.Guild) -> None:
        """Rename Discord-assigned bot roles in a guild if they do not match the bot name."""
        bot_user = self.client.user
        if bot_user is None:
            return
        for role in guild.roles:
            await self._sync_role(role, bot_user)

    async def on_guild_join(self, guild: discord.Guild) -> None:
        await self.sync_guild(guild)

    async def on_guild_role_update(
        self, before: discord.Role, after: discord.Role
    ) -> None:
        bot_user = self.client.user
        if bot_user is None or before.name == after.name:
            return
        await self._sync_role(after, bot_user)

    async def on_user_update(
        self, before: discord.User, after: discord.User
    ) -> None:
        bot_user = self.client.user
        if bot_user is None or after.id != bot_user.id or before.name == after.name:
            return
        await self.sync_all_guilds()

    async def _sync_role(
        self, role: discord.Role, bot_user: discord.ClientUser
    ) -> None:
        if not is_bot_assigned_role(role, bot_user.id):
            return
        if role.name == bot_user.name:
            return
        me = role.guild.me
        if me is not None and not me.guild_permissions.manage_roles:
            logger.warning(
                "Missing manage_roles permission to rename role %s in guild %s",
                role.id,
                role.guild.id,
            )
            return
        try:
            await role.edit(
                name=bot_user.name,
                reason="Sync Discord-assigned bot role name with bot username.",
            )
        except (discord.Forbidden, discord.HTTPException) as exc:
            logger.warning(
                "Failed to rename bot-assigned role %s in guild %s: %s",
                role.id,
                role.guild.id,
                exc,
            )
