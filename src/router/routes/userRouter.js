import {
  createUser,
  getUserById,
  loginUser,
  logoutUser,
} from '../../controllers/userController.js'

import express from 'express'
import { verifyJWT } from '../../middleware/auth.middleware.js'

const userRouter = express.Router()

userRouter.post('/create', createUser)
userRouter.post('/login', loginUser)
userRouter.post('/logout', verifyJWT, logoutUser)
userRouter.get('/:id', getUserById)

export { userRouter }
