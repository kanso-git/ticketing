import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequestHandler,
} from '@kansotickets/common'
import express, { Request, Response } from 'express'
import { param } from 'express-validator'
import { Order } from '../models/order'
import mongoose from 'mongoose'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'
// an instance of express Router
const router = express.Router()

/**
 * Delete /api/orders/:orderId
 * set order status to cancelled
 * Assumptions:
 *  orderId must be provided
 *  orderId must be valid
 *  order belogns to the logged user
 *
 */
router.delete(
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
      throw new NotAuthorizedError(
        'You are not authorized to delete this order',
      )
    }
    order.status = OrderStatus.Cancelled
    await order.save()

    // publish an order cancelled event

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    })

    res.sendStatus(204)
  },
)

export { router as deleteOrderRouter }
