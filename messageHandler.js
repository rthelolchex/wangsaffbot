// Load the helpers
const {
    getContentType,
    isJidGroup,
    isJidBroadcast,
    extractMessageContent,
    areJidsSameUser
} = require("@adiwajshing/baileys")
const fs = require("fs")

/**
 * Handle the messages properly
 * @param {*} connection 
 * @param {*} message 
 */
module.exports = async (connection, message) => {
    if (!message.messages[0]) return
    let m = message.messages[0]
    if (m.key) {
        m.chat = m.key?.remoteJid
        m.chatType = isJidGroup(m.chat) ? "group" : isJidBroadcast(m.chat) ? "broadcast" : "private"
        m.fromMe = m.key?.fromMe || false
    }
    if (m.message) {
        m.type = getContentType(m.message)
        m.content = extractMessageContent(m.message)[m.type]
        if (m.type === 'ephemeralMessage') {
            m.type = getContentType(m.message[m.type].message)
            m.content = extractMessageContent(m.message['ephemeralMessage'].message)[m.type]
        }
        if (m.content?.contextInfo) {
            m.mentionedJid = m.content.contextInfo ? m.content.contextInfo?.mentionedJid : []
            let quoted = m.quoted = m.content.contextInfo ? m.content.contextInfo.quotedMessage : null
            if (m.quoted) {
                let quotedType = getContentType(m.quoted)
                m.quoted = extractMessageContent(m.quoted)[quotedType]
                if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
                m.quoted.type = quotedType
                m.quoted.id = m.content.contextInfo?.stanzaId || ''
                m.quoted.chat = m.content.contextInfo?.remoteJid || m.chat || ''
                m.quoted.sender = m.content.contextInfo?.participant
            }
        }
        m.text = m.quoted?.text ? m.quoted?.text : 
            m.content?.caption ? m.content?.caption : 
                m.content?.text ? m.content?.text : 
                    typeof m.content === 'string' ? m.content : ""
    }
    console.log(m)

    // Load the command handler
    require('./commandHandler')(conn, m)
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  conn.logger.info("'messageHandler.js' has been changed, reloading.")
  delete require.cache[file]
  require(file)
})