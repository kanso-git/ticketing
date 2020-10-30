import { requireAuth, validateRequestHandler } from '@kansotickets/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage("Title can't be empty"),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const { title, price } = req.body
    const userId = req.currentUser!.id
    const data = {
      price,
      title,
      userId,
    }
    const ticket = Ticket.build(data)

    await ticket.save()

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    })
    res.status(201).send({ ticket })
  },
)

export { router as createTicketRouter }
