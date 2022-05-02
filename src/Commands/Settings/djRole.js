const { Permissions } = require('discord.js')
const Command = require('../../Handlers/Command')

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "djrole",
      description: "〔⚙ • Config〕Seta o cargo de DJ",
      permissions: [Permissions.FLAGS.MANAGE_ROLES],
      options: [
        {
          name: "cargo",
          description: "Informe o cargo",
          type: "ROLE",
        },
        {
          name: "opcao",
          description: "Selecione a opção para remover",
          type: "STRING",
          choices: [
            {
              name: "Remover",
              value: "remove"
            }
          ]
        }
      ]
    })
  }
  run = async (interaction) => {

    const { options } = interaction
    const role = options.getRole('cargo')

    const data = await this.client.guildCache.get(interaction.guild.id)
    
    switch(options.getString('opcao')) {
      case 'remove' : {
        const dbData = await this.client.db.guilds.findOne({ _idG: interaction.guild.id })
        if(!data?.djRole || !dbData.settings.djRole) {
          await interaction.reply({ content: "Nenhum cargo de DJ setado use \`/djrole\` para setar um cargo de DJ.", ephemeral: true })
          return;
        } else {

          await interaction.reply({ content: "Cargo de DJ Removido" })

          if(data || dbData) {
            data.djRole = ''
            await this.client.db.guilds.findOneAndUpdate({ _idG: interaction.guild.id }, { $set: { 'settings.djRole': '' }})
          } else {
            await this.client.db.guilds.create({ _idG: interaction.guild.id, settings: { djRole: '' }})
          }
          return
        }    
      } 
    }
    
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
          await this.client.db.guilds.findOneAndUpdate({ _idG: interaction.guild.id }, { $set: { 'settings.djRole': '' }})
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