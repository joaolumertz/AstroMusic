const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "〔🎶 • Música〕Pause a música que está tocando..."
    })
  }
  run = async (interaction, ls) => {

    const player = await this.client.vulkava.players.get(interaction.guild.id)
    
    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 
    
    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const pause = () => {
      if(player.paused) {
        return interaction.reply({ content: this.client.la[ls].music.pause.alr_paused, ephemeral: true })
      }

      player.pause(true)
      interaction.reply({ content: `${this.client.la[ls].music.pause.paused.replace("<music_title>", player.current?.title).replace("<user>", interaction.user)}` })
    }

    const isDJ = await this.client.vulkava.hasDJRole(interaction.member)

    if(this.client.guildCache.get(interaction.guild.id)?.djRole) {
      if(isDJ || voiceChannel.members.map(m => m.user).filter(m => !m.bot).length === 1) {
        pause()
        return;
      }
      interaction.reply({ content: this.client.la[ls].music.common.notdj, ephemeral: true })
    } else pause()

  }
}