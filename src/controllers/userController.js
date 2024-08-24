/* eslint-disable no-unused-vars */

import { ApiResponse } from '../utils/ApiResponse.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db/prisma.js'
import { validateJWT } from '../middleware/validateJWT.js'

export const createUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (
      [name, email, password].some((field) => !field || field.trim() === '')
    ) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, {}, 'All fields are required'))
    }

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (findUser) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            'Email already taken. Please use another email.',
          ),
        )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        username: name,
        email: email,
        password: hashedPassword,
      },
    })

    const { password: _, ...userWithoutPassword } = newUser

    return res
      .status(201)
      .json(
        new ApiResponse(
          true,
          201,
          userWithoutPassword,
          'User registered successfully',
        ),
      )
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, 'Internal Server Error'))
  } finally {
    prisma.$disconnect()
  }
}
export const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    if ([email, password].some((field) => !field || field.trim() === '')) {
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, {}, 'Email and password are required'),
        )
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, {}, 'Invalid email or password'))
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, {}, 'Invalid email or password'))
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      },
    )

    const { password: _, ...userWithoutPassword } = user

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, //! Ensure secure cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          { user: userWithoutPassword, accessToken },
          'Login successful',
        ),
      )
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, 'Internal Server Error'))
  } finally {
    prisma.$disconnect()
  }
}
export const logoutUser = (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, 'Unauthorized request'))
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false, // ! Set to true if HTTPS in production
      sameSite: 'strict',
    })

    return res
      .status(200)
      .json(new ApiResponse(true, 200, null, 'User logged out successfully'))
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, 'Internal Server Error'))
  } finally {
    prisma.$disconnect()
  }
}

export const deleteUser = async (req, res) => {
  try {
    if (req.user) {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      })
      if (user) {
        const deleteUser = await prisma.user.delete({
          where: {
            id: user.id,
          },
        })
        const { password: _, ...userWithoutPassword } = deleteUser
        return res
          .status(200)
          .json(
            new ApiResponse(
              true,
              200,
              userWithoutPassword,
              'User has been deleted',
            ),
          )
      }
    }
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, 'Internal Server Error'))
  } finally {
    prisma.$disconnect()
  }
  return res.status(404).json(new ApiResponse(false, 404, {}, 'User not found'))
}

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies?.accessToken

    const decodedToken = validateJWT(token)

    if (!decodedToken) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, 'Unauthorized request'))
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, 'Invalid Access Token'))
    }

    res.status(200).json(new ApiResponse(true, 200, user, 'User authenticated'))
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(false, 401, null, 'Invalid access token'))
  }
}

export const getUserById = async (req, res) => {
  const userId = req.params.id
  const user = await prisma.user.findFirst({
    where: {
      id: String(userId),
    },
  })
  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return res
      .status(200)
      .json(new ApiResponse(true, 200, userWithoutPassword, 'User found'))
  }
  return res.status(404).json(new ApiResponse(false, 404, {}, 'User not found'))
}
