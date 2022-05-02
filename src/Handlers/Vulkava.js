const { Vulkava } = require('vulkava');
const { MessageEmbed, MessageSelectMenu, MessageButton, Permissions } = require("discord.js")


module.exports = class NewBot extends Vulkava {
  constructor(client, nodes) {
    super({
      nodes: nodes,
      sendWS: (guildId, payload) => {
        client.guilds.cache.get(guildId)?.shard.send(payload)
      },
      spotify: {
        clientId: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET
      }
    })

    this.client = client
    this.channelTimeouts = new Map()
    
    this.on('nodeConnect', async (node) => {
      console.log(`${node.identifier} (ws${node.options.secure ? 's' : ''}://${node.options.hostname}:${node.options.port}) conectado!`);

      for (const player of [...this.players.values()].filter(p => p.node === node).values()) {
        const position = player.position;
        player.connect();
        player.play({ startTime: position });
      }
    });

    this.on('error', async (node, error) => {
      console.log(`Erro no ${node.identifier}: ${error.message}`)
    });

    this.on('warn', async (node, warn) => {
      console.log(`Aviso no ${node.identifier}: ${warn}`)
    });

    this.on('nodeDisconnect', async (node, code, reason) => {
      console.log(`O ${node.identifier} desconectou. Codigo: ${code}. Motivo: ${reason === '' ? 'Não Informado' : reason}`);
    });
    
    this.on('trackStart', async (player, track) => {
      if(player.reconnect) {
        delete player.reconnect;
        return;
      }

      
      if(!player.textChannelId) return;

      const channel = this.client.channels.cache.get(player.textChannelId)
      if(!channel || channel.type !== "GUILD_TEXT") return;

      if(player.lastPlayingMsgID) {
        channel.messages.cache.get(player.lastPlayingMsgID).delete()
      }

      if(!channel.permissionsFor(this.client.user.id).has(Permissions.FLAGS.SEND_MESSAGES)) {
        delete player.lastPlayingMsgID
        return;
      }
      
      const requester = player.current?.requester
      
      const guild = await this.client.guilds.cache.get(player.guildId)

      const ls = await this.client.db.guilds.findOne({ _idG: guild.id }).settings.lang

      const embed = new MessageEmbed()
      .setColor("PURPLE")
      .setTitle(this.client.la[ls].music.track_start.title)
      .setThumbnail(track.thumbnail)
      .setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) || `https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg` })
      .addFields(
        [
          { name: this.client.la[ls].music.track_start.field1, value: `\`${track.title}\``, inline: false },
          { name: this.client.la[ls].music.track_start.field2, value: `\`${requester.tag}\``, inline: false },
          { name: this.client.la[ls].music.track_start.field3, value: `\`${this.client.util.format(track.duration)}\``, inline: false },
        ]
      )
      
      if(!player.radio) {
         player.lastPlayingMsgID = await channel.send({ embeds: [embed] }).then(m => m.id)
      }
    });
    
    this.on('queueEnd', async (player) => {
      const channel = client.channels.cache.get(player.textChannelId);

      const guild = await this.client.guilds.cache.get(player.guildId)
      const ls = await this.client.db.guilds.findOne({ _idG: guild.id }).settings.lang

      channel.send(this.client.la[ls].music.queue_end.message);
    
      player.destroy();
    })
  }

  async hasDJRole(member) {
    const guildData = this.client.guildCache.get(member.guild.id);

    if (guildData && guildData.djRole) {
      const djRoleID = guildData.djRole;
      const djRole = member.guild.roles.cache.get(djRoleID);

      if (!djRole) {
        guildData.djRole = '';
        const guildDBData = await this.client.db.guilds.findOne({ _idG: member.guild.id });

        if (guildDBData) {
          this.client.db.guilds.findOneAndUpdate({ _idG: member.guild.id }, { $set: {'settings.djRole': '' }})
        } else {
          this.client.db.guilds.create({ _idG: member.guild.id, settings: { djRole: ''} })
        }
        return false;
      }

      if (member?.roles.cache.find(r => r.id === djRoleID)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}