const Command = require('../../Handlers/Command')
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

const moment = require('moment')
moment.locale('pt-BR')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'botinfo',
      description: "Veja as informações do bot."
    })
  }
  run = async (interaction, ls) => {

    const data = moment(this.client.user.createdTimestamp).format("LLL")
    const owner = this.client.users.cache.get('518207099302576160').tag
    const guilds = Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(this.client.guilds.cache.size)
    const users = Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(this.client.users.cache.size)
    
    let row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setLabel("Me adicione")
      .setEmoji("🔗")
      .setStyle("LINK")
      .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`),
      new MessageButton()
      .setLabel("Suporte")
      .setEmoji("📌")
      .setStyle("LINK")
      .setURL(`https://discord.gg/phnR6PfDUe`)
    )

    let embed = new MessageEmbed()
    .setColor("AQUA")
    .setDescription(`Fui feito em [Discord.js](https://discordjs.guide/#before-you-begin) e estou usando o [Lavalink](https://github.com/davidffa/lavalink/releases) para tocar músicas.`)
    .addFields([
      { name: "Nome", value: `\`${this.client.user.username}\``, inline: true },
      { name: "Criador", value: `\`${owner}\``, inline: true },
      { name: "Criado em", value: `${data}`, inline: true },
      { name: "Infos", value: `Membros: \`${users}\`\nServidores: \`${guilds}\``, inline: true },
    ])

    interaction.reply({ embeds: [embed], components: [row] })

  }
}