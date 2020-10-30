import { TicketCreatedEvent } from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedListener } from '../ticket-created-listener'
import { Ticket } from '../../../models/ticket'

async function setup() {
  const listener = new TicketCreatedListener(natsWrapper.client)
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: '3anzeh',
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, data, msg }
}
it('invoks the onMessage function and creates the ticket', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const t = await Ticket.findById(data.id)
  expect(t!.id).toBe(data.id)
})

it('aks the message', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const t = await Ticket.findById(data.id)
  expect(t!.id).toBe(data.id)
  expect(msg.ack).toBeCalled()
})
