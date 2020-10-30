import {
  ExpirationCompleteEvent,
  OrderStatus,
  OrderCancelledEvent,
} from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { Ticket } from '../../../models/ticket'
import { Order } from '../../../models/order'

async function setup() {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    price: 10,
    title: '3anzeh',
    id: mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save()

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  })

  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, data, msg }
}
it('invoks the onMessage function and canncel the order', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const t = await Order.findById(data.orderId)
  expect(t!.status).toBe(OrderStatus.Cancelled)
})

it('publishs an order cancelled event', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const order = await Order.findById(data.orderId)

  expect(order!.status).toBe(OrderStatus.Cancelled)
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const orderCanncelledEventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  ) as OrderCancelledEvent['data']

  console.log(orderCanncelledEventData)
  expect(orderCanncelledEventData.version).toBe(order!.version)
  expect(orderCanncelledEventData!.id).toBe(data.orderId)
})

it('aks the message', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const t = await Order.findById(data.orderId)
  expect(t!.status).toBe(OrderStatus.Cancelled)
  expect(msg.ack).toBeCalled()
})
