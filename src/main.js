import 'dotenv/config'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { mainRouter } from './router/mainRouter.js'
import path from 'path'

const app = express()
const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true,
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/assets', express.static(path.join('./assets')))

app.use(cors(corsOptions))

app.use('/api', mainRouter)

const port = process.env.PORT || 3333

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`)
})
server.on('error', console.error)
