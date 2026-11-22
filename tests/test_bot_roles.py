from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, MagicMock

import discord
from heartheartart.bot.client import HeartheartClient
from heartheartart.bot.roles import BotRoleSync, is_bot_assigned_role


def _make_role(
    *,
    role_id: int,
    name: str,
    managed: bool,
    bot_id: int | None,
    guild,
) -> MagicMock:
    role = MagicMock()
    role.id = role_id
    role.name = name
    role.managed = managed
    role.tags = SimpleNamespace(bot_id=bot_id) if bot_id is not None else None
    role.guild = guild
    role.edit = AsyncMock()
    return role


def _make_guild(*, guild_id: int, manage_roles: bool = True) -> MagicMock:
    guild = MagicMock()
    guild.id = guild_id
    guild.me = SimpleNamespace(
        guild_permissions=SimpleNamespace(manage_roles=manage_roles)
    )
    guild.roles = []
    return guild


class BotRoleSyncTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.bot_user = SimpleNamespace(id=100, name="Heartheartart")
        self.client = MagicMock(spec=HeartheartClient)
        self.client.user = self.bot_user
        self.client.guilds = []
        self.ready_listeners = []
        self.client.add_ready_listener.side_effect = self.ready_listeners.append
        self.sync = BotRoleSync(self.client)

    async def test_renames_bot_assigned_role_only_across_all_guilds(self) -> None:
        guild_one = _make_guild(guild_id=1)
        bot_role_one = _make_role(
            role_id=11, name="OldName", managed=True, bot_id=100, guild=guild_one
        )
        user_role_one = _make_role(
            role_id=12, name="Moderator", managed=False, bot_id=None, guild=guild_one
        )
        other_bot_role = _make_role(
            role_id=13, name="OtherBot", managed=True, bot_id=999, guild=guild_one
        )
        guild_one.roles = [bot_role_one, user_role_one, other_bot_role]

        guild_two = _make_guild(guild_id=2)
        bot_role_two = _make_role(
            role_id=21, name="Heartheartart", managed=True, bot_id=100, guild=guild_two
        )
        guild_two.roles = [bot_role_two]

        self.client.guilds = [guild_one, guild_two]

        await self.sync.sync_all_guilds()

        bot_role_one.edit.assert_awaited_once_with(
            name="Heartheartart",
            reason="Sync Discord-assigned bot role name with bot username.",
        )
        user_role_one.edit.assert_not_awaited()
        other_bot_role.edit.assert_not_awaited()
        bot_role_two.edit.assert_not_awaited()

    async def test_skips_when_missing_manage_roles_permission(self) -> None:
        guild = _make_guild(guild_id=3, manage_roles=False)
        bot_role = _make_role(
            role_id=31, name="WrongName", managed=True, bot_id=100, guild=guild
        )
        guild.roles = [bot_role]

        await self.sync.sync_guild(guild)

        bot_role.edit.assert_not_awaited()

    async def test_continues_if_discord_forbidden_is_raised(self) -> None:
        guild_one = _make_guild(guild_id=4)
        failing_role = _make_role(
            role_id=41, name="WrongName", managed=True, bot_id=100, guild=guild_one
        )
        failing_role.edit.side_effect = discord.Forbidden(
            SimpleNamespace(status=403, reason="Forbidden"), "Missing Permissions"
        )
        guild_one.roles = [failing_role]

        guild_two = _make_guild(guild_id=5)
        ok_role = _make_role(
            role_id=51, name="WrongName", managed=True, bot_id=100, guild=guild_two
        )
        guild_two.roles = [ok_role]

        self.client.guilds = [guild_one, guild_two]

        await self.sync.sync_all_guilds()

        failing_role.edit.assert_awaited_once()
        ok_role.edit.assert_awaited_once()

    async def test_role_update_and_user_update_events(self) -> None:
        guild = _make_guild(guild_id=6)
        before_role = _make_role(
            role_id=61, name="Heartheartart", managed=True, bot_id=100, guild=guild
        )
        after_role = _make_role(
            role_id=61, name="RenamedByAdmin", managed=True, bot_id=100, guild=guild
        )
        guild.roles = [after_role]
        self.client.guilds = [guild]

        await self.sync.on_guild_role_update(before_role, after_role)
        after_role.edit.assert_awaited_once()

        after_role.edit.reset_mock()
        before_user = SimpleNamespace(id=100, name="OldBotName")
        after_user = SimpleNamespace(id=100, name="Heartheartart")
        await self.sync.on_user_update(before_user, after_user)
        after_role.edit.assert_awaited_once()

    async def test_bind_registers_ready_listener_and_events(self) -> None:
        self.sync.bind()
        self.assertEqual(len(self.ready_listeners), 1)
        self.assertEqual(self.client.event.call_count, 3)

    def test_is_bot_assigned_role(self) -> None:
        guild = _make_guild(guild_id=7)
        self.assertTrue(
            is_bot_assigned_role(
                _make_role(role_id=1, name="x", managed=True, bot_id=100, guild=guild),
                100,
            )
        )
        self.assertFalse(
            is_bot_assigned_role(
                _make_role(role_id=2, name="x", managed=False, bot_id=None, guild=guild),
                100,
            )
        )
        self.assertFalse(
            is_bot_assigned_role(
                _make_role(role_id=3, name="x", managed=True, bot_id=200, guild=guild),
                100,
            )
        )


if __name__ == "__main__":
    unittest.main()
