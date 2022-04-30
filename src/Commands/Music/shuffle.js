const Command = require('../../Handlers/Command')
const { MessageEmbed } = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
        name: 'shuffle',
        description: '〔🎶 • Música〕Embaralhe a ordem de reprodução da fila...',
    })
  }
  
  run = async (interaction, ls) => {
    const player = this.client.vulkava.players.get(interaction.guild.id);

    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    if(player.queue.length <= 1)
      return interaction.reply({ content: "Não há músicas suficientes na playlist. Use `/play` para adicionar mais músicas.", ephemeral: true })

    const embedShuffle = new MessageEmbed()
    .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) || "https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg"})
    .setTitle("Playlist Embaralhada")
    .setColor("BLUE")
    .setDescription(`A playlist foi embaralhada com sucesso.\n**Por** ${interaction.user}`)

    player.shuffleQueue();
    interaction.reply({ embeds: [embedShuffle] })
  }
}