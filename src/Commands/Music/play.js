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

      if(res.tracks.length === 1 && res.tracks[0].title != player.current?.title) res = await this.client.vulkava.search(res.tracks[0].title)

      if (res.loadType === "LOAD_FAILED") {
        return interaction.reply({ content: "Falha ao carregar a música." });
      } else if (res.loadType === "NO_MATCHES") {
        return interaction.reply({ content: "Nenhuma música encontrada" });
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
            return interaction.reply({ content: "Canal está cheio" });
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
            .setTitle("Playlist Adicionada!")
            .setThumbnail(res.tracks[0].thumbnail)
            .addFields([
              { name: "Playlist", value: `\`${playlist.name}\``, inline: true },
              { name: "Solicitado por", value: `${res.tracks[0].requester.toString()}`, inline: true },
              { name: "||\n||", value: `||\n||`, inline: true },
              {
                name: "Duração",
                value: `\`${this.client.util.format(playlist.duration || 0, { long: true })}\``,
                inline: true
              },
              { name: "Músicas", value: `\`${res.tracks.length}\``, inline: true },
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

          // let embedE = new MessageEmbed()
          //   .setAuthor({
          //     name: interaction.guild.name,
          //     iconURL:
          //       interaction.guild.iconURL({ dynamic: true }) ||
          //       `https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg`,
          //   })
          //   .setColor("RANDOM")
          //   .setTitle("Musíca adicionada")
          //   .setURL(tracks[0].uri)
          //   .setDescription(`Nova músca adicionada à fila.`)
          //   .setThumbnail(tracks[0].thumbnail)
          //   .setFields(
          //     { name: "Título", value: `\`${tracks[0].title}\``, inline: true },
          //     {
          //       name: "Solicitado por",
          //       value: tracks[0].requester.toString(),
          //       inline: true,
          //     },
          //     { name: "||\n||", value: "||\n||", inline: true },
          //     {
          //       name: "Duração",
          //       value: `\`${ms(tracks[0].duration, { long: true })}\``,
          //       inline: true,
          //     },
          //     { name: "||\n||", value: "||\n||", inline: true }
          //   );

            
          if (!player.playing && !player.paused) player.play();
          await interaction.reply({ content: `📋 Nova música adicionada na fila!\n${tracks[0].title}.` }).catch(() => {});
        }
      }
    } catch (e) {
      interaction.reply({
        content: `Ocorreu um erro ao procurar a música.\n${e}`,
      });
    }
  };

  async runAutoComplete(interaction, value) {
    if(!value) {
      interaction.result([]);
      return;
    }

    const res = await this.client.request(`https://clients1.google.com/complete/search?client=youtube&hl=pt-BR&ds=yt&q=${encodeURIComponent(value)}`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
      }
    }).then(async (r) => Buffer.from(await r.body.arrayBuffer()).toString('latin1'));

    let choices = [];

    let data = res.split("[");

    for(var i =3, min = Math.min(8 * 2, data.length); i < min; i+=2) {
      let choice = data[i].split('"')[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)))

      if(choice) {
        choices.push({
          name: choice,
          value: choice
        })
      }
    }

    interaction.result(choices);
  }
};
