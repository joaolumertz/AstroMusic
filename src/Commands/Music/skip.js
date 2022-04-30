const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "〔🎶 • Música〕Pule para a próxima música da fila..."
    })
  }
  run = async (interaction, ls) => {
    
    const player = await this.client.vulkava.players.get(interaction.guild.id)

    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const skip = async (dj) => {
      player.skip()

      if(!player.queue[0] && !player.trackRepeat && !player.queueRepeat) {
        const channel = this.client.channels.cache.get(player.textChannelId)
        if(channel.type !== "GUILD_TEXT") {
          channel.messages.cache.get(player.lastPlayingMsgID).delete().catch(() => { })
        }

        player.destroy()
        interaction.reply({ content: `A lista de músicas acabou...\nUse **\`/play\`** e adicione mais músicas...` })
        return;
      }

      interaction.reply({ content: `${dj ? `A música que estava tocando foi pulada por um DJ!` : `A música foi pulada!`}`})
    }

    if(await this.client.vulkava.hasDJRole(interaction.member)) {
      skip(true)
    } else {
      if (this.client.guildCache.get(interaction.guild.id)?.djRole) {
        if(interaction.user === player.current?.requester || voiceChannel.members.map(m => m.user).filter(m => !m.bot).length === 1) {
          skip(false);
          return;
        }
        interaction.reply({ content: this.client.la[ls].music.common.notdjreq, ephemeral: true })
      } else skip(false);
    }
  }
}