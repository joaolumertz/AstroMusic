const Command = require('../../Handlers/Command')
const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageCollector, MessageButton, MessageAttachment, Util } = require("discord.js")
const { loadImage, registerFont, createCanvas } = require("canvas");
const User = require('../../../src/Database/schemas/Models/Users')
const Utils = require("../../utils/Util");
const Emojis = require("../../utils/Emojis");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "Veja seu perfil com algumas informações",
      options: [
        {
          name: "user",
          type: "USER",
          description: "Mencione um usuário para ver seu perfil",
          required: false
        }
      ]
    })
  }
run = async (interaction) => {

let USER = interaction.options.getUser('user') || interaction.user;
      let user = await User.findOne({ _idU: USER.id });
const canvas = createCanvas(900, 600);
    const ctx = canvas.getContext("2d");

    //========================// Import Avatar //========================//

    const avatar = await loadImage(
      USER.displayAvatarURL({ format: "jpeg", size: 2048 })
    );
    ctx.drawImage(avatar, 20, 90, 195, 180);

    //========================// Import Background //========================//

    const bg = user.backgrounds.active;

    const backgrounds = {
      /*
      one: {
        id: 1,
        background: "./src/assets/img/png/Profile_Card_Green.png",
      },
      two: {
        id: 2,
        background: "./src/assets/img/png/Profile_Card_Purple.png",
      },
      three: {
        id: 3,
        background: "./src/assets/img/png/Profile_Card_Different.png",
      },
*/
    };

    let back_img = "https://media.discordapp.net/attachments/967146435873234980/967430449947377704/1650723809733.png";
    if (bg === 0) back_img = "https://media.discordapp.net/attachments/967146435873234980/967430449947377704/1650723809733.png";
    else {
      back_img = Object.entries(backgrounds).find(([, x]) => x.id === bg)[1]
        .background;
    }

    const back = await loadImage(back_img);
    ctx.drawImage(back, 0, 0, 900, 600);

    //========================// Texts //========================//

    // Username

    ctx.textAlign = "left";
    ctx.font = '50px "Arial"';
    ctx.fillStyle = "rgb(253, 255, 252)";
    await Utils.renderEmoji(ctx, this.shorten(USER.username, 20), 230, 190);

    // Badges

    let list = [];

    /*
    const flags = USER.flags === null ? "" : USER.flags.toArray()
    list.push(flags)*/

    //if (user.marry.has) list.push("CASADO");
    if (USER.id === process.env.OWNER_ID) list.push("DONO");
    //if (message.guild.owner.id === USER.id) list.push("SERVER_OWNER");
    //if (user.vip.hasVip) list.push("VIP");

    list = list
      .join(",")
      /*.replace("EARLY_VERIFIED_DEVELOPER", Emojis.Verified_Developer)
    .replace("HOUSE_BRAVERY", Emojis.Bravery)
    .replace("HOUSE_BRILLIANCE", Emojis.Brilliance)
    .replace("HOUSE_BALANCE", Emojis.Balance)
    .replace("VERIFIED_BOT", Emojis.Verified_Bot)
    .replace("VERIFIED_DEVELOPER", "")*/
      .replace("CASADO", "💍")
      .replace("DONO", "👨‍💻")
      .replace("SERVER_OWNER", "👑")
      .replace("VIP", "🌌");

    ctx.font = `30px "Arial"`;

    await Utils.renderEmoji(ctx, list.split(",").join(" "), 230, 240);

    // Titles

    /*
    ctx.textAlign = "left";
    ctx.font = '30px "Segoe UI Black"';
    ctx.fillStyle = "rgb(253, 255, 252)";
    ctx.fillText("Coins", 190, 90);
    ctx.fillText("XP", 190, 155);

    ctx.textAlign = "center";
    ctx.font = '20px "Segoe UI Black"';
    if (user.marry.has) {
      ctx.fillText("Casado com o(a)", 600, 90);
      ctx.fillText(
        await this.client.users.fetch(user.marry.user).then((x) => x.tag),
        600,
        120
      );
    }
    // Coins/XP

    ctx.textAlign = "left";
    ctx.font = '30px "Segoe UI"';
    ctx.fillStyle = "rgb(253, 255, 252)";
    ctx.fillText(`${Utils.toAbbrev(user.coins)}`, 190, 120);
    ctx.fillText(
      `#${user.Exp.level} | ${Utils.toAbbrev(user.Exp.xp)}/${Utils.toAbbrev(
        nextLevel
      )}`,
      190,
      185
    );
*/
    // Sobre

    ctx.font = '20px "Arial"';
    ctx.fillText(
      user.about == "null"
        ? `Use /sobremim <msg> para alterar essa mensagem`
        : "Belo pau",
      65,
      333
    );

    //========================// Create Image //========================//

    const attach = new MessageAttachment(
      canvas.toBuffer(),
      `Profile_${USER.tag}_.png`
    );

    interaction.reply({ files: [attach]});
  }
  shorten(text, len) {
    if (typeof text !== "string") return "";
    if (text.length <= len) return text;
    return text.substr(0, len).trim() + "...";
  }
};