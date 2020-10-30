import { requireAuth } from '@kansotickets/common'
import express, { Request, Response } from 'express'
import { Order } from '../models/order'

// an instance of express Router
const router = express.Router()

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const userOrders = await Order.find({ userId: req.currentUser!.id }).populate(
    'ticket',
  )
  res.status(200).send(userOrders)
})

export { router as showOrdersRouter }
