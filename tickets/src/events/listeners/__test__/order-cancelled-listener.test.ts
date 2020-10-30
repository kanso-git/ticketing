import {
  OrderCancelledEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from '@kansotickets/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

async function setup() {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    price: 10,
    title: '3anzeh 7alabieh',
    userId: mongoose.Types.ObjectId().toHexString(),
  })
  ticket.set({ orderId: 'a5ochien' })
  await ticket.save()

  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds() + 300)

  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id,
    },
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

it('updates the ticket and set its order to null', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const ticket = await Ticket.findById(data.ticket.id)
  expect(ticket!.orderId).toBeNull()
})

it('acks the message once ticket has been updated', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const ticket = await Ticket.findById(data.ticket.id)
  expect(ticket!.orderId).toBeNull()
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  //check ticket and find the orderId
  const ticket = await Ticket.findById(data.ticket.id)
  expect(ticket!.orderId).toBeNull()
  expect(msg.ack).toHaveBeenCalled()

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedEventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  ) as TicketUpdatedEvent['data']

  console.log(ticketUpdatedEventData)
  expect(ticketUpdatedEventData.version).toBe(ticket!.version)
  expect(ticketUpdatedEventData!.orderId).toBe(ticket!.orderId)
})
