const { Client } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const { connect } = require('mongoose')

const Models = require('../Database/schemas/Models.js')
const Util = require('../utils/Util')
const NewBot = require('./Vulkava')
const { request } = require('undici')

module.exports = class extends Client {
  constructor(options) {
    super(options)

    this.commands = []
    this.loadCommands()
    this.loadEvents()
    this.connectLavaLink()
    this.guildCache = new Map()
    this.util = Util
    this.request = request
  }

  registreCommands() {
    this.application?.commands.set(this.commands)
  }

  loadCommands(path = 'src/Commands') {
    const categories = readdirSync(path)

    for (let category of categories) {
      const commands = readdirSync(`${path}/${category}`)

      for(const command of commands) {
        const commandClass = require(join(process.cwd(), `${path}/${category}/${command}`))
        const cmd = new (commandClass)(this)

        this.commands.push(cmd)
      }
    }
  }

  loadEvents(path = 'src/Events') {
    const categories = readdirSync(path)

    for (let category of categories) {
      const events = readdirSync(`${path}/${category}`)

      for(let event of events) {
        const eventClass = require(join(process.cwd(), `${path}/${category}/${event}`))
        const evnt = new (eventClass)(this)

        if(!evnt.once) {
          this.on(evnt.name, evnt.run)
        } else {
          this.once(evnt.name, evnt.run)
        }
      }
    }
  }

  async connectToDatabase() {
    const connection = await connect(process.env.MONGOOSE, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Database conectada com sucesso!', "log")
    this.db = { connection, ...Models }
  }

  async connectLavaLink() {
    const portNodes = Number(process.env.PORT) || 80
    const nodes  = [
      {
        id: "Saturno",
        hostname: process.env.SATURNOHOST,
        port: portNodes,
        password: process.env.PASSWORDLAVALINK,
        maxRetryAttempts: 5,
        retryAttemptsInterval: 6000,
        secure: false,
        region: 'USA',
        resumeKey: 'AstroBot'
      },
      {
        id: "Júpiter",
        hostname: process.env.JUPITERHOST,
        port: 80,
        password: process.env.PASSWORDLAVALINK,
        maxRetryAttempts: 5,
        retryAttemptsInterval: 6000,
        secure: false,
        region: 'USA',
        resumeKey: 'AstroBot'
      },
      {
        id: "Netuno",
        hostname: process.env.NETUNOHOST,
        port: 80,
        password: process.env.PASSWORDLAVALINK,
        maxRetryAttempts: 5,
        retryAttemptsInterval: 6000,
        secure: false,
        region: 'USA',
        resumeKey: 'AstroBot'
      },
      {
        id: "Plutão",
        hostname: process.env.PLUTAOHOST,
        port: 80,
        password: process.env.PASSWORDLAVALINK,
        maxRetryAttempts: 5,
        retryAttemptsInterval: 6000,
        secure: false,
        region: 'USA',
        resumeKey: 'AstroBot'
      },
    ]

    this.vulkava = new NewBot(this, nodes)
  }

  async loadBotCache() {
    const guildsDB = await this.db.guilds.find({});

    this.guilds.cache.forEach((guild) => {
      const guildData = guildsDB.find(g => g._idG === guild.id);

      this.guildCache.set(guild.id, {
        djRole: guildData?.settings.djRole ?? '',
      });
    });
  }
}