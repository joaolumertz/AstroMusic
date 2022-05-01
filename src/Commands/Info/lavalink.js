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
      this.client.vulkava.nodes.find(n => n.identifier === "Saturno"),
      this.client.vulkava.nodes.find(n => n.identifier === "Júpiter"),
      this.client.vulkava.nodes.find(n => n.identifier === "Netuno"),
      this.client.vulkava.nodes.find(n => n.identifier === "Plutão")
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
          if(page === 2) {
            row.components[0].disabled = true;
          }
          page--;
          row.components[1].disabled = false;
          break;

        case 'right' :
          if(page == 4) return;
          if(page === 3) row.components[1].disabled = true;
          page++;
          row.components[0].disabled = false;
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
      { name: "<:id:970049925905788948> Nome", value: `\`${node.identifier}\``, inline: true },
      { name: "🎶 Tocando", value: `\`${node.stats.players}\``, inline: true },
      { name: "⏱ Uptime", value: `\`${this.client.util.msToDate(node.stats.uptime)}\``, inline: true },
      { name: "🖥 CPU", value: `<:cpu:970051876009672734> Cores: \`${node.stats.cpu.cores}\`\n<:ram:970052731832238150> RAM: \`${(node.stats.memory.used / 1024 / 1024).toFixed(2)}MB\`\nLavalink: \`${~~(node.stats.cpu.lavalinkLoad * 100)}%\`\n<:sistema:970051302639927396> Sistema: \`${~~(node.stats.cpu.systemLoad * 100)}%\``, inline: true },
      { name: "🔔 Ping", value: `\`${lavalinkPing}ms\``, inline: true },
      { name: "♻ Versões", value: `Lavaplayer: \`${versions?.LAVAPLAYER}\`\nBuild: \`${versions?.BUILD}\`\nBuild em: <t:${Math.floor(versions?.BUILDTIME / 1000)}:d>`, inline: true },
      { name: "\u200B", value: `<:spring:968601050909147196> \`${versions?.SPRING}\`\n<:kotlin:968601655543205949> \`${versions?.KOTLIN}\`\n<:java:968601048455475241> \`${versions?.JVM}\``, inline: true },
    ])
  }
}