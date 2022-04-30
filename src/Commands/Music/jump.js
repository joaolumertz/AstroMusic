const Command = require('../../Handlers/Command')
const { MessageEmbed } = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
    name: 'jump',
    description: '〔🎶 • Música〕Pula para alguma música da playlist...',
    options: [
      {
        name: "numero",
        description: "Informe o número da música na fila.",
        type: "NUMBER",
        required: true
      }
    ]
    })
  }
  
  run = async (interaction, ls) => {
    const player = this.client.vulkava.players.get(interaction.guild.id);
    const number = interaction.options.getNumber('numero')
    
    if(!player || !player.current) return interaction.reply({ content: this.client.la[ls].music.common.notplaying, ephemeral: true }) 

    const voiceChannel = await interaction.member.voice.channel

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel })
  
    if(voiceChannel.id !== player.voiceChannelId) return interaction.reply({ content: this.client.la[ls].music.common.notvchannelwithbot, ephemeral: true })

    const jump = async () => {
      if(player.queue.length == 1)
      return interaction.reply({ content: "Tem apenas uma música na fila. Use `/skip` pra pular para a música seguinte.", ephemeral: true })

      if(number < 1)
        return interaction.reply({ content: `Número inválido. Informe um número de 2 a ${player.queue.size}`, ephemeral: true })
      
      if(number > player.queue.size)
        return interaction.reply({ content: "O número informado é maior que a quantidade de músicas em espera.", ephemeral: true })

      if(number == 1)
        return interaction.reply({ content: "Caso queira pular para a música seguinte use `/skip`.", ephemeral: true })

      player.queue.splice(0, number - 1)
      player.skip()

      const embedJump = new MessageEmbed()
      .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) || "https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg"})
      .setTitle("Música Pulada")
      .setColor("GREEN")
      .setDescription(`O usuário ${interaction.user} pulou para a música número ${number} da fila.`)
      
      return interaction.reply({ embeds: [embedJump] })
    }

    const isDJ = await this.client.vulkava.hasDJRole(interaction.member)

    if(await this.client.guildCache.get(interaction.guild)?.djRole) {
      if(isDJ || voiceChannel.members.map(m => m.user).filter(m => !m.bot).length === 1) {
        jump()
        return;
      }
      interaction.reply({ content: this.client.la[ls].music.common.notdj, ephemeral: true })
    } else jump();
  } 
}