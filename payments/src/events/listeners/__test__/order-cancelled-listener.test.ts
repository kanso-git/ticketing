import { OrderCancelledEvent, OrderStatus } from '@kansotickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

async function setup() {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds() + 300)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  })
  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
    version: 1,
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

it('cancelled the order ', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const order = await Order.findById(data.id)
  expect(order!.id).toBe(data.id)
  expect(order!.status).toBe(OrderStatus.Cancelled)
})

it('acks the message once order has been cancelled', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const order = await Order.findById(data.id)
  expect(order!.id).toBe(data.id)
  expect(msg.ack).toHaveBeenCalled()
})
