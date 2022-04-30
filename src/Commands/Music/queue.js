const Command = require('../../Handlers/Command')
const { MessageEmbed } = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      description: '〔🎶 • Música〕Veja as músicas da fila...',
      options: [
        {
          name: "pagina",
          description: "Navegue pelas páginas da playlist.",
          type: "NUMBER",
        }
      ]
    })
  }
  
  run = async (interaction, ls) => {

    let page = interaction.options.getNumber('pagina') || 1
    const player = this.client.vulkava.players.get(interaction.guild.id);

    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const queueEmbed = new MessageEmbed()
    .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) || "https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg"})
    .setColor("PURPLE");

    const queue = player.queue

    const multiple = 10

    const end = page * multiple;
    const start = end - multiple;

    let tracks = queue.slice(start, end)

    if(player.current) queueEmbed.addField("🎶 Tocando Agora", `\`[${this.client.util.format(player.current?.duration)}]\` - [${player.current?.title}](${player.current?.uri})`);
    let values;

    if(!tracks.length) {
      queueEmbed.setDescription(`Não há nenhuma música na ${page > 1 ? `pagina ${page}` : "playlist" }`)
    } else {
      queueEmbed.setDescription(tracks.map((track, i) => {
        return `**\`${start + (++i)}\` - \`[${this.client.util.format(track.duration)}]\`** [${track.title}](${track.uri})`
      }).join('\n'))
    }

    const maxPages = Math.ceil(queue.length / multiple);

    queueEmbed.setFooter({ text: `Página ${page > maxPages ? maxPages : page} de ${maxPages}` })
    return interaction.reply({ embeds: [queueEmbed] })
  }
}