const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('সার্ভার সম্পর্কে তথ্য দেখায়'),
    async execute(interaction) {
        const guild = interaction.guild;
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${guild.name} - সার্ভার ইনফো`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'সার্ভার নাম', value: guild.name, inline: true },
                { name: 'সদস্য সংখ্যা', value: `${guild.memberCount}`, inline: true },
                { name: 'তৈরি হয়েছে', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'মালিক', value: `<@${guild.ownerId}>`, inline: true },
            )
            .setFooter({ text: 'Jerry - আপনার বন্ধুসুলভ বট' });

        await interaction.reply({ embeds: [embed] });
    },
};
