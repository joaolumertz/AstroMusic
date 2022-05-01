const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "remove",
      description: "〔🎶 • Música〕Remova uma música da fila..."
    })
  }
  run = async (interaction, ls) => {
    const player = await this.client.vulkava.players.get(interaction.guild.id)

    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const remove = async (pos) => {
      if(!player.queue.length) {
        interaction.reply({ content: `Não tem músicas na fila...`, ephemeral: true})
      }

      if(pos <= 0 || pos > player.queue.length) {
        interaction.reply({ content: `Número invalido. Tente um número entre 1 e ${player.queue.length}`, ephemeral: true })
        return;
      }

      player.queue.splice(pos - 1, 1);
      interaction.reply({ content: `A música de número ${pos} da fila foi removida.`})
    }

    const isDJ = await this.client.vulkava.hasDJRole(interaction.member)
  
    if(this.client.guildCache.get(interaction.guild.id)?.djRole) {
      if(!player.queue.length) {
        interaction.reply({ content: `Não tem músicas na fila...`, ephemeral: true })
        return;
      }
      if(isDJ || interaction.user === player.current?.requester || voiceChannel.members.map(m => m.user).filter(m => !m.bot).length === 1) {
        remove(parseInt(musica));
        return;
      }
      interaction.reply({ content: this.client.la[ls].music.common.notdjreq, ephemeral: true })
    } else remove(parseInt(musica))
  }
}