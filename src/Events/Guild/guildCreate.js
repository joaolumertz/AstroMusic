const Event = require('../../Handlers/Event')
const { MessageEmbed, MessageButton, MessageActionRow, Interaction, WebhookClient } = require('discord.js')
const moment = require('moment')

moment.locale('pt-BR')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "guildCreate"
    })
  }
  run = async (guild) => {

    const data = moment(new Date()).format("LLL")

    const webhook = new WebhookClient({ url: process.env.WEBHOOKURL })

    const guildEmbed = new MessageEmbed()
    .setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) || `https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg`})
    .setTitle("Me adicionaram ☺")
    .setColor("GREEN")
    .setThumbnail(guild.iconURL({ dynamic: true }) || `https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg`)
    .setDescription(`Fui adicionado em um novo servidor.\nAbaixo estão as informações.`)
    .addFields([
      { name: "Servidor", value: `\`${guild.name}\` - (\`${guild.id}\`)`, inline: true },
      { name: "Adicionado em", value: `\`${data}\``, inline: true },
      { name: "Informações", value: `Membros: \`${guild.members.cache.size}\`\nChats: \`${guild.channels.cache.size}\``, inline: false },
    ])

    webhook.send({ embeds: [guildEmbed] })
  }
}