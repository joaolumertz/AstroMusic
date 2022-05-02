const Command = require('../../Handlers/Command')
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

const moment = require('moment')
moment.locale('pt-BR')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'botinfo',
      description: "〔❗ • Info〕Veja as informações do bot."
    })
  }
  run = async (interaction, ls) => {

    const data = moment(await this.client.user.createdTimestamp).format("LLL")
    const owner = await this.client.users.cache.get('518207099302576160').tag
    const guilds = Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(await this.client.guilds.cache.size)
    const channels = Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(await this.client.channels.cache.size)
    let u = 0;
    await this.client.guilds.cache.forEach((guild) => { u += guild.memberCount })
    const users = Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(u)
    const uptime = await this.client.util.msToDate(process.uptime() * 1e3)
    
    const playing = Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(await this.client.vulkava.players.size)
    
    const nodes = await this.client.vulkava.nodes.length

    let row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setLabel("Me Adicione")
      .setStyle("LINK")
      .setEmoji("🔗")
      .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`),
      new MessageButton()
      .setLabel("Suporte")
      .setStyle("LINK")
      .setEmoji("📌")
      .setURL("https://discord.gg/phnR6PfDUe")
      )

    let embed = new MessageEmbed()
    .setAuthor({ name: "", iconURL: "" })
    .setColor("PURPLE")
    .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`Opa, tudo bom? Sou o Astro Music e estou aqui para melhorar a diversão em seu servidor com a música. Fui feito com [Discord.js](https://discord.js.org/#/) e estou usando o [Lavalink](https://github.com/davidffa/lavalink/releases) para tocar as músicas. Me adicione no seu servidor e vamos embarcar em uma viagem para este novo planeta chamado Música.`)
    .addFields([
      { name: "<:id:970752418461663263> Sobre", value: `> <:bot:970750198219427901> Nome: \`${this.client.user.tag}\`\n> <:dev:970750017495236768> Desenvolvedor: \`${owner}\`\n> <:uptime:970758956760846367> Online há: \`${uptime}\`\n> <:ping:970754837711044658> Ping: \`${this.client.ws.ping.toFixed(2)}ms\`\n> <:slash:970750510174986320> Slash: \`/\``, inline: false },
      { name: "<:info:970750652332527697> Informações", value: `> <:servers:970751951736307822> Servidores: \`${guilds}\`\n> <:users:970752089934426153> Membros: \`${users}\`\n> <:chats:970752208155078666> Chats: \`${channels}\``, inline: false },
      { name: "<:lavalink:970757500485894154> Lavalink", value: `> <:playing:970751016326811648> Tocando: \`${playing}\`\n> <:node:970750775833804880> Nodes: \`${nodes}\``, inline: false },
    ])

    interaction.reply({ embeds: [embed], components: [row] })

  }
}