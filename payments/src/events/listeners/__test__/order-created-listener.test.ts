import {
  OrderCreatedEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from '@kansotickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'

async function setup() {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds() + 300)

  const data: OrderCreatedEvent['data'] = {
    expiresAt: expiration.toISOString(),
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return {
    listener,
    data,
    msg,
  }
}

it('replicated the order info', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const order = await Order.findById(data.id)
  expect(order!.id).toBe(data.id)
  expect(order!.price).toBe(data.ticket.price)
})

it('acks the message once order has been replicated', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const order = await Order.findById(data.id)
  expect(order!.id).toBe(data.id)
  expect(msg.ack).toHaveBeenCalled()
})
