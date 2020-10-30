import {
  NotFoundError,
  requireAuth,
  validateRequestHandler,
} from '@kansotickets/common'
import express, { Request, Response } from 'express'
import { body, param } from 'express-validator'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get(
  '/api/tickets/:id',
  [param('id').trim().notEmpty().withMessage("Ticket id can't be empty")],
  validateRequestHandler,
  async (req: Request, res: Response) => {
    const { id } = req.params
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      throw new NotFoundError()
    }
    res.status(200).send({ ticket })
  },
)

export { router as showTicketRouter }
