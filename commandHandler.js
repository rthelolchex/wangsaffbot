module.exports = async (connection, message) => {
    var conn = connection
    var m = message

    // Setup the configurations
    var defaultPrefix = "!"
    var multiPrefix = true
    var command = m.text.slice(defaultPrefix.length).trim().split(/ +/).shift().toLowerCase()
    if (multiPrefix) {
        var prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(command) ? command.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : defaultPrefix
    } else prefix = defaultPrefix

    // Handle the command
    if (m.isBaileys) return

    var args = m.text.trim().split(/ +/).slice(1)
    var isCmd = m.text.startsWith(prefix)

    switch (command) {
        case 'ping':
            conn.sendMessage(m.chat, { text: "Pong! Bot is alive!" }, { quoted: m })
            break
    }
}