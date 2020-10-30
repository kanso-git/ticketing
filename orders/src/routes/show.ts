import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequestHandler,
} from '@kansotickets/common'
import { param } from 'express-validator'
import express, { Request, Response } from 'express'
import { Order } from '../models/order'
import mongoose from 'mongoose'

// an instance of express Router
const router = express.Router()

/**
 * GET /api/orders/:orderId
 * A logged user can show a specific order
 * Assumptions:
 *  orderId must be provided
 *  orderId must be valid
 *  order belogns to the logged user
 */

router.get(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId').notEmpty().withMessage('orderId param must provided'),
    param('orderId')
      .custom((input) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('orderId must be valid'),
  ],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')
    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError('Unauthorized access')
    }
    res.status(200).send(order)
  },
)

export { router as showOrderRouter }
