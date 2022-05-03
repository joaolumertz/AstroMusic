const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "seek",
      description: "〔🎶 • Música〕Pule para um determinado tempo da música...",
      options: [
        {
          name: 'time',
          description: 'Informe o tempo da música para o qual quer avançar.',
          type: 'STRING',
          required: true
        }
      ]
    })
  }
  run = async (interaction, ls) => {

    const player = await this.client.vulkava.players.get(interaction.guild.id)

    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const tempo = await interaction.options.getString('time')

    const seek = async (time) => {
      if(Number(time) !== 0 && !Number(time.replace(/:/g, ''))) {
        interaction.reply({ content: this.client.la[ls].music.seek.invalid_time, ephemeral: true })
        return;
      }

      if(!player.current?.duration) {
        interaction.reply({ content: this.client.la[ls].music.seek.error_duration, ephemeral: true })
        return;
      }

      let finalTime = 0;

      if(time.includes(':')) {
        const parts = time.split(':')

        if(parts.length > 3) {
          interaction.reply({ content: `${this.client.la[ls].music.seek.time_error}`, ephemeral: true })
          return;
        }

        const len = parts.length
        for(let i = 0; i < len; i++) {
          finalTime += Number(parts.pop()) * Math.pow(60, i)
        }
      }

      if((finalTime && (finalTime < 0 || finalTime * 1000 > player.current?.duration)) || Number(time) < 0 || Number(time) * 1000 > player.current?.duration) {
        interaction.reply({ content: `${this.client.la[ls].music.seek.time_error}`, ephemeral: true })
        return;
      }

      player.seek(finalTime && (finalTime * 1000) || Number(time) * 1000);
      interaction.reply({ content: `${this.client.la[ls].music.seek.time_success}`})
    } 

    const isDJ = await this.client.vulkava.hasDJRole(interaction.member)

    if(this.client.guildCache.get(interaction.guild.id)?.djRole) {
      if(isDJ || interaction.user === player.current?.requester || voiceChannel.members.map(m => m.user).filter(m => !m.bot).length === 1) {
        seek(tempo);
        return;
      }
      interaction.reply({ content: this.client.la[ls].music.common.notdjreq, ephemeral: true })
    } else seek(tempo)
  }
}