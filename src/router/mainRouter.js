import express from 'express'
import { userRouter } from './routes/userRouter.js'

const router = express.Router()

router.use('/user', userRouter)

export { router as mainRouter }
