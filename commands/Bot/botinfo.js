const Discord = require("discord.js")
const { version } = require("discord.js")
const os = require("os")
const botver = require("../../version.json").version

module.exports = {
    name: "botinfo",
    description: "Send detailed info about the client",
    timeout: 10000,
    run: async (interaction, client) => {
        const embed = new Discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setTitle("Bot Stats")
            .setColor("RANDOM")
            .addFields(
                {
                    name: "<:server:879374547864936448> Servers",
                    value: `Serving ${client.guilds.cache.size} servers.`,
                    inline: true
                },
                {
                    name: "<:channels:879515584407162982> Channels",
                    value: `Serving ${client.channels.cache.size} channels.`,
                    inline: true
                },
                {
                    name: "<:user:879371469048664115> Users",
                    value: `Serving ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} users.`,
                    inline: true
                },
                {
                    name: "<:join:879517590454689852> Join Date",
                    value: client.user.createdAt.toLocaleDateString("en-us"),
                    inline: true
                },
            )
        interaction.reply({ embeds: [embed] })
    }
}
