import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequestHandler,
} from '@kansotickets/common'
import express, { Request, Response } from 'express'
import { param, body } from 'express-validator'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { Ticket } from '../models/ticket'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    param('id').notEmpty().withMessage('Id must be provided'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title can't be empty"),
    body('price')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      throw new NotFoundError()
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket')
    }
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError(
        'You are not authorized to perform this update operation',
      )
    }

    ticket.set({
      title: req.body.title || ticket.title,
      price: req.body.price || ticket.price,
    })
    /**
     * some reflections about some corner use cases
     * 1- corner use case: what if the publish event is failed
     *
     * a solutions to encounter this corner use case 1
     * 1- when an event failed to publish , store the event in db with sent flag to false
     * 2- add a seperate process that listens on this db and make sure to re-publish the event not sent
     *
     * 1.1- corner use case: what if the publish event is failed to publish and to save in db
     * a solutions to encounter this corner use case 1.1
     * 1- wrap the inserts [ticket + event ] in one transaction to ensure data integrity
     */

    await ticket.save()
    // publish en event on topic ticket:updated
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    })

    res.status(200).send({ ticket })
  },
)

export { router as updateTicketRouter }
