import express from 'express'
import Socket from './services/SocketService'
import Startup from './Startup'
import DbContext from './db/DbConfig'
import { logger } from './utils/Logger'
import { Server } from 'socket.io'
import { createServer } from 'http'

// create server & socketServer
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const port = process.env.PORT || 3000

// Establish Socket
Socket.setIO(io)
Startup.ConfigureGlobalMiddleware(app)
Startup.ConfigureRoutes(app)

// Connect to Atlas MongoDB
DbContext.connect()

// Start Server
httpServer.listen(port, () => {
  logger.log(`[SERVING ON PORT: ${port}]`)
})
