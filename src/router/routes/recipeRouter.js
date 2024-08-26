import {
  createRecipe,
  getAllUserRecipes,
} from '../../controllers/recipesController.js'

import express from 'express'
import { verifyJWT } from '../../middleware/auth.middleware.js'

const recipeRouter = express.Router()

recipeRouter.use(verifyJWT)

recipeRouter.post('/create', createRecipe)
recipeRouter.get('/', getAllUserRecipes)

export { recipeRouter }
