import {
  createUser,
  deleteUser,
  getUserById,
  loginUser,
  logoutUser,
} from '../../controllers/userController.js'

import express from 'express'
import { verifyJWT } from '../../middleware/auth.middleware.js'

const userRouter = express.Router()

userRouter.post('/create', createUser)
userRouter.post('/login', loginUser)
userRouter.get('/:id', getUserById)
userRouter.post('/logout', verifyJWT, logoutUser)
userRouter.delete('/delete', verifyJWT, deleteUser)

export { userRouter }
