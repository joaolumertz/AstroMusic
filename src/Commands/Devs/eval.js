const Command = require('../../Handlers/Command')
const { MessageEmbed } = require('discord.js')
const { inspect } = require('util')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "Teste um código.",
      onlyDevs: true,
      options: [
        {
          name: 'script',
          description: 'Insira o script a ser testado.',
          type: 'STRING',
          required: true
        }
      ]
    })
  }
  run = async (interaction) => {
    const { options } = interaction;

    const script = options.getString('script')

    try {
      const evaled = eval(script)
      const words = ["token", "destroy"];
      if(words.some(word => script.toLowerCase().includes(word))) {
        return interaction.reply({ content: "Estas palavras não são permitidas.", ephemeral: true })
      }

      const sucessEmbed = new MessageEmbed()
      .setColor("GREEN")
      .setAuthor({ name: `${this.client.user.username} - Eval` })
      .addFields([
        { name: "**Tipo**", value: `\`\`\`prolog\n${typeof(evaled)}\`\`\``, inline: true },
        { name: "**Tempo Levado**", value: `\`\`\`prolog\n${(Date.now() - interaction.createdTimestamp).toFixed(2)}ms\`\`\``, inline: true },
        { name: "**Entrada**", value: `\`\`\`js\n${script}\`\`\``, inline: false },
        { name: "**Saida**", value: `\`\`\`js\n${inspect(evaled, {depth: 0})}\`\`\``, inline: false },
      ])
      .setFooter({ text: `Usado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})

      interaction.reply({ embeds: [sucessEmbed] })
    } catch (error) {
      const embedError = new MessageEmbed()
      .setColor("RED")
      .setAuthor({ name: `${this.client.user.username} - Eval` })
      .addFields([
        { name: "**Entrada**", value: `\`\`\`js\n${script}\`\`\``, inline: false },
        { name: "**Erro**", value: `\`\`\`js\n${error}\`\`\``, inline: false },
      ])
      .setFooter({ text: `Usado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})

      interaction.reply({ embeds: [embedError] })
    }
  }
} 