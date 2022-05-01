const Event = require('../../Handlers/Event')
const mosaic = require('../../utils/mosaic');
const c = require("colors");
const    
bright = "\x1b[1m",
blink = "\x1b[5m",
preto = "\x1b[30m",
vermelho = "\x1b[31m",
verde = "\x1b[32m",
amarelo = "\x1b[33m",
azul = "\x1b[34m",
roxo = "\x1b[35m",
ciano = "\x1b[36m",
branco = "\x1b[37m",

//CORES EM BG
BGpreto = "\x1b[40m",
BGvermelho = "\x1b[41m",
BGgreen = "\x1b[42m",
BGyellow = "\x1b[43m",
BGblue = "\x1b[44m",
BGmagenta = "\x1b[45m",
BGcyan = "\x1b[46m",
BGwhite = "\x1b[47m"

colorful = (color, string, reset = '\x1b[0m') => color + string + reset;


module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "ready",
      once: true
    })
  }
  run = async () => {

    console.log(colorful(roxo, `―――――――――――――――――― Bot ――――――――――――――――――`))
    console.log(colorful(ciano, `[LOGS] Estou em ${this.client.guilds.cache.size} servidores.
    [LOGS] Cuidando de ${this.client.users.cache.size} membros.
    [LOGS] Administrando ${this.client.channels.cache.size} canais.`))
    console.log(colorful(roxo, `―――――――――――――――――― Bot ――――――――――――――――――`))
    console.log(colorful(ciano, `                ɪɴғᴏʀᴍᴀᴄ̧ᴏ̃ᴇs`))
    console.log(colorful(roxo, `―――――――――――――――――― Bot ――――――――――――――――――`))//daorinha

    console.log(colorful(ciano, `[LOGS] ${this.client.user.tag}
    [LOGS] ${this.client.user.id}
    [LOGS] ${this.client.user.username}
    [LOGS] ${this.client.user.presence.status}`))
    console.log(colorful(roxo, `―――――――――――――――――― Bot ――――――――――――――――――`))
    console.log(c.blue(`${mosaic}`))
    
    let status = [
      `Estou em ${Intl.NumberFormat('pr-BR', { notation: 'compact', compactDisplay: 'short' }).format(this.client.guilds.cache.size)} servidor(es)`,
      `Escutando música com ${Intl.NumberFormat('pr-BR', { notation: 'compact', compactDisplay: 'short' }).format(this.client.users.cache.size)} usiario(s)`,
      `Ouvindo ${Intl.NumberFormat('pr-BR', { notation: 'compact', compactDisplay: 'short' }).format(await this.client.vulkava.players.size)} músicas`,
      `Online há ${this.client.util.msToDate(process.uptime() * 1e3)}`,
    ]

    setInterval(() => {

      let randStatus = status[Math.floor(Math.random() * status.length)]

      this.client.user.setPresence({
        status: 'idle',
        activities: [
          {
            name: randStatus
          }
        ]
      })

    }, 20 * 1000)

    await this.client.connectLavaLink()
    await this.client.connectToDatabase()
    await this.client.registreCommands()
    await this.client.loadBotCache()
    this.client.vulkava.start(this.client.user.id)
  }
}