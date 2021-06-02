import express from 'express'
import { socketService } from './services/SocketService'
import { Startup } from './Startup'
import { DbConnection } from './db/DbConfig'
import { logger } from './utils/Logger'
import { Server } from 'socket.io'
import { createServer } from 'http'

// create server & socketServer
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const port = process.env.PORT || 3000

// Establish Socket
socketService.setIO(io)
Startup.ConfigureGlobalMiddleware(app)
Startup.ConfigureRoutes(app)

// Connect to Atlas MongoDB
DbConnection.connect()

// Start Server
httpServer.listen(port, () => {
  logger.log(`[SERVING ON PORT: ${port}]`)
})
