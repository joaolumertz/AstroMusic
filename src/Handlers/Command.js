class Command {
  constructor(client, options) {
    this.client = client
    this.name = options.name
    this.description = options.description
    this.options = options.options
    this.permissions = options.permissions || []
    this.onlyDevs = options.onlyDevs || false
  }
}

module.exports = Command