const Command = require('../../Handlers/Command')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'nodes',
      description: "〔❗ • Info〕Veja as informações dos nodes do Lavalink."
    })
  }
  run = async (interaction) => {

    const nodes = this.client.vulkava.nodes

    let pingnode;
    let uptime;
    let text = '';

    for (let i = 0; i < nodes.length; i++) {
      const state = nodeSates(nodes[i].state)
      pingnode = await nodes[i].ping()
      uptime = await this.client.util.msToDate(await nodes[i].stats.uptime)
      text += `${state} ( ${await nodes[i].identifier} ) Tocando: ${await nodes[i].stats.playingPlayers} | Players: ${await nodes[i].stats.players} | Ping: ${pingnode}ms | Uptime: ${uptime}\n`
    }

    interaction.reply({ content: `\`\`\`\n${text}\`\`\`` })

  }
}

function nodeSates(states) {
  switch(states) {
    case 0 : { 
      return '🟠';
    }
    case 1 : {
      return '🟢'
    }
    case 2 : {
      return '🔴'
    }
  }
}