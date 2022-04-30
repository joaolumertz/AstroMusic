const Command = require('../../Handlers/Command')
const Canvas = require('canvas')
const { Permissions, MessageAttachment} = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "nowplaying",
      description: "〔🎶 • Música〕Veja a música que está tocando no momento..."
    })
  }
  run = async (interaction, ls) => {

    const player = await this.client.vulkava.players.get(interaction.guild.id)
    
    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    if(player.radio) {
      const { artist, songTitle } = await this.client.vulkava.getRadioNowPlaying(player.radio)

      if(artist && songTitle) {
        interaction.reply({ content: `:radio: Tocando a música \`${artist} - ${songTitle}\` na rádio \`${player.radio}\``})
        return;
      }

      interaction.reply({ content: `:radio: Tocando a rádio \`${player.radio}\``})
      return;
    }

    if(interaction.channel.permissionsFor(this.client.user.id).has(Permissions.FLAGS.ATTACH_FILES)) {
      const canvas = Canvas.createCanvas(370, 410);
      const ctx = canvas.getContext('2d')

      const background = await Canvas.loadImage(process.cwd() + "/src/Images/npBackground2.png")

      let title = player.current.title.length <= 30 ? player.current.title : player.current.title.slice(0, 30) + "..."

      const linearGradientText = ctx.createLinearGradient(0,0,550,0)
      linearGradientText.addColorStop(0, "#1C1C1C")
      linearGradientText.addColorStop(1, "#fff")
      
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 20px Arial'
      if(player.current.title.length <= 30){
        ctx.fillStyle = '#1C1C1C'
      } else {
        ctx.fillStyle = linearGradientText
      }
      ctx.textAlign = 'center'
      ctx.fillText(title.replace(" ...", "..."), 185, 270, 300)

      if(player.current.thumbnail) {
        let url = player.current.thumbnail

        let { buffer, status } = await this.client.request(url).then(async r => {
          return {
            buffer: await r.body.arrayBuffer(),
            status: r.statusCode
          }
        });

        if(status !== 200) buffer = await this.client.request(player.current.thumbnail).then(r => r.body.arrayBuffer());

        const thumb = await Canvas.loadImage(Buffer.from(buffer));
        ctx.drawImage(thumb, 70, 67, 240, 135);
      }

      const duration = await this.client.util.format(player.current.duration)
      const positionPercent = await player.exactPosition / player.current.duration

      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'start'
      ctx.fillStyle = '#1C1C1C'
      ctx.fillText(await this.client.util.format(player.exactPosition), 10, 306)
      ctx.fillText(duration, canvas.width - ctx.measureText(duration).width - 10, 306)

      ctx.beginPath()
      ctx.moveTo(60, 300)
      ctx.lineTo(canvas.width - 60, 300)
      ctx.lineWidth = 6
      ctx.strokeStyle = '#333'
      ctx.stroke()

      const linearGradient = ctx.createLinearGradient(0, 0, 340, 0)
      linearGradient.addColorStop(0, '#DB7093')
      linearGradient.addColorStop(1, '#FF69B4')

      if(positionPercent) {
        ctx.beginPath()
        ctx.moveTo(60, 300)
        ctx.lineTo(Math.round((canvas.width - 120) * positionPercent + 60), 300)
        ctx.lineWidth = 6
        ctx.strokeStyle = linearGradient
        ctx.stroke()
      }

      const attachment = new MessageAttachment(canvas.toBuffer(), 'nowplaying.png')
      interaction.reply({
        content: `Estou tocando a música\n\`${player.current.title}\`\n**Pedido por** ${player.current.requester}`,
        files: [attachment]
      })
    } else if(interaction.channel.permissionsFor(this.client.user.id).has(Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
      .setTitle('Tocando')
      .setColor("RANDOM")
      
      if(player.current.uri) embed.setURL(player.current.uri)
      const requester = player.current.requester
      embed.setDescription(`\`${player.current.title}\` requisitado por \`${requester.username}#${requester.discriminator}\` com a duração de \`${this.client.util.format(player.exactPosition)}/${this.client.util.format(player.current.duration)}\``)
      return await interaction.reply({ embeds: [embed] })
    } else {
      return await interaction.reply({ content: "Preciso das permissão 'Anexar Arquivo' ou 'Anexar Links' para executar o comando."})
    }

  }
}