import discord
from heartheartart.bot.client import HeartheartClient
from heartheartart.domain.cards import LinkCard
from heartheartart.publishing.pending import PendingPublishForbidden, PendingPublishNotFound
from heartheartart.publishing.ports import PendingPublishes
from heartheartart.publishing.service import PreparedPublish, PublishRejected, PublishService


class StatusCommands:
    def __init__(self, client: HeartheartClient):
        self.client = client

    def bind(self) -> None:
        self.client.tree.command(name="ping", description="Pong!")(self.ping)

    async def ping(self, interaction: discord.Interaction) -> None:
        await interaction.response.send_message(
            f"Pong! Latency: {round(self.client.latency * 1000)}ms."
        )


class PublishingCommands:
    def __init__(
        self,
        client: HeartheartClient,
        service: PublishService,
        pending: PendingPublishes,
    ):
        self.client = client
        self.service = service
        self.pending = pending

    def bind(self) -> None:
        tree = self.client.tree
        tree.command(name="publish", description="Publish a new link card")(self.publish)
        tree.command(name="confirm", description="Confirm a pending publish")(self.confirm)
        tree.command(name="cancel", description="Cancel a pending publish")(self.cancel)
        self.client.event(self.on_reaction_add)

    async def publish(self, interaction: discord.Interaction, url: str) -> None:
        await interaction.response.defer()
        try:
            prepared = await self.service.prepare(url)
        except PublishRejected as exc:
            await interaction.followup.send(exc.message)
            return
        await interaction.followup.send(_preview(prepared))
        message = await interaction.original_response()
        self.pending.put(message.id, interaction.user.id, prepared.card)
        await message.edit(
            content=(
                f"A pending publish has been created. Reference ID: ``{message.id}``\n"
                f"{message.content}"
            )
        )
        await message.add_reaction("✅")
        await message.add_reaction("❌")

    async def confirm(self, interaction: discord.Interaction, id: str) -> None:
        message_id = int(id)
        await interaction.response.defer()
        card = await self._owned_card(interaction, message_id)
        if card is None:
            return
        await interaction.followup.send("Confirmed! Writing into the database...")
        await self.service.confirm(card)
        message = await interaction.original_response()
        await message.channel.send("Done! The website will update soon.")
        self.pending.discard(message_id)

    async def cancel(self, interaction: discord.Interaction, id: str) -> None:
        message_id = int(id)
        await interaction.response.defer()
        card = await self._owned_card(interaction, message_id)
        if card is None:
            return
        await self.service.cancel(card)
        await interaction.followup.send("Cancelled! Changes will not be saved.")
        self.pending.discard(message_id)

    async def on_reaction_add(
        self, reaction: discord.Reaction, user: discord.User
    ) -> None:
        if user.bot:
            return
        emoji = str(reaction.emoji)
        if emoji not in {"✅", "❌"}:
            return
        try:
            card = self.pending.get_owned(reaction.message.id, user.id)
        except (PendingPublishNotFound, PendingPublishForbidden):
            return
        if emoji == "✅":
            await reaction.message.channel.send(
                "Confirmed! Writing into the database..."
            )
            await self.service.confirm(card)
            await reaction.message.channel.send("Done! The website will update soon.")
        else:
            await self.service.cancel(card)
            await reaction.message.channel.send("Cancelled! Changes will not be saved.")
        self.pending.discard(reaction.message.id)

    async def _owned_card(
        self, interaction: discord.Interaction, message_id: int
    ) -> LinkCard | None:
        try:
            return self.pending.get_owned(message_id, interaction.user.id)
        except PendingPublishNotFound:
            await interaction.followup.send(PendingPublishNotFound.message)
        except PendingPublishForbidden:
            await interaction.followup.send(PendingPublishForbidden.message)
        return None


def _preview(prepared: PreparedPublish) -> str:
    card = prepared.card
    return (
        "Ready to publish! Check every detail is OK and react to ✅ or use "
        "``/confirm <id>`` command to confirm.\n"
        f"Link: {card.link}\n"
        f"Title: {card.title}\n"
        f"Description: {card.description}\n"
        f"Author: {card.author}\n"
        f"Snapshot: {prepared.preview_url}"
    )
