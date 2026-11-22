from collections.abc import Awaitable, Callable

import discord


class HeartheartClient(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.reactions = True
        super().__init__(intents=intents)
        self.tree = discord.app_commands.CommandTree(self)
        self._ready_listeners: list[Callable[[], Awaitable[None]]] = []

    def add_ready_listener(self, callback: Callable[[], Awaitable[None]]) -> None:
        """Register an async callback to run when the client becomes ready."""
        self._ready_listeners.append(callback)

    async def on_ready(self):
        await self.tree.sync()
        await self.change_presence(activity=discord.Game("#Heartheartart"))
        for listener in self._ready_listeners:
            await listener()
