const { joinVoiceChannel } = require("@discordjs/voice")

module.exports = {
    name: "leave",
    description: "Leave voice channel",
    timeout: 5000,
    run: async (interaction, client) => {
        const voiceChannel = interaction.member.voice.channel
        if (!voiceChannel) {
            return interaction.reply({ content: "<:angry:987532270455894066> Please join a voice channel!", ephemeral: true })
        }
        if (interaction.member.guild.me.voice.channelId !== interaction.member.voice.channelId) {
            return interaction.reply({ content: "<:kho_hieu:987563858682085427> I'm not on any voice channel yet!", ephemeral: true })
        }

        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })
        connection.destroy()
        await interaction.reply("<:ok_bro:987562332970442792> ***Successfully left the voice channel***")
    }
}
