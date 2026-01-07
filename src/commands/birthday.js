const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setBirthday, getBirthday } = require('../services/birthdayService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Manage birthdays (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a birthday')
                .addIntegerOption(option =>
                    option.setName('day').setDescription('Day of the month (1-31)').setRequired(true))
                .addIntegerOption(option =>
                    option.setName('month').setDescription('Month (1-12)').setRequired(true))
                .addUserOption(option =>
                    option.setName('user').setDescription('The user to set the birthday for (Defaults to yourself)').setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check a user\'s birthday')
                .addUserOption(option =>
                    option.setName('user').setDescription('The user to check').setRequired(false))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const day = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');
            const targetUser = interaction.options.getUser('user') || interaction.user;

            if (day < 1 || day > 31 || month < 1 || month > 12) {
                return interaction.reply({ content: "❌ Invalid date! Please check the day and month.", ephemeral: true });
            }

            setBirthday(targetUser.id, day, month);
            return interaction.reply({ content: `✅ Birthday set for **${targetUser.username}** on **${day}/${month}**! I'll remember to wish them. 🎉`, ephemeral: true });
        } else if (subcommand === 'check') {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const birthday = getBirthday(targetUser.id);

            if (birthday) {
                return interaction.reply(`🎂 **${targetUser.username}**'s birthday is on **${birthday.day}/${birthday.month}**.`);
            } else {
                return interaction.reply(`❓ I don't know **${targetUser.username}**'s birthday yet.`);
            }
        }
    },
};
