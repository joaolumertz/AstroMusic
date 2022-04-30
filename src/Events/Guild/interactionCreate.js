const Event = require('../../Handlers/Event')

const devsID = [
  "518207099302576160"
]

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate'
    })
  }
  run = async (interaction) => {
    
    if(interaction.isCommand()) {
      if(!interaction.guild) return;

      const cmd = this.client.commands.find(c => c.name === interaction.commandName)

      const user = await this.client.db.users.findOne({ _idU: interaction.user.id })
      
      const guildDb = await this.client.db.guilds.findOne({ _idG: interaction.guild.id })

      
      if(cmd) {
        if(!user) {
          await this.client.db.users.create({ _idU: interaction.user.id })
          return interaction.reply({ content: "Opa, parece que você não está registrado em meu banco de dados.\nAcabei de te registrar com sucesso!", ephemeral: true })
        }
        
        if(!guildDb) {
          await this.client.db.users.create({ _idG: interaction.guild.id })
          return interaction.reply({ content: "Opa, parece que este servidor não está registrado no meu banco de dados.\nAcabei de registrar com sucesso!", ephemeral: true })
        }
        
        if(cmd.onlyDevs) {
          if(devsID.indexOf(interaction.user.id) < 0)
          return interaction.reply({ content: "Este comando está só disponível para meus devs."})
        }
        
        const ls = await guildDb.settings.lang

        if(!interaction.member.permissions.has(cmd.permissions)) return interaction.reply({ content: "Você não possui permissão para utilizar este comando.", ephemeral: true})
        
        cmd.run(interaction, ls)
      }
    }
  }
}