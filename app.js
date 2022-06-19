const Discord = require("discord.js")
require("dotenv").config()
const { Client, Intents, MessageEmbed } = require("discord.js")
const client = new Client({
    intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
})
const { readdirSync } = require("fs")
const moment = require("moment")
const humanizeDuration = require("humanize-duration")
const Timeout = new Set()
client.slash = new Discord.Collection()
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const path = require("path")
const { keepalive } = require("./keepalive")
const commands = []
readdirSync("./commands/").map(async dir => {
    readdirSync(`./commands/${dir}/`).map(async (cmd) => {
        commands.push(require(path.join(__dirname, `./commands/${dir}/${cmd}`)))
    })
})
const rest = new REST({ version: "9" }).setToken(process.env.token);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.botID),
            { body: commands }
        )
        console.log("\x1b[34m%s\x1b[0m", "Successfully reloaded application (/) commands.")
    } catch (error) {
        console.error(error)
    }
})();

["slash", "anticrash"].forEach(handler => {
    require(`./handlers/${handler}`)(client)
})
client.on("ready", () => {
    console.log("\x1b[34m%s\x1b[0m", `Logged in as ${client.user.tag}!`)
    const statuses = [ // status bot
        "Dảk Dảk Bủh Bủh Lmao",
        `"Iu Gia Khoa" Panh said`,
        `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} users`,
    ]
    let index = 0
    setInterval(() => {
        if (index === statuses.length) index = 0
        const status = statuses[index]
        client.user.setActivity(`${status}`, {
            type: "WATCHING",
        })
        index++
    }, 60000)
})
client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
        if (!client.slash.has(interaction.commandName)) return
        if (!interaction.guild) return
        const command = client.slash.get(interaction.commandName)
        try {
            if (command.timeout) {
                if (Timeout.has(`${interaction.user.id}${command.name}`)) {
                    return interaction.reply({ content: `You need to wait **${humanizeDuration(command.timeout, { round: true })}** to use command again`, ephemeral: true })
                }
            }
            if (command.permissions) {
                if (!interaction.member.permissions.has(command.permissions)) {
                    return interaction.reply({ content: `:x: You need \`${command.permissions}\` to use this command`, ephemeral: true })
                }
            }
            command.run(interaction, client)
            Timeout.add(`${interaction.user.id}${command.name}`)
            setTimeout(() => {
                Timeout.delete(`${interaction.user.id}${command.name}`)
            }, command.timeout)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: ":x: There was an error while executing this command!", ephemeral: true })
        }
    }
})
client.on("guildCreate", guild => {
    const embed = new MessageEmbed()
        .setTitle("I'm added to a new server")
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(`I'm added to ${guild.name} | ID ${guild.id}\n Server member: ${guild.memberCount}\nTotal server: ${client.guilds.cache.size}`)
        .setTimestamp()
    const logchannel = client.channels.cache.get(process.env.Channel_log)
    logchannel.send({ embeds: [embed] })
})
client.on("guildDelete", guild => {
    const embed = new MessageEmbed()
        .setTitle("I'm left a new server")
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(`I'm left to ${guild.name} | ID ${guild.id}\n Server member: ${guild.memberCount}\nTotal server: ${client.guilds.cache.size}`)
        .setTimestamp()
    const logchannel = client.channels.cache.get(process.env.Channel_log)
    logchannel.send({ embeds: [embed] })
})
// Distube
const Distube = require("distube")
const { SoundCloudPlugin } = require("@distube/soundcloud")
const { SpotifyPlugin } = require("@distube/spotify")
const { YouTubeDLPlugin } = require("@distube/yt-dlp")
/* eslint new-cap: ["error", { "properties": false }] */
client.distube = new Distube.default(client, {
    youtubeDL: false,
    leaveOnEmpty: true,
    emptyCooldown: 30,
    leaveOnFinish: false,
    emitNewSongOnly: true,
    updateYouTubeDL: true,
    nsfw: true,
    youtubeCookie: process.env.ytcookie,
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YouTubeDLPlugin()]
})
const status = (queue) => `Volume: \`${queue.volume}%\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\` | Filter: \`${queue.filters.join(", ") || "Off"}\``
// DisTube event listeners
client.distube
    .on("playSong", (queue, song) => {
        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setAuthor({ name: "Started Playing", iconURL: "https://raw.githubusercontent.com/HELLSNAKES/Music-Slash-Bot/main/assets/music.gif" })
            .setThumbnail(song.thumbnail)
            .setDescription(`[${song.name}](${song.url})`)
            .addField("**Duration:**", song.formattedDuration.toString(), true)
            .addField("**Status**", status(queue).toString())
            .setFooter({ text: `Requested by ${song.user.username}`, iconURL: song.user.avatarURL() })
            .setTimestamp()
        queue.textChannel.send({ embeds: [embed] })
    })
    .on("addSong", (queue, song) => {
        const embed = new MessageEmbed()
            .setTitle(":ballot_box_with_check: | Added song to queue")
            .setDescription(`\`${song.name}\` - \`${song.formattedDuration}\` - Requested by ${song.user}`)
            .setColor("RANDOM")
            .setTimestamp()
        queue.textChannel.send({ embeds: [embed] })
    })
    .on("addList", (queue, playlist) => {
        const embed = new MessageEmbed()
            .setTitle(":ballot_box_with_check: | Add list")
            .setDescription(`Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`)
            .setColor("RANDOM")
            .setTimestamp()
        queue.textChannel.send({ embeds: [embed] })
    })
    .on("error", (textChannel, e) => {
        console.error(e)
        textChannel.send(`An error encountered: ${e}`)
    })
    // .on("finish", queue => queue.textChannel.send("***No more song in queue. Leaving the channel***"))
    .on("finishSong", queue => {
        const embed = new MessageEmbed()
            .setDescription(`:white_check_mark: | Finished playing \`${queue.songs[0].name}\``)
        queue.textChannel.send({ embeds: [embed] })
    })
    .on("disconnect", queue => {
        const embed = new MessageEmbed()
            .setDescription(":x: | Disconnected from voice channel")
        queue.textChannel.send({ embeds: [embed] })
    })
    .on("empty", queue => {
        const embed = new MessageEmbed()
            .setDescription(":x: | Channel is empty. Leaving the channel!")
        queue.textChannel.send({ embeds: [embed] })
    })
    .on("initQueue", (queue) => {
        queue.autoplay = false
        queue.volume = 100
    })
keepalive()
if (!process.env.token) {
    console.error("[ERROR]", "Token not found please visit: https://discord.com/developers/application to get token")
    process.exit(0)
}
client.login(process.env.token)
process.on("SIGINT", () => {
    console.log("\x1b[36m%s\x1b[0m", "SIGINT detected, exiting...")
    process.exit(0)
})
// check update repo
const fetch = require("node-fetch")
const { version } = require("./version.json")
console.log("\x1b[33m%s\x1b[0m", `Current version : ${version}`)
fetch("https://raw.githubusercontent.com/HELLSNAKES/Music-Slash-Bot/main/version.json")
    .then((res) => res.json())
    .then((data) => {
        if (data.version !== version) {
            console.log("\x1b[32m%s\x1b[0m", "===============================Update Available===================================")
            console.log("Ver:", data.version)
            console.log("\x1b[36m%s\x1b[0m", "Check commit : https://github.com/HELLSNAKES/Music-Slash-Bot/commits/main")
            console.log("\x1b[31m%s\x1b[0m", "Use `npm run updatebot` to update")
            console.log("\x1b[32m%s\x1b[0m", "==================================================================================")
        } else {
            console.log("\x1b[32m%s\x1b[0m", "No Update Available")
        }
    })
    .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", err)
    })
