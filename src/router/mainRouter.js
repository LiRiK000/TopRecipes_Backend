import express from 'express'
import { recipeRouter } from './routes/recipeRouter.js'
import { userRouter } from './routes/userRouter.js'

const router = express.Router()

router.use('/user', userRouter)
router.use('/recipe', recipeRouter)

export { router as mainRouter }
