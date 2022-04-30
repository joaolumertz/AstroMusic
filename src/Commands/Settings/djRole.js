const { Permissions } = require('discord.js')
const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "djrole",
      description: "Seta o cargo de DJ",
      permissions: [Permissions.FLAGS.MANAGE_ROLES],
      options: [
        {
          name: "cargo",
          description: "Selecione o cargo.",
          type: "ROLE",
        }
      ]
    })
  }
  run = async (interaction) => {

    const { options } = interaction
    const role = options.getRole('cargo')

    const data = await this.client.guildCache.get(interaction.guild.id)
    if(!role) {
      if(!data?.djRole) {
        interaction.reply({ content: "Nenhum cargo de DJ setado use \`/djrole\` para setar um cargo de DJ.", ephemeral: true })
        return;
      }


      const djRole = interaction.guild.roles.cache.get(data.djRole);

      if(!djRole) {
        data.djRole = ''
        const dbData = await this.client.db.guilds.findOne({ _idG: interaction.guild.id })

        if(dbData) {
          dbData.settings.djRole = '';
          dbData.save();
          interaction.reply({ content: "Nenhum cargo de DJ setado use \`/djrole\` para setar um cargo de DJ.", ephemeral: true })          
        }
        return;
      }

      interaction.reply({ content: `Cargo atual de DJ: ${djRole.name}`, ephemeral: true })
      return;
    }

    if(data) data.djRole = role.id

    const dbData = await this.client.db.guilds.findOne({ _idG: interaction.guild.id })

    if(dbData) {
      await this.client.db.guilds.findOneAndUpdate({ _idG: interaction.guild.id }, { $set: { 'settings.djRole': role.id }})
    } else {
      await this.client.db.guilds.create({ _idG: interaction.guild.id, settings: { djRole: role.id }})
    }

    interaction.reply({ content: `Cargo de DJ setada como \`${role.name}\``})

  }
}