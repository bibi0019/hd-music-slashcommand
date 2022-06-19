module.exports = {
    name: "play",
    description: "Playing music",
    options: [
        {
            name: "query",
            type: 3,
            description: "The song you want to play",
            required: true
        }
    ],
    timeout: 5000,
    run: async (interaction, client) => {
        const voiceChannel = interaction.member.voice.channel
        const queue = await client.distube.getQueue(interaction)
        const query = interaction.options.get("query").value
        if (!voiceChannel) {
            return interaction.reply({ content: "<:angry:987532270455894066> Please join a voice channel!", ephemeral: true })
        }
        if (queue) {
            if (interaction.member.guild.me.voice.channelId !== interaction.member.voice.channelId) {
                return interaction.reply({ content: "<:angry:987532270455894066> You are not on the same voice channel as me!", ephemeral: true })
            }
        }
        await interaction.reply("🔍 **Searching and attempting...**")
        await interaction.editReply("Searching done <:ok_bro:987562332970442792> ")
        client.distube.play(voiceChannel, query, {
            textChannel: interaction.channel,
            member: interaction.member
        })
    }
}
