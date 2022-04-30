const Client = require("./Handlers/Client.js")
require('dotenv').config()

// =========================================== //

var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
  res.writeHead(200,{'content-type':'image/gif'});
  fs.createReadStream('load.gif').pipe(res);
}).listen(8080);

// =========================================== //

const client = new Client({
  fetchAllMembers: false,
  failIfNotExists: false,
  allowMentions: {
    parse: ["roles", "users"],
    repliedUser: false
  },
  partials: [
    "MESSAGE",
    "CHANNEL",
    "REACTION",
    "GUILD_MEMBER",
    "USER"
  ],
  intents: [
    "GUILDS",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MESSAGES",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    "GUILD_MEMBERS",
    "GUILD_PRESENCES"
  ]
})

client.la = { }
var langs = fs.readdirSync("./src/Language")
for(const lang of langs.filter(file => file.endsWith(".json"))){
  client.la[`${lang.split(".json").join("")}`] = require(`./Language/${lang}`)
}
Object.freeze(client.la)

process.on('unhandledRejection', (reason, p) => {
  console.log('Erro! -' + reason)
});

client.login(process.env.TOKEN)