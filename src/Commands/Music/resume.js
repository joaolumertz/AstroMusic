const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "〔🎶 • Música〕Despause a música que estava tocando..."
    })
  }
  run = async (interaction, ls) => {

    const player = await this.client.vulkava.players.get(interaction.guild.id)
    
    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 
    
    const voiceChannel = await interaction.member.voice.channel
    
    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const resume = () => {
      if(!player.paused) {
        return interaction.reply({ content: "A música não está pausada...", ephemeral: true })
      }

      player.pause(false)
      interaction.reply({ content: `A música \`${player.current?.title}\`\nFoi despausada com sucesso por ${interaction.user}.` })
    }

    const isDJ = await this.client.vulkava.hasDJRole(interaction.member)

    if(this.client.guildCache.get(interaction.guild.id)?.djRole) {
      if(isDJ || voiceChannel.members.map(m => m.user).filter(m => !m.bot).length === 1) {
        resume()
        return;
      }
      interaction.reply({ content: this.client.la[ls].music.common.notdj, ephemeral: true })
    } else resume()

  }
}