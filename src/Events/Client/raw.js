const Event = require('../../Handlers/Event')

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'raw'
    })
  }
  run = async (packet) => {
    this.client.vulkava.handleVoiceUpdate(packet)
  }
}