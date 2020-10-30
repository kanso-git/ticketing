import {
  OrderCreatedEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from '@kansotickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'

async function setup() {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    price: 10,
    title: '3anzeh 7alabieh',
    userId: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()

  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds() + 300)

  const data: OrderCreatedEvent['data'] = {
    expiresAt: expiration.toISOString(),
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price,
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

it('updates the ticket with the orderId', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const ticket = await Ticket.findById(data.ticket.id)

  expect(ticket!.orderId).toBe(data.id)
})

it('acks the message once ticket has been updated', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const ticket = await Ticket.findById(data.ticket.id)
  expect(ticket!.orderId).toBe(data.id)
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated evenet', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const ticket = await Ticket.findById(data.ticket.id)
  expect(ticket!.orderId).toBe(data.id)
  expect(msg.ack).toHaveBeenCalled()

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedEventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  ) as TicketUpdatedEvent['data']

  console.log(ticketUpdatedEventData)
  expect(ticketUpdatedEventData.version).toBe(ticket!.version)
  expect(ticketUpdatedEventData!.orderId).toBe(ticket!.orderId)
})
