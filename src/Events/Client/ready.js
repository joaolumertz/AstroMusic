const Event = require('../../Handlers/Event')


module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "ready",
      once: true
    })
  }
  run = async () => {

    console.log("Bot foi iniciado com sucesso.")

    let i = 0;

    const stats = async () => {
      switch(i) {
        case 0 : 
        this.client.user.setPresence({
          status: "online",
          activities: [
            {
              name: `${Intl.NumberFormat('pr-BR', { notation: 'compact', compactDisplay: 'short' }).format(await this.client.guilds.cache.size)} servidor(es)`, 
              type: 'WATCHING'
            }
          ]
        });
        break;
        case 1 :
          let users = 0;
          await this.client.guilds.cache.forEach((guild) => { users += guild.memberCount })
          this.client.user.setPresence({
            status: "online",
            activities: [ 
              {
                name: `com ${Intl.NumberFormat('pr-BR', { notation: 'compact', compactDisplay: 'short' }).format(users)} usiario(s)`, 
                type: 'PLAYING'
              }
            ]
          });
          break;
        case 2 :
          this.client.user.setPresence({
            status: "online",
            activities: [
              {
                name: `${Intl.NumberFormat('pr-BR', { notation: 'compact', compactDisplay: 'short' }).format(await this.client.vulkava.players.size)} músicas`, 
                type: 'LISTENING'
              }
            ]
          });
          break;
        case 3 :
          this.client.user.setPresence({
            status: "online",
            activities: [
              {
                name: `há ${this.client.util.msToDate(process.uptime() * 1e3)}`, 
                type: 'STREAMING'
              }
            ]
          });
          break;
      }
      i = i % 3 + 1
    }

    stats()
    setInterval(() => stats(), 30000)
    
    await this.client.connectLavaLink()
    await this.client.connectToDatabase()
    await this.client.registreCommands()
    await this.client.loadBotCache()

    this.client.vulkava.start(this.client.user.id)
  }
}