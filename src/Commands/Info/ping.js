const Command = require('../../Handlers/Command')
const { Permissions } = require('discord.js')
module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Veja o ping do bot",
    })
  }
  run = async (interaction) => {
    interaction.reply({ content: `Meu ping é \`${this.client.ws.ping.toFixed(2)}ms\``, ephemeral: true })
  }
}