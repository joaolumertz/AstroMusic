const { Permissions, MessageEmbed } = require("discord.js");
const { ConnectionState } = require("vulkava");
const Command = require("../../Handlers/Command");
const ms = require("ms");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "〔🎶 • Música〕Coloque uma música na chamada em que você está...",
      options: [
        {
          name: "search",
          description: "Procure a música",
          type: "STRING",
          required: true,
        },
      ],
    });
  }
  run = async (interaction, ls) => {
    const { options } = interaction;
    const Search = options.getString("search");

    const voiceChannel = interaction.member.voice.channel;

    if(!voiceChannel) return interaction.reply({ content: this.client.la[ls].music.common.notvchannel, ephemeral: true })

    const player = await this.client.vulkava.createPlayer({
      guildId: interaction.guild.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: interaction.channel.id,
      selfDeaf: true,
    });

    player.effects = []

    try {
      let res = await this.client.vulkava.search(Search);

      if (res.loadType === "LOAD_FAILED") {
        return interaction.reply({ content: this.client.la[ls].music.play.load_failed, ephemeral: true });
      } else if (res.loadType === "NO_MATCHES") {
        return interaction.reply({ content: this.client.la[ls].music.play.no_matches, ephemeral: true });
      } else {

        if (player.radio) {
          player.skip();
          delete player.radio();
        }

        if (player.state === ConnectionState.DISCONNECTED) {
          if (
            !voiceChannel
              .permissionsFor(this.client.user.id)
              .has(Permissions.FLAGS.MANAGE_CHANNELS) &&
            voiceChannel.userLimit &&
            voiceChannel.voiceMembers.size >= voiceChannel.userLimit
          ) {
            player.destroy();
            return interaction.reply({ content: this.client.la[ls].music.play.channelfull, ephemeral: true });
          }
          player.connect();
        }

        player.textChannelId = interaction.channel.id;

        if (res.loadType === "PLAYLIST_LOADED") {
          const playlist = res.playlistInfo;

          for (const track of res.tracks) {
            track.setRequester(interaction.user);
            player.queue.push(track);
          }

          if (!player.playing && !player.paused) player.play();

          const embed = new MessageEmbed()
            .setAuthor({
              name: interaction.guild.name,
              iconURL:
                interaction.guild.iconURL({ dynamic: true }) ||
                `https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg`,
            })
            .setColor("PURPLE")
            .setTitle(this.client.la[ls].music.play.playlist_embed.title)
            .setThumbnail(res.tracks[0].thumbnail)
            .addFields([
              { name: this.client.la[ls].music.play.playlist_embed.field1, value: `\`${playlist.name}\``, inline: true },
              { name: this.client.la[ls].music.play.playlist_embed.field2, value: `${res.tracks[0].requester.toString()}`, inline: true },
              { name: "||\n||", value: `||\n||`, inline: true },
              {
                name: this.client.la[ls].music.play.playlist_embed.field3,
                value: `\`${this.client.util.format(playlist.duration || 0, { long: true })}\``,
                inline: true
              },
              { name: this.client.la[ls].music.play.playlist_embed.field4, value: `\`${res.tracks.length}\``, inline: true },
              { name: "||\n||", value: `||\n||`, inline: true },
            ]);

          const urlRegex =
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

          urlRegex.test(Search) && embed.setURL(Search);

          return await interaction.reply({ embeds: [embed] });
        } else {
          const tracks = res.tracks;

          tracks[0].setRequester(interaction.user);
          player.queue.push(tracks[0]);
            
          if (!player.playing && !player.paused) player.play();
          await interaction.reply({ content: `${this.client.la[ls].music.play.added_song}\n\`${tracks[0].title}\`.` }).catch(() => {});
        }
      }
    } catch (e) {
      interaction.reply({
        content: `${this.client.la[ls].music.play.error}\n${e}`,
      });
    }
  };
};
