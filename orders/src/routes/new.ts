import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequestHandler,
} from '@kansotickets/common'
import { body } from 'express-validator'
import express, { Request, Response } from 'express'
import mongoose from 'mongoose'

import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

// an instance of express Router
const router = express.Router()

/**
 * the custom validation check creates a kind of a strong assumption about the db storing the ticket
 */
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      .custom((input) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('ticketId must be provided'),
  ],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const EXPIRATION_WINDOW_SECONDS = (process.env
      .EXPIRATION_WINDOW_SECONDS as unknown) as number
    console.log(`orders EXPIRATION_WINDOW_SECONDS:${EXPIRATION_WINDOW_SECONDS}`)
    const { ticketId } = req.body

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      throw new NotFoundError()
    }

    // Make sure that ticket is not reserved
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved dude')
    }

    // Calculate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      expiresAt: expiration,
      status: OrderStatus.Created,
      ticket: ticket,
    })

    await order.save()

    // Publish an event saying that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id!,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(),
      status: order.status,
      userId: order.userId,
      ticket: {
        id: ticket.id!,
        price: ticket.price,
      },
    })

    res.status(201).send(order)
  },
)

export { router as createOrderRouter }
