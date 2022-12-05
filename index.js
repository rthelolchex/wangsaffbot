const {
    default: initWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
} = require('@adiwajshing/baileys')

const logger = require("pino")({
    transport: {
        target: "pino-pretty",
        options: {
            levelFirst: true,
            ignore: "hostname",
            translateTime: true
        }
    }
}).child({ class: "Baileys" })
const { Boom } = require('@hapi/boom')
const fs = require('fs')

// Prevent to crash if error occured
process.on('uncaughtException', console.error)

const initConnection = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("sessions")
    const { version, isLatest } = await fetchLatestBaileysVersion()
    logger.info(`connecting using version ${version.join(`.`)}, latest: ${isLatest}`)

    // init the events
    global.conn = initWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: logger,
        version
    })

    conn.logger = logger

    conn.ev.on("connection.update", update => {
        var { connection, lastDisconnect } = update
        if (connection === 'close') {
            logger.info("conection lost, reconnecting for a few seconds...")
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                initConnection()
            } else { 
                logger.error("Disconnected from server because you're logged out, please regenerate a new session.")
                conn.logout()
                fs.unlinkSync("./sessions")
                process.exit()
            }
        }
    })

    conn.ev.on("creds.update", saveCreds)

    conn.ev.on("messages.upsert", messages => {
        require('./messageHandler')(conn, messages)
    })
    return conn
}

initConnection().catch(e => console.log(e))