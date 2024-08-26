import { ApiResponse } from '../utils/ApiResponse.js'
import { prisma } from '../config/db/prisma.js'

export const createRecipe = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, 'Unauthorized'))
    }

    const findUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    })
    if (!findUser) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, 'User not found'))
    }
    const { title, desc, ingredients } = req.body

    if (!title || !desc) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, null, 'All fields are required'))
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        desc,
        ingredients,
        creatorId: findUser.id,
      },
      select: {
        title: true,
        ingredients: true,
        desc: true,
      },
    })
    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, newRecipe, 'Recipe created successfully'),
      )
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, 'Internal Server Error'))
  } finally {
    prisma.$disconnect()
  }
}

export const getAllUserRecipes = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, 'Unauthorized'))
    }
    const findUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    })
    if (!findUser) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, 'User not found'))
    }
    const recipes = await prisma.recipe.findMany({
      where: {
        creatorId: findUser.id,
      },
      select: {
        title: true,
        ingredients: true,
        desc: true,
      },
    })
    if (recipes) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            true,
            200,
            recipes,
            'User recipes retrieved successfully',
          ),
        )
    } else {
      return res
        .status(404)
        .json(
          new ApiResponse(false, 404, null, 'No recipes found for this user'),
        )
    }
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, 'Internal Server Error'))
  } finally {
    prisma.$disconnect()
  }
}
