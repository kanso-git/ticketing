import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequestHandler,
} from '@kansotickets/common'
import mangoose from 'mongoose'
import express, { Request, Response } from 'express'
import { stripe } from '../stripe'
import { body } from 'express-validator'

import { Order } from '../models/order'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

/**
 * in order to create a charge
 * - the request user should be authenticated
 * - the request should have a valid orderId and a valid token
 * - the order exists in the db
 * - the order user is the same as the request user
 * - the order status is not cancelled
 * some token values:
 *  - tok_mastercard
 *  - tok_visa
 *  - tok_amex
 */
router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').notEmpty(),
    body('orderId').notEmpty(),
    body('orderId').custom((input) => mangoose.isValidObjectId(input)),
  ],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body
    const order = await Order.findById(orderId)
    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError('You are not authorized')
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError(
        'Cannot pay for a cancelled order ya a5o el chien ',
      )
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'chf',
      source: token,
      description: 'My First Test Charge (created for API docs)',
    })

    console.log(charge)
    /**
     * after a successful payment insert a payment record
     */
    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id,
    })

    await payment.save()
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    })

    res.status(201).send({ success: true })
  },
)

export { router as createChargeRouter }
