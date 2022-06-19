const { MessageActionRow, MessageButton, MessageEmbed, Client} = require('discord.js');

module.exports={
    name: "testbutton",
    description: "Test Button",
    run: async (interaction, client, message) => {
        const row = new MessageActionRow()
			.addComponents(
				yes = new MessageButton()
					.setCustomId('button1')
					.setLabel('Yes')
					.setStyle('SUCCESS')
                    .setDisabled(false),
			
               no = new MessageButton()
                    .setCustomId('button2')
                    .setLabel('No')
                    .setStyle('DANGER')
                    .setDisabled(false)
            )
        const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Some title')
        .setDescription('Dak');

    await interaction.reply({ ephemeral: false, embeds: [embed], components: [row] });

    const filter = (interaction) => {
        if (interaction.user.id === message.author.id){
            
        }
    }
    
    client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'button1') {
       await interaction.reply('DakYes')    
    }

    else if (interaction.customId == 'button2') {
        await interaction.reply('DakNo')
    }
    });
    }
}