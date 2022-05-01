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

      const embed = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("🎶 Tocando Agora")
      
      if(!player.radio) {
         player.lastPlayingMsgID = await channel.send(`🎶 Tocando Agora...\n\`${track.title}\`\n**Pedido por** \`${requester.tag}\`.`).then(m => m.id)
      }
    });
    
    this.on('queueEnd', async (player) => {
      const channel = client.channels.cache.get(player.textChannelId);
    
      channel.send(`Todas as músicas da fila acabaram...\n***Saindo...***`);
    
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

  async getRadioNowPlaying(radio) {
    let artist, songTitle;
    const xmlParser = new Parser();

    if (['CidadeHipHop', 'CidadeFM', 'RadioComercial', 'M80'].includes(radio)) {
      const xml = await this.client.request(`https://${radio === 'M80' ? 'm80' : radio === 'RadioComercial' ? 'radiocomercial' : 'cidade'}.iol.pt/nowplaying${radio === 'CidadeHipHop' ? '_Cidade_HipHop' : ''}.xml`).then(r => r.body.text());

      const text = await xmlParser.parseStringPromise(xml).then(t => t.RadioInfo.Table[0]);

      artist = text['DB_DALET_ARTIST_NAME'][0];
      songTitle = text['DB_DALET_TITLE_NAME'][0];
    } else if (radio === 'RFM') {
      const xml = await this.client.request('https://configsa01.blob.core.windows.net/rfm/rfmOnAir.xml')
        .then(async r => Buffer.from(await r.body.arrayBuffer()).toString('utf16le'));

      const text = await xmlParser.parseStringPromise(xml).then(parsed => parsed.music.song[0]);

      artist = text.artist[0];
      songTitle = text.name[0];
    }

    return { artist, songTitle };
  }
}