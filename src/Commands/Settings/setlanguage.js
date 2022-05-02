const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "setlanguage",
      description: "Mude a linguagem do bot.",
      options: [
        {
          name: "language",
          description: "Selecione a linguagem do bot",
          type: "STRING",
          requried: true,
          choices: [
            { name: "br", value: "pt-BR" },
            { name: "en", value: "en-US" },
          ]
        }
      ]
    })
  }
  run = async (interaction, ls) => {

    const lang = interaction.options.getString('language')

    const data = await this.client.db.guilds.findOne({ _idG: interaction.guild.id })

    switch(lang) {
      case 'pt-BR' : 
        if(data.settings.lang === 'pt-BR') return interaction.reply({ content: "A línguagem do bot já está setada como `pt-BR`." })
        await this.client.db.guilds.findOneAndUpdate({ _idG: interaction.guild.id }, { $set: { 'settings.lang': 'pt-BR' } })
        interaction.reply({ content: "A línguagem do bot foi alterada para **`pt-BR`** com sucesso." })
        break;
      case 'en-US' :
        if(data.settings.lang === 'en-US') return interaction.reply({ content: "The bot language is already set to `en-US`." })
        await this.client.db.guilds.findOneAndUpdate({ _idG: interaction.guild.id }, { $set: { 'settings.lang': 'en-US' } })
        interaction.reply({ content: "Bot language changed to **`en-US`** successfully." })
        break;
    }

  }
}