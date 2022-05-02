const Event = require('../../Handlers/Event')
const getMention = (id) => new RegExp(`<@!?${id}>( |)$`);

const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "messageCreate"
    })
  }
  run = async (message) => {
    if(message.author.bot || !message.guild) return

    let row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setLabel('Convite')
      .setStyle('LINK')
      .setEmoji('🔗')
      .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`)
    )

    if (message.content.match(getMention(this.client.user.id))) {
      return message.reply({ content: `Olá ${message.author}, meu nome é ***${this.client.user.username}***\nUse \`/play\` e comece a escutar alguma música.`, components: [row] });
    }
  }
}