import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { BadRequestError, validateRequestHandler } from '@kansotickets/common'
import { User } from '../models/user'
import { JwtUtils } from '../services/jwt-utils'
import { Password } from '../services/password'

const router = express.Router()

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be vaid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password ya a5o el chien'),
  ],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials')
    }

    const isPasswordMatch = await Password.compare(
      existingUser.password,
      password,
    )
    if (!isPasswordMatch) {
      throw new BadRequestError('Invalid credentials')
    }

    // Generate JWT
    const userJwt = JwtUtils.sign({
      id: existingUser.id,
      email: existingUser.email,
    })

    // Store it on session object
    req.session = {
      jwt: userJwt,
    }

    res.status(200).send(existingUser)
  },
)

export { router as signinRouter }
