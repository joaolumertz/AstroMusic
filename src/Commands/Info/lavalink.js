const Command = require('../../Handlers/Command')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'lavalink',
      description: "Veja as informações dos nodes do Lavalink"
    })
  }
  run = async (interaction) => {

    const nodes = [
      this.client.vulkava.nodes.find(n => n.identifier === "USA Node"),
      this.client.vulkava.nodes.find(n => n.identifier === "Europe Node")
    ]

    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('left')
      .setStyle('PRIMARY')
      .setEmoji('◀'),
      new MessageButton()
      .setCustomId('right')
      .setStyle('PRIMARY')
      .setEmoji('▶')
    )

    const embed = await this.getNodeInfoEmbed(interaction.member, nodes[0])

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })

    let page = 1

    const filter = (i) => i.user.id === interaction.member.id
    const collector = msg.createMessageComponentCollector({ filter, time: (60000 * 2), componentType: "BUTTON" })

    collector.on('collect', async (i) => {
      i.deferUpdate()
      switch(i.customId) {
        case 'left' : 
          if(page === 1) return;
          page--;
          row.components[0].disabled = true;
          row.components[1].disabled = false;
          break;

        case 'right' :
          if(page == 2) return
          page++;
          row.components[0].disabled = false;
          row.components[1].disabled = true;
          break;
      }

      const e = await this.getNodeInfoEmbed(interaction.member, nodes[page-1]);
      interaction.editReply({ embeds: [e], components: [row] })
    })

  }

  async getNodeInfoEmbed(author, node) {
    const versions = node.versions;
    const lavalinkPing = await node.ping();

    return new MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Status dos Nodes do Lavalink')
    .setDescription(`Versão do **[Lavalink](https://github.com/davidffa/lavalink/releases)** que uso.\nWrapper do Lavalink: **[Vulkava](https://npmjs.com/package/vulkava)**.`)
    .addFields([
      { name: ":id: Nome", value: `\`${node.identifier}\``, inline: true },
      { name: "🎶 Tocando", value: `\`${node.stats.players}\``, inline: true },
      { name: "⏱ Uptime", value: `\`${this.client.util.msToDate(node.stats.uptime)}\``, inline: true },
      { name: "🖥 CPU", value: `Cores: \`${node.stats.cpu.cores}\`\nLavalink: \`${~~(node.stats.cpu.lavalinkLoad * 100)}%\`\nSistema: \`${~~(node.stats.cpu.systemLoad * 100)}%\``, inline: true },
      { name: "💾 RAM", value: `\`${(node.stats.memory.used / 1024 / 1024).toFixed(2)}MB\``, inline: true },
      { name: "🔔 Ping", value: `\`${lavalinkPing}ms\``, inline: true },
      { name: "♻ Versões", value: `Lavaplayer: \`${versions?.LAVAPLAYER}\`\nBuild: \`${versions?.BUILD}\`\nBuild em: <t:${Math.floor(versions?.BUILDTIME / 1000)}:d>`, inline: true },
      { name: "\u200B", value: `<:spring:968601050909147196> \`${versions?.SPRING}\`\n<:kotlin:968601655543205949> \`${versions?.KOTLIN}\`\n<:java:968601048455475241> \`${versions?.JVM}\``, inline: true },
    ])
  }
}