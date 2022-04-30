const Event = require("../../Handlers/Event");
const settings = require(process.cwd() + "/src/BotConfig/settings.json");

const { MessageEmbed, Permissions } = require("discord.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "voiceStateUpdate",
    });
  }

  run = async (oS, nS) => {

    if (oS.channelId && (!nS.channelId || nS.channelId)) {
      let player = this.client.vulkava.players.get(nS.guild.id);
      if (player && oS.channelId === player.voiceChannelId) {
        if (
          !(
            (!oS.streaming && nS.streaming) ||
            (oS.streaming && !nS.streaming) ||
            (!oS.serverMute &&
              nS.serverMute &&
              !nS.serverDeaf &&
              !nS.selfDeaf) ||
            (oS.serverMute &&
              !nS.serverMute &&
              !nS.serverDeaf &&
              !nS.selfDeaf) ||
            (!oS.selfMute && nS.selfMute && !nS.serverDeaf && !nS.selfDeaf) ||
            (oS.selfMute && !nS.selfMute && !nS.serverDeaf && !nS.selfDeaf) ||
            (!oS.selfVideo && nS.selfVideo) ||
            (oS.selfVideo && !nS.selfVideo)
          )
        ) {
          if (
            settings.leaveOnEmpty_Channel.enabled &&
            player &&
            (!oS.channel.members ||
              oS.channel.members.size === 0 ||
              oS.channel.members.filter(
                (mem) => !mem.user.bot && !mem.voice.deaf && !mem.voice.selfDeaf
              ).size < 1)
          ) {
            setTimeout(async () => {
              try {
                let vc = nS.guild.channels.cache.get(player.voiceChannelId);
                if (vc) vc = await vc.fetch();
                if (!vc)
                  vc =
                    (await nS.guild.channels
                      .fetch(player.voiceChannelId)
                      .catch(() => {})) || false;
                if (!vc) return player.destroy();
                if (
                  !vc.members ||
                  vc.members.size == 0 ||
                  vc.members.filter(
                    (mem) =>
                      !mem.user.bot && !mem.voice.deaf && !mem.voice.selfDeaf
                  ).size < 1
                ) {
                  player.destroy();
                  let embed = new MessageEmbed()
                    .setAuthor({
                      name: nS.guild.name,
                      iconURL:
                        nS.guild.iconURL({ dynamic: true }) ||
                        `https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg`,
                    })
                    .setTitle("💨 Chamada Vázia...")
                    .setDescription(
                      `A chamada esteve vázia durante ${this.client.util.duration(
                        settings.leaveOnEmpty_Channel.time_delay
                      )} então eu sai.\n***Removendo as músicas...***`
                    );
                  this.client.channels.cache
                    .get(player.textChannelId)
                    .send({ embeds: [embed] });
                } else {
                }
              } catch (e) {
                console.log(e);
              }
            }, settings.leaveOnEmpty_Channel.time_delay || 30000);
          }
        }
      }
    }

    if (
      nS.id === this.client.user.id &&
      nS.channelId !== oS.channelId &&
      !oS.guild.me.voice.deaf
    ) {
      if (
        nS.guild.me.permissions.has(Permissions.FLAGS.DEAFEN_MEMBERS) ||
        (nS.channel &&
          nS.channel
            .permissionsFor(nS.guild.me)
            .has(Permissions.FLAGS.DEAFEN_MEMBERS))
      ) {
        nS.setDeaf(true).catch(() => {});
      }
    }

    if (
      nS.id === this.client.user.id &&
      oS.serverDeaf === true &&
      nS.serverDeaf === false
    ) {
      if (
        nS.guild.me.permissions.has(Permissions.FLAGS.DEAFEN_MEMBERS) ||
        (nS.channel &&
          nS.channel
            .permissionsFor(nS.guild.me)
            .has(Permissions.FLAGS.DEAFEN_MEMBERS))
      ) {
        nS.setDeaf(true).catch(() => {});
      }
    }

    if(nS.id === this.client.user.id) {
      let player = await this.client.vulkava.players.get(nS.guild.id)
      if(!player) return

      if(oS.channelId !== null && nS.channelId == null) {
        await this.client.channels.cache.get(player.textChannelId).send({ content: `Eu fui desconectado da chamada...\n***Removendo as músicas da fila...***`})
        player.destroy()

        const data = this.client.vulkava.channelTimeouts.get(nS.guild.id);
        if (!data) return;
        clearTimeout(data.timeout);
        data.message?.delete().catch(() => { });
        this.client.vulkava.channelTimeouts.delete(nS.guild.id);
        return;
      }
    }
  };
};
