const Command = require('../../Handlers/Command')
const { MessageEmbed } = require('discord.js')

const { connection } = require('mongoose')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "status",
      description: "Veja os status sobre o bot.",
      onlyDevs: true
    })
  }
  run = async (interaction) => {

    const statusEmbed = new MessageEmbed()
    .setColor("ORANGE")
    .setDescription(`**Client**: \`🟢 Online\` - \`${this.client.ws.ping.toFixed(2)}ms\`\n**Uptime**: <t:${parseInt(this.client.readyTimestamp / 1000)}:R>\n🖥 **Servidores**: \`${Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short'}).format(this.client.guilds.cache.size)}\`\n👥 **Usuários**: \`${Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short'}).format(this.client.users.cache.size)}\`\n**Database**: \`${switchTo(connection.readyState)}\``)

    interaction.reply({ embeds: [statusEmbed] })
  }
}

function switchTo(val) {
  var status = " "
  switch(val) {
    case 0 : status = "🔴 Desconectado"
      break;
    case 1 : status = "🟢 Conectado"
      break;
    case 2 : status = "🟠 Conectando"
      break;
    case 3 : status = "🔘 Desconectando"
      break;
  }
  return status
}